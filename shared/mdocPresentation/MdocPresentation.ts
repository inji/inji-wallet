import {NativeEventEmitter, NativeModules} from 'react-native';
import type {EmitterSubscription} from 'react-native';
import {signDataForVpPreparation} from '../openID4VP/OpenID4VPHelper';
import {UnsignedVPToken} from '../openID4VP/openid4vp.types';
import {
  MdocPresentationHandlers,
  MdocPresentationOptions,
  MdocResult,
  MdocSigningInput,
} from './types';

const InjiMdocPresentation = NativeModules.InjiMdocPresentation;

const SIGNING_ID = 'mdoc-proximity';
let activePresentationSession: {isAcceptingResponses: boolean} | undefined;

async function signWithWalletKey(
  signingInput: MdocSigningInput,
): Promise<string> {
  const unsignedVpToken: UnsignedVPToken = {
    id: SIGNING_ID,
    format: 'mso_mdoc',
    holderKeyReference: signingInput.holderKeyReference,
    signatureAlgorithm: signingInput.signatureAlgorithm,
    dataToSign: signingInput.dataToSign,
  };
  const [signedVpToken] = await signDataForVpPreparation([unsignedVpToken]);
  return signedVpToken.signedData;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * In-person (ISO 18013-5 proximity) mdoc presentation: Tuvali runs the session with the reader and
 * OpenID4VP builds the signed answer; the wallet shows the QR code, asks the holder and signs.
 */
export const MdocPresentation = {
  async present(
    options: MdocPresentationOptions,
    handlers: MdocPresentationHandlers,
  ): Promise<MdocResult> {
    if (activePresentationSession) {
      throw new Error('A presentation is already running');
    }
    const presentationSession = {isAcceptingResponses: true};
    activePresentationSession = presentationSession;
    const signDeviceAuthentication = handlers.sign ?? signWithWalletKey;
    const nativeEventSubscriptions: EmitterSubscription[] = [];
    const canHandleSessionCallbacks = () =>
      activePresentationSession === presentationSession &&
      presentationSession.isAcceptingResponses;
    try {
      const nativeEventEmitter = new NativeEventEmitter(InjiMdocPresentation);
      nativeEventSubscriptions.push(
        nativeEventEmitter.addListener(
          'onMdocQrReady',
          ({qrText}) =>
            canHandleSessionCallbacks() && handlers.onQrReady(qrText),
        ),
        nativeEventEmitter.addListener(
          'onMdocProgress',
          ({progress}) =>
            canHandleSessionCallbacks() && handlers.onProgress?.(progress),
        ),
        nativeEventEmitter.addListener('onMdocRequest', ({request}) => {
          if (!canHandleSessionCallbacks()) return;
          Promise.resolve()
            .then(() =>
              canHandleSessionCallbacks()
                ? handlers.onRequest(JSON.parse(request))
                : undefined,
            )
            .then(decision => {
              if (!canHandleSessionCallbacks()) return;
              InjiMdocPresentation.sendMdocDecisionFromJS(
                JSON.stringify(
                  decision === 'decline' ? {decline: true} : decision,
                ),
              );
            })
            .catch(error => {
              if (!canHandleSessionCallbacks()) return;
              InjiMdocPresentation.sendMdocDecisionFromJS(
                JSON.stringify({error: getErrorMessage(error)}),
              );
            });
        }),
        nativeEventEmitter.addListener(
          'onMdocSignRequest',
          (signingInput: MdocSigningInput) => {
            if (!canHandleSessionCallbacks()) return;
            Promise.resolve()
              .then(() =>
                canHandleSessionCallbacks()
                  ? signDeviceAuthentication(signingInput)
                  : undefined,
              )
              .then(signature => {
                if (!canHandleSessionCallbacks()) return;
                InjiMdocPresentation.sendMdocSignatureFromJS(
                  JSON.stringify({signature}),
                );
              })
              .catch(error => {
                if (!canHandleSessionCallbacks()) return;
                InjiMdocPresentation.sendMdocSignatureFromJS(
                  JSON.stringify({error: getErrorMessage(error)}),
                );
              });
          },
        ),
      );
      const serializedPresentationResult: string =
        await InjiMdocPresentation.present(JSON.stringify(options));
      return JSON.parse(serializedPresentationResult);
    } finally {
      presentationSession.isAcceptingResponses = false;
      activePresentationSession = undefined;
      nativeEventSubscriptions.forEach(subscription => subscription.remove());
    }
  },

  cancel(): void {
    if (activePresentationSession)
      activePresentationSession.isAcceptingResponses = false;
    InjiMdocPresentation.cancel();
  },
};
