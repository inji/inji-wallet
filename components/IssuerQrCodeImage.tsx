import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {Text} from './ui';
import {Theme} from './ui/styleUtils';
import {SvgImage} from './ui/svg';
import testIDProps from '../shared/commonUtil';
import {
  MdocShareButton,
  MdocShareHeader,
} from './mdocShare/MdocSharePrimitives';
import {fetchIssuerQrCodeImage} from '../shared/credissuer/credentialsApi';
import {
  getCredentialId,
  getCredissuerCredentialId,
  getIssuerQrCodeUrl,
  isCredissuerCredential,
} from '../shared/qr/issuerQrCode';

const {colors: C, brand: B} = Theme.Tokens;
const QR_SIZE = 236;

/**
 * A remote image renders as an empty box both while it loads and when it fails, so neither state
 * is visible on its own. The spinner covers the loading state; a failure is reported to the caller
 * (with the URL that failed) so it can show something that works instead.
 */
const QrImage: React.FC<{
  uri: string;
  size: number;
  onError?: (uri: string) => void;
}> = ({uri, size, onError}) => {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <View style={{width: size, height: size}}>
      <Image
        source={{uri}}
        style={{width: size, height: size, borderRadius: 10}}
        resizeMode="contain"
        onLoadStart={() => setIsLoading(true)}
        // Fires after a successful load and after a failed one.
        onLoadEnd={() => setIsLoading(false)}
        onError={() => onError?.(uri)}
      />
      {isLoading && (
        <ActivityIndicator
          testID="issuerQrCodeLoader"
          style={StyleSheet.absoluteFill}
          color={Theme.Colors.Loading}
        />
      )}
    </View>
  );
};

/**
 * Holds the QR slot, at the same size as the image tile, while the fresh issuer QR is still being
 * looked up. Deliberately not a QR: anything scannable here could be the wrong one.
 */
export const IssuerQrCodePlaceholder: React.FC = () => (
  <View testID="issuerQrCodePlaceholder" style={Theme.QrCodeStyles.QrView}>
    <View style={styles.placeholder}>
      <ActivityIndicator color={Theme.Colors.Loading} />
    </View>
  </View>
);

export const IssuerQrCodeImage: React.FC<IssuerQrCodeImageProps> = props => {
  const {qrCodeUrl, onLoadError, credentialName, issuerLogoUrl} = props;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeModal = () => setIsModalVisible(false);

  return (
    <>
      <View testID="issuerQrCodeView" style={Theme.QrCodeStyles.QrView}>
        <Pressable
          {...testIDProps('issuerQrCodePressable')}
          accessible={false}
          onPress={() => setIsModalVisible(true)}>
          {/* Keyed by URL so each load gets its own instance: a late error from a previous URL
              can't be reported against the current one, and the spinner restarts per URL. */}
          <QrImage
            key={qrCodeUrl}
            uri={qrCodeUrl}
            size={90}
            onError={onLoadError}
          />
          <View
            testID="magnifierZoom"
            style={[Theme.QrCodeStyles.magnifierZoom]}>
            {SvgImage.MagnifierZoom()}
          </View>
        </Pressable>
      </View>

      <IssuerQrDialog
        visible={isModalVisible}
        qrCodeUrl={qrCodeUrl}
        onClose={closeModal}
        onLoadError={onLoadError}
        credentialName={credentialName}
        issuerLogoUrl={issuerLogoUrl}
      />
    </>
  );
};

/**
 * The issuer's QR full screen, for a verifier to scan, in the same navy design as the mDoc
 * "Show QR" page. With no `qrCodeUrl` it shows a spinner in the QR's place: the fresh QR is still
 * being looked up, and nothing scannable may show meanwhile.
 */
export const IssuerQrDialog: React.FC<IssuerQrDialogProps> = ({
  visible,
  qrCodeUrl,
  onClose,
  onLoadError,
  credentialName,
  issuerName,
  issuerLogoUrl,
  holderName,
}) => {
  const {t} = useTranslation('VcDetails');
  const insets = useSafeAreaInsets();
  const qrCaption = [holderName, credentialName].filter(Boolean).join(' · ');
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <StatusBar barStyle="light-content" />
      <View
        testID="issuerQrDialog"
        style={[styles.screen, {paddingTop: insets.top}]}>
        <MdocShareHeader
          variant="dark"
          title={t('mdocShare.titleCredential')}
          titleTestID="issuerQrCodeHeader"
          onClose={onClose}
          closeTestID="closeIssuerQrDialog"
          closeLabel={t('mdocShare.close')}
          right={
            <Icon name="qr-code-2" type="material" size={22} color={B.onNavy} />
          }
        />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {!!credentialName && (
            <View style={styles.credentialCard}>
              <View style={styles.issuerBadge}>
                {issuerLogoUrl ? (
                  <Image
                    source={{uri: issuerLogoUrl}}
                    style={styles.issuerLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <Icon name="badge" type="material" size={20} color={C.ink} />
                )}
              </View>
              <View style={styles.credentialText}>
                <Text weight="semibold" color={B.onNavy} numLines={1}>
                  {credentialName}
                </Text>
                {!!issuerName && (
                  <Text size="smaller" color={B.mist} numLines={1}>
                    {issuerName}
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.qrCard}>
            {qrCodeUrl ? (
              <QrImage
                key={qrCodeUrl}
                uri={qrCodeUrl}
                size={QR_SIZE}
                onError={onLoadError}
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <ActivityIndicator color={C.ink} />
                <Text
                  size="smaller"
                  align="center"
                  color={C.inkMuted}
                  margin="10 0 0 0">
                  {t('mdocShare.loadingQr')}
                </Text>
              </View>
            )}
            {!!qrCaption && (
              <Text
                size="smaller"
                align="center"
                color={C.inkMuted}
                margin="10 0 0 0"
                numLines={1}>
                {qrCaption}
              </Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Icon
              name="verified-user"
              type="material"
              size={18}
              color={B.mist}
              containerStyle={styles.infoIcon}
            />
            <Text size="smaller" color={B.mist} style={styles.infoText}>
              {issuerName
                ? t('issuerQr.info', {issuer: issuerName})
                : t('issuerQr.infoGeneric')}
            </Text>
          </View>
        </ScrollView>
        <View
          style={[styles.footer, {paddingBottom: Math.max(insets.bottom, 16)}]}>
          <MdocShareButton
            testID="issuerQrDialogDone"
            variant="linkOnNavy"
            title={t('mdocShare.close')}
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {flex: 1, backgroundColor: B.navy},
  content: {paddingHorizontal: 20, paddingBottom: 16, alignItems: 'center'},
  credentialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: B.navyFill,
    borderColor: B.navyLine,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  issuerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  issuerLogo: {width: 28, height: 28},
  credentialText: {flex: 1, marginLeft: 12},
  qrCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: QR_SIZE,
    height: QR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    marginTop: 18,
  },
  infoIcon: {marginRight: 8, marginTop: 1},
  infoText: {flex: 1},
  footer: {paddingHorizontal: 20, paddingTop: 8},
});

const getIssuerQrLookupKey = (
  credissuerCredentialId: string | null,
  vcId: string | null,
): string | null =>
  credissuerCredentialId === null
    ? null
    : JSON.stringify([credissuerCredentialId, vcId]);

/**
 * The QR image CredIssuer issued for a credential (its Claim 169 QR), which is what a verifier
 * must scan; the wallet-generated QR is only the fallback. In order:
 *
 * 1. the image the wallet saved with the credential (at download, or after an earlier lookup);
 * 2. otherwise a one-off lookup from CredIssuer, handed to `onFetched` so the caller saves it;
 * 3. otherwise the link inside the VC, which expires within a day, so it is a last resort.
 *
 * `url` is null when there is none, or when the image failed to load (reported through
 * `onLoadError`): the caller then shows the wallet-generated QR, which works offline. While a
 * lookup runs, `isFetching` is true and no QR should be shown at all.
 *
 * @param walletCredential The stored credential wrapper, which carries the saved image and
 *   CredIssuer's credential ID next to the signed VC.
 * @param credential The signed VC itself; defaults to `walletCredential.credential`.
 */
export function useIssuerQrCode(
  walletCredential:
    | {issuerQrCode?: string; credissuerCredentialId?: string; credential?: any}
    | null
    | undefined,
  onFetched?: (issuerQrCode: string, credissuerCredentialId: string) => void,
  credential: unknown = walletCredential?.credential,
) {
  // The QR image the wallet saved for this credential (at download, or on the first open after
  // it). When there is one it is all the card needs: no lookup, no network.
  const savedIssuerQrCode = walletCredential?.issuerQrCode ?? null;
  // The link inside the VC itself; it expires within a day, so it is only a last resort.
  const storedIssuerQrCodeUrl = getIssuerQrCodeUrl(credential);
  // From the token response for new downloads. Older CredIssuer credentials carry it (or a
  // template-specific equivalent) in credentialSubject instead.
  const credissuerCredentialId =
    walletCredential?.credissuerCredentialId ??
    (isCredissuerCredential(credential)
      ? getCredissuerCredentialId(credential)
      : null);
  const vcId = getCredentialId(credential);
  // Identifies which credential a lookup result belongs to. The result is stored together with
  // this key, and a result counts only while the key matches the credential being rendered.
  // Resetting state from the effect isn't enough: the effect runs after the render in which the
  // credential changed, so that render would still show the previous credential's QR.
  // Null once a QR is saved, which is what stops the lookup from running on every open.
  const issuerQrLookupKey = savedIssuerQrCode
    ? null
    : getIssuerQrLookupKey(credissuerCredentialId, vcId);
  const [issuerQrLookup, setIssuerQrLookup] = useState<{
    key: string;
    url: string | null;
  } | null>(null);
  // A CredIssuer card must not show any QR until the fresh lookup has settled. Otherwise the slot
  // shows a placeholder first (the stored image, or the wallet-generated QR when there is none),
  // and swaps to the fresh one only when the API answers, up to 15 s later. A verifier that scans
  // during that window gets a QR that doesn't verify, which made verification look intermittent.
  // Being derived, this is already true on the first render and on the first render after the
  // credential changes, so no frame ever shows a QR that belongs to nobody or to someone else.
  const isFetching =
    issuerQrLookupKey !== null && issuerQrLookup?.key !== issuerQrLookupKey;
  const freshIssuerQrCodeUrl =
    issuerQrLookup?.key === issuerQrLookupKey ? issuerQrLookup.url : null;
  const issuerQrCodeUrl =
    savedIssuerQrCode ?? freshIssuerQrCodeUrl ?? storedIssuerQrCodeUrl;
  // The stored link expires within a day and the fresh one needs the network, so an issuer QR
  // image that fails to load is an expected case (offline, a day after download), not an edge
  // case. When it fails, the wallet-generated QR is shown instead, because it works offline.
  // The failed URL is stored rather than a boolean, so a different URL (e.g. after the credential
  // changes) is never mistaken for the one that failed and gets its own chance to load.
  const [failedIssuerQrCodeUrl, setFailedIssuerQrCodeUrl] = useState<
    string | null
  >(null);
  const url =
    issuerQrCodeUrl && issuerQrCodeUrl !== failedIssuerQrCodeUrl
      ? issuerQrCodeUrl
      : null;

  // A ref, not an effect dependency: callers pass a new function on every render, which would
  // otherwise restart the lookup each time. Updated after each committed render, never during
  // one, so a lookup that resolves late can't call the callback of a render React discarded.
  // Declared before the lookup effect, so it is current by the time that effect runs.
  const onFetchedRef = useRef(onFetched);
  useEffect(() => {
    onFetchedRef.current = onFetched;
  });

  useEffect(() => {
    const key = issuerQrLookupKey;
    if (!credissuerCredentialId || key === null) {
      return;
    }
    let cancelled = false;
    fetchIssuerQrCodeImage(credissuerCredentialId, vcId)
      .then(qrCode => {
        if (cancelled) return;
        setIssuerQrLookup({key, url: qrCode});
        // Saved with the credential, so this lookup happens once, not on every open.
        if (qrCode) {
          onFetchedRef.current?.(qrCode, credissuerCredentialId);
        }
      })
      .catch(error => {
        console.error('Error fetching issuer QR code from CredIssuer:', error);
        // Settled with no fresh QR, so the link inside the VC or the wallet QR shows.
        if (!cancelled) setIssuerQrLookup({key, url: null});
      });
    return () => {
      cancelled = true;
    };
  }, [issuerQrLookupKey, credissuerCredentialId, vcId]);

  return {url, isFetching, onLoadError: setFailedIssuerQrCodeUrl};
}

interface IssuerQrDialogProps {
  visible: boolean;
  /** Null while the QR is still being looked up. */
  qrCodeUrl: string | null;
  onClose: () => void;
  /** Called with the URL that failed, so the caller can fall back to another QR. */
  onLoadError?: (uri: string) => void;
  /** Shown above the QR with the issuer, as on the mDoc "Show QR" page; optional. */
  credentialName?: string;
  issuerName?: string;
  issuerLogoUrl?: string;
  /** Shown under the QR with the credential name. */
  holderName?: string;
}

interface IssuerQrCodeImageProps {
  qrCodeUrl: string;
  /** Called with the URL that failed, so the caller can fall back to another QR. */
  onLoadError?: (uri: string) => void;
  /** For the full-screen QR's header card. */
  credentialName?: string;
  issuerLogoUrl?: string;
}
