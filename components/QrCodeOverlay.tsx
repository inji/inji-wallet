import React, {useContext, useEffect, useRef, useState} from 'react';
import {Modal, Pressable, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainBottomTabParamList} from '../routes/routeTypes';
import {BOTTOM_TAB_ROUTES} from '../routes/routesConstants';
import QRCode from 'react-native-qrcode-svg';
import {Theme} from './ui/styleUtils';
import {useTranslation} from 'react-i18next';
import testIDProps from '../shared/commonUtil';
import {SvgImage} from './ui/svg';
import {NativeModules, Platform} from 'react-native';
import {VerifiableCredential} from '../machines/VerifiableCredential/VCMetaMachine/vc';
import {DEFAULT_ECL, MAX_QR_DATA_LENGTH} from '../shared/constants';
import {compactVcForQr} from '../shared/qr/compactVcForQr';
import {buildMdocDeviceEngagementQrForVc} from '../shared/mdoc/buildMdocQrData';
import {loadOrCreateMdocProximityQrPayload} from '../shared/mdoc/mdocProximitySessionCoordinator';
import {logMdocProximitySessionDiagnostics} from '../shared/mdoc/mdocProximitySessionStore';
import {VCMetadata} from '../shared/VCMetadata';
import {VCFormat} from '../shared/VCFormat';
import {
  buildIso18013PresentmentParamsForVc,
  nativeMdocProximityPresentmentAvailable,
} from '../shared/mdoc/mdocProximityPresentmentBridge';
import {
  approveIso18013PresentmentConsent,
  denyIso18013PresentmentConsent,
  MdocPresentmentConsentElement,
  MdocPresentmentConsentRequest,
  startIso18013ProximityPresentment,
  stopIso18013ProximityPresentment,
  subscribeMdocPresentmentCannotSatisfy,
  subscribeMdocPresentmentConsentDismissed,
  subscribeMdocPresentmentConsentRequired,
  subscribeMdocPresentmentReaderConnected,
  subscribeMdocPresentmentResponseSent,
} from '../shared/mdoc/iso18013PresentmentInterop';
import {shareImageToAllSupportedApps} from '../shared/sharing/imageUtils';
import {ShareOptions} from 'react-native-share';
import {GlobalContext} from '../shared/GlobalContext';
import {ActivityLogEvents} from '../machines/activityLog';
import {VCActivityLog} from './ActivityLogEvent';
import {MdocShareFlow} from './mdocShare/MdocShareFlow';
import {
  buildShareSummary,
  deriveMdocShareStep,
  getMdocDocType,
  getMdocElementValues,
  getMdocHolderName,
  getCredentialTypeMismatch,
  getMdocIssuingAuthority,
  isSessionStep,
  MDL_DOC_TYPE,
  MdocCredentialTypeMismatch,
  MdocShareResult,
  PurposesResponse,
  resolveVerifierName,
} from './mdocShare/mdocShareUtils';

/**
 * Logs the verifier's "Information requested" set on the way in, mirroring the prettified
 * purposes logging. `requestedElements` is everything the verifier asked for; `elements` is the
 * narrowed set the wallet can actually serve, so anything requested-but-not-servable is called
 * out explicitly rather than silently missing from the response.
 */
function logIncomingInformationRequested(
  request: MdocPresentmentConsentRequest,
) {
  const requested = request.requestedElements ?? [];
  const summary = {
    verifier: request.verifierName || '(unknown)',
    docType: request.docType,
    requestedCount: requested.length || request.elements.length,
    willDiscloseCount: request.elements.length,
    requested: (requested.length > 0
      ? requested
      : request.elements.map(e => ({...e, servable: true, servedAs: null}))
    ).map(item => ({
      namespace: item.namespace,
      element: item.element,
      intentToRetain: item.intentToRetain,
      willDisclose: item.servable,
      ...(item.servedAs ? {servedAsWalletElement: item.servedAs} : {}),
    })),
  };
  console.log(
    '[DEBUG] Incoming information requested from verifier:\n' +
      JSON.stringify(summary, null, 2),
  );
  const dropped = requested.filter(item => !item.servable);
  if (dropped.length > 0) {
    console.log(
      `[DEBUG] Requested but NOT in this credential (verifier will see these as missing): ${dropped
        .map(item => `${item.namespace}/${item.element}`)
        .join(', ')}`,
    );
  }
}

/** Logs the elements actually going back to the verifier in the DeviceResponse. */
function logOutgoingInformationRequested(
  elements: MdocPresentmentConsentElement[],
) {
  const disclosed = elements.map(item => ({
    namespace: item.namespace,
    element: item.element,
    intentToRetain: item.intentToRetain,
  }));
  console.log(
    '[DEBUG] Outgoing information requested to verifier:\n' +
      JSON.stringify({disclosedCount: disclosed.length, disclosed}, null, 2),
  );
}

/**
 * DIAGNOSTIC TOGGLE — remove once the verifier freeze is understood.
 *
 * `false` sends a spec-standard ISO 18013-5 DeviceResponse. `true` (the current product
 * behaviour) makes native add a non-standard top-level `purposes` key to the DeviceResponse
 * CBOR map, see InjiIso18013ProximityPresenter.kt injection block.
 *
 * Flip to false to test whether a strict reader is choking on that extra key.
 */
const SEND_PURPOSES_IN_DEVICE_RESPONSE = true;

/**
 * The verifier gives up and shows its own "wallet didn't respond" 30s after sending
 * the DeviceRequest. There's no native event for that on the wallet side — if the
 * verifier doesn't tear down the BLE session cleanly, MdocPresentmentConsentDismissed
 * never fires either, and the consent screen would otherwise just sit there forever.
 * Firing a bit ahead of the verifier's own deadline means the wallet's own failure
 * page shows instead of silently doing nothing.
 */
const CONSENT_RESPONSE_TIMEOUT_MS = 28000;

/**
 * Ceiling on the gap between native accepting the approval and the DeviceResponse
 * actually going out. That window contains the keystore biometric prompt, so it has to
 * be generous — this is only a backstop against native never reporting either outcome,
 * not a deadline the user is expected to beat.
 */
const RESPONSE_SENT_TIMEOUT_MS = 60000;

/**
 * Backstop for the gap between a reader connecting and its DeviceRequest arriving. Readers send
 * the request immediately after connecting; if the link drops in between, not every engine
 * reports it, and the Connecting screen would otherwise spin forever.
 */
const CONNECTING_TIMEOUT_MS = 30000;

type QrSvgRef = {toDataURL: (callback: (dataURL: string) => void) => void};

/**
 * Module-level (not per-instance): StrictMode remount creates a *new* component instance whose
 * useRef would reset to 0 and still allow the previous instance's deferred stop to kill BLE.
 */
let isoPresentmentGeneration = 0;

export const QrCodeOverlay: React.FC<QrCodeOverlayProps> = props => {
  const {RNPixelpassModule} = NativeModules;
  const {t} = useTranslation('VcDetails');
  const navigation = useNavigation<NavigationProp<MainBottomTabParamList>>();
  const {appService} = useContext(GlobalContext);
  const [qrString, setQrString] = useState('');
  const [qrError, setQrError] = useState(false);
  const [consentRequest, setConsentRequest] =
    useState<MdocPresentmentConsentRequest | null>(null);
  const [consentResult, setConsentResult] = useState<MdocShareResult | null>(
    null,
  );
  const [consentBusy, setConsentBusy] = useState(false);
  /** A reader attached over BLE; cleared when the session ends or restarts. */
  const [readerConnected, setReaderConnected] = useState(false);
  /** Approve accepted, waiting for ResponseSent (signing + biometric + send). */
  const [isSending, setIsSending] = useState(false);
  /**
   * The latest DeviceRequest, kept after `consentRequest` is cleared so the sending and
   * result screens can still name the verifier and list what was shared.
   */
  const [lastRequest, setLastRequest] =
    useState<MdocPresentmentConsentRequest | null>(null);
  const [agreedPurposes, setAgreedPurposes] = useState<string[]>([]);
  /** What the user approved; null until then, so summaries fall back to the whole request. */
  const [sharedElements, setSharedElements] = useState<
    MdocPresentmentConsentElement[] | null
  >(null);
  const [sessionClosedAt, setSessionClosedAt] = useState<Date | null>(null);
  const [typeMismatch, setTypeMismatch] =
    useState<MdocCredentialTypeMismatch | null>(null);
  /** Bumped to tear down and restart the BLE session with the same QR ("Show QR Again"). */
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const base64ImageType = 'data:image/png;base64,';
  const {RNSecureKeystoreModule} = NativeModules;

  /**
   * The consent-dismissed subscription below is set up once in a useEffect with a
   * narrow dependency array, so its closure would otherwise see whatever
   * consentRequest was at setup time forever (a stale closure) — this ref gives it a
   * way to read the live value instead.
   */
  const consentRequestRef = useRef(consentRequest);
  consentRequestRef.current = consentRequest;
  /** Set the moment the user taps Share or Cancel, so the timeout below backs off
   * instead of yanking away a response the user already sent. */
  const hasUserActedRef = useRef(false);
  /**
   * `consentBusy` (state) can't act as a re-entrancy guard on its own: two rapid
   * onPress firings both read it as `false` before either has re-rendered, so both
   * slip past `if (consentBusy) return` — this was showing the biometric prompt
   * twice per tap. A ref updates synchronously, so the second call sees the first
   * one's flag immediately.
   */
  const consentActionInFlightRef = useRef(false);
  /**
   * True once native confirms the DeviceResponse actually went out. Set before the
   * ConsentDismissed that always follows a successful send, so that handler knows not
   * to overwrite the success result with a failure.
   */
  const responseSentRef = useRef(false);
  /**
   * Set when the user taps Decline, so the ConsentDismissed that follows the deny reports the
   * outcome as declined rather than as a failure.
   */
  const userDeclinedRef = useRef(false);
  const readerConnectedRef = useRef(readerConnected);
  readerConnectedRef.current = readerConnected;
  const lastRequestRef = useRef(lastRequest);
  lastRequestRef.current = lastRequest;
  const metaRef = useRef(props.meta);
  metaRef.current = props.meta;
  /** Safety timer for the gap between "approve accepted" and the signing/send finishing,
   * so a native stall can't leave the consent screen spinning forever. */
  const responseWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  function clearResponseWaitTimer() {
    if (responseWaitTimerRef.current) {
      clearTimeout(responseWaitTimerRef.current);
      responseWaitTimerRef.current = null;
    }
  }

  /** Latest VC for native proximity — ref avoids BLE cancel/restart when parent re-renders new object identity. */
  const verifiableCredentialRef = useRef(props.verifiableCredential);
  verifiableCredentialRef.current = props.verifiableCredential;

  /** Records the completed proximity share in the Activity log ("View in Activity"). */
  function logShareActivity() {
    const activityLogService = appService?.children?.get('activityLog');
    if (!activityLogService) {
      return;
    }
    const vcMetadata = VCMetadata.fromVC(metaRef.current);
    activityLogService.send(
      ActivityLogEvents.LOG_ACTIVITY(
        VCActivityLog.getLogFromObject({
          _vcKey: vcMetadata.getVcKey(),
          type: 'VC_SHARED',
          credentialConfigurationId:
            verifiableCredentialRef.current?.credentialConfigurationId ?? '',
          issuer: vcMetadata.issuerHost ?? '',
          timestamp: Date.now(),
          deviceName: resolveVerifierName(lastRequestRef.current) ?? '',
        }),
      ),
    );
  }

  async function getQRData(): Promise<string> {
    const format = props.meta?.format ?? '';
    if (format === VCFormat.mso_mdoc) {
      try {
        const payload = await loadOrCreateMdocProximityQrPayload(
          props.meta.id,
          () =>
            buildMdocDeviceEngagementQrForVc(
              props.verifiableCredential,
              format,
              props.meta,
            ),
        );
        if (!payload) {
          throw new Error('mDoc DeviceEngagement unavailable');
        }
        logMdocProximitySessionDiagnostics(
          payload.reused ? 'reused' : 'new',
          payload.deviceEngagementCbor,
          {
            advertisedBleServiceUuidHex: props.advertisedBleServiceUuidHex,
          },
        );
        return payload.mdocUri;
      } catch (e) {
        if (__DEV__) {
          console.warn('[QrCodeOverlay] mDoc proximity session / keystore', e);
        }
        throw e;
      }
    }

    let qrData: string;
    try {
      const keyData = await RNSecureKeystoreModule.getData(props.meta.id);
      if (keyData[1] && keyData.length > 0) {
        qrData = keyData[1];
        if (qrData.length >= MAX_QR_DATA_LENGTH) {
          throw new Error('Cached QR exceeds MAX_QR_DATA_LENGTH');
        }
      } else {
        throw new Error('No key data found');
      }
    } catch {
      const {isClaim169QrPresent, claim169QrData} = getClaim169Qr();
      if (isClaim169QrPresent) {
        qrData = claim169QrData;
      } else {
        const {credential} = props.verifiableCredential;
        const vcJson = JSON.stringify(credential);
        qrData = await RNPixelpassModule.generateQRData(vcJson, '');
        if (qrData?.length >= MAX_QR_DATA_LENGTH) {
          qrData = await RNPixelpassModule.generateQRData(
            compactVcForQr(credential),
            '',
          );
        }
      }
      if (qrData?.length < MAX_QR_DATA_LENGTH) {
        await RNSecureKeystoreModule.storeData(props.meta.id, qrData);
      }
    }
    return qrData;
  }

  function getClaim169Qr(): {
    isClaim169QrPresent: boolean;
    claim169QrData: string;
  } {
    const credentialSubject =
      props.verifiableCredential?.credential?.credentialSubject;
    const claim169Qrs = (credentialSubject as any)?.claim169;
    const qr =
      claim169Qrs && typeof claim169Qrs === 'object'
        ? claim169Qrs[Object.keys(claim169Qrs)[0]]
        : undefined;

    if (typeof qr === 'string' && qr.trim().length > 0) {
      return {isClaim169QrPresent: true, claim169QrData: qr};
    }
    return {isClaim169QrPresent: false, claim169QrData: ''};
  }

  const qrRef = useRef<QrSvgRef | null>(null);

  function handleShareQRCodePress() {
    qrRef.current?.toDataURL(dataURL => {
      shareImage(`${base64ImageType}${dataURL}`);
    });
  }

  async function shareImage(base64String: string) {
    const options: ShareOptions = {
      url: base64String,
    };
    const shareStatus = await shareImageToAllSupportedApps(options);
    if (!shareStatus) {
      console.error('Error while sharing QR code::');
    }
  }

  function onQRError() {
    console.warn('Data is too big');
    // QR library may call onError during QRCode render; defer so we do not setState on QrCodeOverlay in that phase.
    queueMicrotask(() => setQrError(true));
  }

  const [isQrOverlayVisible, setIsQrOverlayVisible] = useState(false);
  const overlayVisible = props.forceVisible ?? isQrOverlayVisible;
  // mDoc's QR is a live BLE engagement tied to a proximity/consent flow, so it keeps
  // the dedicated full-page Modal below. Every other format (w3c VC, SD-JWT, ...) is
  // just a static, scannable QR value — it opens as a small popup dialog instead.
  const isMdoc = props.meta?.format === VCFormat.mso_mdoc;

  useEffect(() => {
    // Platform-agnostic: `nativeMdocProximityPresentmentAvailable` covers both the Android
    // native presenter and the common TypeScript engine used on iOS.
    if (
      props.meta?.format !== VCFormat.mso_mdoc ||
      !nativeMdocProximityPresentmentAvailable()
    ) {
      return;
    }
    const requiredSub = subscribeMdocPresentmentConsentRequired(request => {
      if (__DEV__) {
        console.log(
          '[QrCodeOverlay] mDOC consent required:',
          request.docType,
          request.purpose,
          request.verifierName,
          request.elements.length,
        );
      }
      logIncomingInformationRequested(request);
      hasUserActedRef.current = false;
      responseSentRef.current = false;
      userDeclinedRef.current = false;
      setLastRequest(request);
      setAgreedPurposes([]);
      setSharedElements(null);
      setConsentRequest(request);
      setConsentBusy(false);
    });
    const connectedSub = subscribeMdocPresentmentReaderConnected(() => {
      setReaderConnected(true);
    });
    // The only trustworthy "it actually worked" signal: DeviceAuth signing (and so the
    // keystore biometric prompt) and the transport send both completed.
    const responseSentSub = subscribeMdocPresentmentResponseSent(() => {
      responseSentRef.current = true;
      clearResponseWaitTimer();
      logShareActivity();
      setConsentBusy(false);
      setIsSending(false);
      setConsentRequest(null);
      setSessionClosedAt(new Date());
      setConsentResult('success');
    });
    const dismissedSub = subscribeMdocPresentmentConsentDismissed(() => {
      // Native emits this on the success path too (right after the send), so defer to
      // responseSentRef; otherwise this means the session ended without a completed
      // DeviceResponse — Decline, a cancelled keystore biometric, the verifier going
      // back, BLE dropping. Only the first is the user's choice; the rest are failures.
      if (responseSentRef.current) {
        return;
      }
      const wasPending =
        consentRequestRef.current != null || readerConnectedRef.current;
      clearResponseWaitTimer();
      setConsentBusy(false);
      setIsSending(false);
      setConsentRequest(null);
      if (userDeclinedRef.current) {
        setConsentResult('declined');
      } else if (wasPending) {
        setConsentResult(prev => prev ?? 'failure');
      }
    });
    const cannotSatisfySub = subscribeMdocPresentmentCannotSatisfy(event => {
      setTypeMismatch(getCredentialTypeMismatch(event));
      clearResponseWaitTimer();
      setConsentRequest(null);
      setConsentBusy(false);
      setIsSending(false);
      setConsentResult('failure');
    });
    return () => {
      requiredSub.remove();
      connectedSub.remove();
      responseSentSub.remove();
      dismissedSub.remove();
      cannotSatisfySub.remove();
      clearResponseWaitTimer();
    };
  }, [props.meta?.format, t]);

  // Starts fresh for each new consent request (dependency below) and is cleared the
  // moment that request resolves for any reason — approve, deny, dismiss, or a new
  // request replacing this one — so it never fires against a request that's already
  // been dealt with.
  useEffect(() => {
    if (consentRequest == null) {
      return;
    }
    const timeoutId = setTimeout(() => {
      if (hasUserActedRef.current) {
        // Share/Cancel was already tapped — let that call's own outcome decide the
        // result instead of racing a timeout-triggered failure against it.
        return;
      }
      if (__DEV__) {
        console.warn(
          '[QrCodeOverlay] No response within the consent timeout — the verifier will have given up by now.',
        );
      }
      setConsentRequest(null);
      setConsentBusy(false);
      setConsentResult('failure');
      denyIso18013PresentmentConsent().catch(e => {
        if (__DEV__) {
          console.warn('[QrCodeOverlay] deny after consent timeout failed:', e);
        }
      });
    }, CONSENT_RESPONSE_TIMEOUT_MS);
    return () => clearTimeout(timeoutId);
  }, [consentRequest]);

  useEffect(() => {
    if (!readerConnected || consentRequest != null || consentResult != null) {
      return;
    }
    const timeoutId = setTimeout(() => {
      if (__DEV__) {
        console.warn(
          '[QrCodeOverlay] Reader connected but no DeviceRequest arrived — ending the session.',
        );
      }
      stopIso18013ProximityPresentment();
      setConsentResult(prev => prev ?? 'failure');
    }, CONNECTING_TIMEOUT_MS);
    return () => clearTimeout(timeoutId);
  }, [readerConnected, consentRequest, consentResult]);

  useEffect(() => {
    let cancelled = false;
    const generation = ++isoPresentmentGeneration;
    (async () => {
      try {
        const qrData = await getQRData();
        if (cancelled) {
          return;
        }
        /**
         * Multipaz `MdocProximityQrPresentment` calls `advertise()` before the QR is shown, then
         * `waitForConnection`. Starting native presentment only after a debounced second effect
         * meant verifiers could scan the `mdoc:` URI while GATT was not yet advertising (Tap2iD 115).
         * Fire native `startPresentment` (non-blocking) before `setQrString` so BLE is up when the QR paints.
         */
        if (
          nativeMdocProximityPresentmentAvailable() &&
          props.meta?.format === VCFormat.mso_mdoc &&
          typeof qrData === 'string' &&
          qrData.startsWith('mdoc:')
        ) {
          try {
            const vc = verifiableCredentialRef.current;
            if (!vc) {
              if (__DEV__) {
                console.warn(
                  '[QrCodeOverlay] Skipping ISO presentment — verifiableCredential not ready',
                );
              }
            } else {
              const p = await buildIso18013PresentmentParamsForVc(
                props.meta.id,
                {
                  ...vc,
                  credential:
                    typeof vc.credential === 'string' ? vc.credential : '',
                  processedCredential: vc.processedCredential,
                },
              );
              if (!cancelled && p && isoPresentmentGeneration === generation) {
                if (__DEV__) {
                  console.log(
                    '[QrCodeOverlay] Starting native ISO 18013-5 presentment before QR paint (Multipaz order)…',
                  );
                }
                void startIso18013ProximityPresentment(p).catch(e => {
                  if (__DEV__) {
                    const detail =
                      e && typeof e === 'object' && 'message' in e
                        ? String((e as Error).message)
                        : String(e);
                    console.warn(
                      '[QrCodeOverlay] ISO 18013-5 proximity session error:',
                      detail,
                      e,
                    );
                  }
                  // A session that dies after the reader attached (link dropped before
                  // the request) would otherwise leave the Connecting screen up.
                  if (
                    isoPresentmentGeneration === generation &&
                    readerConnectedRef.current &&
                    !responseSentRef.current
                  ) {
                    setConsentRequest(null);
                    setIsSending(false);
                    setConsentResult(prev => prev ?? 'failure');
                  }
                });
              } else if (__DEV__ && !p) {
                console.warn(
                  '[QrCodeOverlay] ISO 18013-5 presentment not started — see earlier [mdoc presentment] warnings (credential / persisted engagement).',
                );
              }
            }
          } catch (e) {
            if (__DEV__) {
              console.warn(
                '[QrCodeOverlay] ISO 18013-5 presentment bootstrap failed:',
                e,
              );
            }
          }
        } else if (
          __DEV__ &&
          props.meta?.format === VCFormat.mso_mdoc &&
          !nativeMdocProximityPresentmentAvailable()
        ) {
          console.warn(
            Platform.OS === 'android'
              ? '[QrCodeOverlay] MdocIso18013Presentment native module unavailable — rebuild Android with Multipaz + InjiPackage registration.'
              : '[QrCodeOverlay] MdocBleTransport native module unavailable — rebuild iOS (pod install + clean build) so the BLE transport is linked.',
          );
        }
        if (qrData?.length < MAX_QR_DATA_LENGTH) {
          setQrString(qrData);
          props.onQrData?.(qrData);
        } else {
          setQrError(true);
        }
      } catch {
        if (!cancelled) {
          setQrError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
      setConsentRequest(null);
      setReaderConnected(false);
      // Defer stop so StrictMode remount (sync unmount→mount) can claim a newer generation
      // and keep advertising. Real leave/unmount keeps the same generation → stop runs.
      const genAtCleanup = generation;
      setTimeout(() => {
        if (isoPresentmentGeneration === genAtCleanup) {
          if (__DEV__) {
            console.log(
              '[QrCodeOverlay] Stopping ISO presentment (effect cleanup, generation still current)',
            );
          }
          stopIso18013ProximityPresentment();
        }
      }, 400);
    };
  }, [
    props.meta.id,
    props.meta.format,
    props.advertisedBleServiceUuidHex,
    sessionAttempt,
  ]);

  const toggleQrOverlay = () => {
    if (props.onClose) props.onClose();
    else setIsQrOverlayVisible(!overlayVisible);
  };

  async function handleConsentAllow(
    purposesResponse: PurposesResponse,
    purposesAgreed: string[],
    elementsToShare: MdocPresentmentConsentElement[],
  ) {
    if (consentActionInFlightRef.current) {
      return;
    }
    consentActionInFlightRef.current = true;
    hasUserActedRef.current = true;
    setConsentBusy(true);
    setAgreedPurposes(purposesAgreed);
    setSharedElements(elementsToShare);
    setIsSending(true);
    const disclosed = elementsToShare.map(({namespace, element}) => ({
      namespace,
      element,
    }));
    try {
      // No biometric prompt here on purpose. DeviceAuth signing already goes through
      // InjiSecureKeystoreSecureArea.sign(), which calls Biometrics.authenticateAndPerform
      // and shows the keystore's own "Unlock App" prompt — that is the real gate (no
      // biometric => no signature => no DeviceResponse). Prompting here as well just
      // showed the user two fingerprint dialogs back to back.
      const purposesJson = JSON.stringify(purposesResponse);
      console.log(
        '[DEBUG] Outgoing purposes response to verifier:\n' +
          JSON.stringify(purposesResponse, null, 2),
      );
      logOutgoingInformationRequested(elementsToShare);
      if (SEND_PURPOSES_IN_DEVICE_RESPONSE) {
        await approveIso18013PresentmentConsent(purposesJson, disclosed);
      } else {
        console.log(
          '[DEBUG] SEND_PURPOSES_IN_DEVICE_RESPONSE=false — sending standard DeviceResponse',
        );
        await approveIso18013PresentmentConsent(undefined, disclosed);
      }
      // Deliberately no success here: approvePresentment resolves as soon as native
      // accepts the approval, *before* DeviceAuth signing (and its keystore biometric
      // prompt) and the send have happened. Showing success now is what put the success
      // page on screen underneath the fingerprint dialog. Stay busy and let the
      // ResponseSent / ConsentDismissed subscriptions decide the outcome.
      clearResponseWaitTimer();
      responseWaitTimerRef.current = setTimeout(() => {
        if (responseSentRef.current) {
          return;
        }
        if (__DEV__) {
          console.warn(
            '[QrCodeOverlay] No ResponseSent/Dismissed after approve — treating as failed.',
          );
        }
        setConsentBusy(false);
        setIsSending(false);
        setConsentRequest(null);
        setConsentResult('failure');
      }, RESPONSE_SENT_TIMEOUT_MS);
    } catch (e) {
      clearResponseWaitTimer();
      setConsentBusy(false);
      setIsSending(false);
      setConsentRequest(null);
      setConsentResult('failure');
      if (__DEV__) {
        console.warn('[QrCodeOverlay] approve mDOC consent failed:', e);
      }
    } finally {
      consentActionInFlightRef.current = false;
    }
  }

  /** Clears everything tied to one session so the next one starts from the QR screen. */
  function resetSessionState() {
    clearResponseWaitTimer();
    hasUserActedRef.current = false;
    responseSentRef.current = false;
    userDeclinedRef.current = false;
    // Refs too, not just state: the old session's teardown can emit ConsentDismissed before
    // the reset re-renders, and must not read it as a failure of the session being left.
    readerConnectedRef.current = false;
    consentRequestRef.current = null;
    setConsentRequest(null);
    setConsentResult(null);
    setConsentBusy(false);
    setIsSending(false);
    setReaderConnected(false);
    setLastRequest(null);
    setAgreedPurposes([]);
    setSharedElements(null);
    setSessionClosedAt(null);
    setTypeMismatch(null);
  }

  function closeShareFlow(destination: keyof MainBottomTabParamList) {
    resetSessionState();
    if (props.onClose) {
      props.onClose();
    } else {
      setIsQrOverlayVisible(false);
    }
    // Closing the QR overlay alone isn't enough — the VC-details modal that hosts it
    // is a separate Modal stacked above the tab navigator, so it would keep covering
    // the screen we navigate to.
    props.onCloseDetails?.();
    navigation.navigate(destination);
  }

  function handleDone() {
    closeShareFlow(BOTTOM_TAB_ROUTES.home);
  }

  function handleViewActivity() {
    closeShareFlow(BOTTOM_TAB_ROUTES.history);
  }

  function handleShowQrAgain() {
    resetSessionState();
    setSessionAttempt(n => n + 1);
    if (!props.onClose) {
      setIsQrOverlayVisible(true);
    }
  }

  /**
   * Close from the QR or Connecting screen. A reader that already attached is dropped by
   * restarting the session, so the QR (still shown inline on the card) stays scannable.
   */
  function handleCancel() {
    if (readerConnectedRef.current) {
      resetSessionState();
      setSessionAttempt(n => n + 1);
    }
    if (props.onClose) {
      props.onClose();
    } else {
      setIsQrOverlayVisible(false);
    }
  }

  const mdocStep = deriveMdocShareStep({
    qrReady: qrString !== '',
    qrError,
    readerConnected,
    hasConsentRequest: consentRequest != null,
    isSending,
    result: consentResult,
  });
  const mdocDocType =
    getMdocDocType(props.verifiableCredential?.processedCredential) ||
    lastRequest?.docType ||
    '';
  const credentialName: string =
    props.credentialName ||
    lastRequest?.credentialLabel ||
    t('identityCard') ||
    '';

  async function handleConsentDeny() {
    if (consentActionInFlightRef.current) {
      return;
    }
    consentActionInFlightRef.current = true;
    hasUserActedRef.current = true;
    userDeclinedRef.current = true;
    setConsentBusy(true);
    try {
      await denyIso18013PresentmentConsent();
      setConsentRequest(null);
      setConsentBusy(false);
      setConsentResult('declined');
    } catch (e) {
      // Nothing was approved, so nothing was shared — still the user's decline.
      setConsentBusy(false);
      setConsentRequest(null);
      setConsentResult('declined');
      if (__DEV__) {
        console.warn('[QrCodeOverlay] deny mDOC consent failed:', e);
      }
    } finally {
      consentActionInFlightRef.current = false;
    }
  }

  return (
    <>
      {qrString != '' && !qrError && (
        <React.Fragment>
          <View testID="qrCodeView" style={Theme.QrCodeStyles.QrView}>
            {props.showInlineQr !== false && (
              <Pressable
                {...testIDProps('qrCodePressable')}
                accessible={false}
                onPress={toggleQrOverlay}>
                <QRCode
                  {...testIDProps('qrCode')}
                  size={72}
                  value={qrString}
                  backgroundColor={Theme.Colors.QRCodeBackgroundColor}
                  ecl={DEFAULT_ECL}
                  onError={onQRError}
                />
                <View
                  testID="magnifierZoom"
                  style={[Theme.QrCodeStyles.magnifierZoom]}>
                  {SvgImage.MagnifierZoom()}
                </View>
              </Pressable>
            )}
          </View>

          {!isMdoc && (
            // Non-mDoc: a small popup dialog over the current page — not a page
            // navigation, and not laid out inline (which fights the surrounding field
            // list for width). Backdrop tap or the close button dismiss it; tapping the
            // card itself doesn't, since that inner Pressable claims the touch first.
            <Modal
              visible={overlayVisible}
              transparent
              animationType="fade"
              onRequestClose={toggleQrOverlay}>
              <Pressable
                {...testIDProps('qrDialogBackdrop')}
                style={qrPageStyles.backdrop}
                onPress={toggleQrOverlay}>
                <Pressable
                  style={qrPageStyles.dialogCard}
                  onPress={() => {}}
                  accessible={false}>
                  <Pressable
                    {...testIDProps('closeQrDialog')}
                    style={qrPageStyles.dialogCloseButton}
                    onPress={toggleQrOverlay}>
                    <Icon
                      name="close"
                      type="material"
                      size={28}
                      color={Theme.Colors.GrayIcon}
                    />
                  </Pressable>
                  <QRCode
                    {...testIDProps('qrCodeExpandedView')}
                    size={280}
                    value={qrString}
                    backgroundColor={Theme.Colors.QRCodeBackgroundColor}
                    ecl={DEFAULT_ECL}
                    quietZone={10}
                    onError={onQRError}
                    getRef={data => (qrRef.current = data)}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          )}
        </React.Fragment>
      )}
      {isMdoc && (
        // The whole proximity share (QR → connecting → consent → sending → result) in one
        // full-screen Modal. Session steps stay up even when the QR page itself was never
        // opened, because a verifier can scan the small inline QR on the card.
        <MdocShareFlow
          visible={overlayVisible || isSessionStep(mdocStep)}
          step={mdocStep}
          title={
            mdocDocType === MDL_DOC_TYPE
              ? t('mdocShare.titleMdl')
              : t('mdocShare.titleCredential')
          }
          credentialName={credentialName}
          issuerName={getMdocIssuingAuthority(
            props.verifiableCredential?.processedCredential,
          )}
          issuerLogoUrl={props.issuerLogoUrl}
          holderName={getMdocHolderName(
            props.verifiableCredential?.processedCredential,
          )}
          qrValue={qrString}
          consentRequest={consentRequest}
          consentBusy={consentBusy}
          verifierName={resolveVerifierName(lastRequest)}
          fallbackVerifierName={t('mdocShare.theVerifier')}
          summary={buildShareSummary(
            lastRequest,
            agreedPurposes,
            sharedElements,
          )}
          elementValues={getMdocElementValues(
            props.verifiableCredential?.processedCredential,
          )}
          typeMismatch={typeMismatch}
          closedAt={sessionClosedAt}
          onQRError={onQRError}
          onQrRef={data => (qrRef.current = data)}
          onCancel={handleCancel}
          onAllow={handleConsentAllow}
          onDeny={handleConsentDeny}
          onDone={handleDone}
          onViewActivity={handleViewActivity}
          onShowQrAgain={handleShowQrAgain}
        />
      )}
    </>
  );
};

const qrPageStyles = StyleSheet.create({
  // Non-mDoc popup dialog: semi-transparent backdrop behind a small centered card.
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Theme.Colors.whiteBackgroundColor,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 28,
    alignItems: 'center',
  },
  dialogCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
});

interface QrCodeOverlayProps {
  verifiableCredential: VerifiableCredential;
  meta: VCMetadata;
  /** When native BLE proximity is implemented, pass the GATT service UUID (hex, with or without dashes) to verify it matches Engagement key 10. */
  advertisedBleServiceUuidHex?: string | null;
  showInlineQr?: boolean;
  forceVisible?: boolean;
  onClose?: () => void;
  /** Receives the QR payload once built, for screens that draw the code themselves. */
  onQrData?: (data: string) => void;
  /** Dismisses the enclosing VC-details modal — without this, navigating to the Home
   * tab is invisible because that modal stays stacked on top of it. */
  onCloseDetails?: () => void;
  /** Display name of the credential type (e.g. "Mobile Driving Licence") for the mDoc share flow. */
  credentialName?: string;
  issuerLogoUrl?: string;
}
