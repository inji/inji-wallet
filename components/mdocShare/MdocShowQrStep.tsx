import React, {useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import QRCode from 'react-native-qrcode-svg';
import {useTranslation} from 'react-i18next';
import {Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import testIDProps from '../../shared/commonUtil';
import {
  MdocShareButton,
  MdocShareHeader,
  ShrinkWrappedText,
} from './MdocSharePrimitives';

const {colors: C, brand: B} = Theme.Tokens;
const QR_SIZE = 220;
/** The Bluetooth badge covers the QR centre, so the QR needs the highest error correction. */
const QR_ECL = 'H';

type QrSvgRef = {toDataURL: (callback: (dataURL: string) => void) => void};

/** M1 — the DeviceEngagement QR the verifier scans. */
export const MdocShowQrStep: React.FC<MdocShowQrStepProps> = props => {
  const {t} = useTranslation('VcDetails');
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const subtitle = [props.issuerName, t('mdocShare.isoStandard')]
    .filter(Boolean)
    .join(' · ');
  const qrCaption = [props.holderName, props.credentialName]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.container}>
      <MdocShareHeader
        variant="dark"
        title={props.title}
        titleTestID="mdocShowQrTitle"
        onClose={props.onCancel}
        closeLabel={t('mdocShare.close')}
        right={
          <Icon name="bluetooth" type="material" size={22} color={B.onNavy} />
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.credentialCard}>
          <View style={styles.issuerBadge}>
            {props.issuerLogoUrl ? (
              <Image
                source={{uri: props.issuerLogoUrl}}
                style={styles.issuerLogo}
                resizeMode="contain"
              />
            ) : (
              <Icon name="badge" type="material" size={20} color={C.ink} />
            )}
          </View>
          <View style={styles.credentialText}>
            <Text
              testID="mdocShowQrCredentialName"
              weight="semibold"
              color={B.onNavy}
              numLines={1}>
              {props.credentialName}
            </Text>
            <Text size="smaller" color={B.mist} numLines={1}>
              {subtitle}
            </Text>
          </View>
        </View>

        <View style={styles.qrCard}>
          {props.qrValue ? (
            <View style={styles.qrWrapper}>
              <QRCode
                {...testIDProps('qrCodeExpandedView')}
                size={QR_SIZE}
                value={props.qrValue}
                backgroundColor={C.card}
                color={C.ink}
                ecl={QR_ECL}
                quietZone={4}
                onError={props.onQRError}
                getRef={props.onQrRef}
              />
              <View style={styles.qrBadgeHolder} pointerEvents="none">
                <View style={styles.qrBadge}>
                  <Icon
                    name="bluetooth"
                    type="material"
                    size={20}
                    color={B.onNavy}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.qrPlaceholder}>
              {props.error ? (
                <>
                  <Icon
                    name="error-outline"
                    type="material"
                    size={32}
                    color={C.fail}
                  />
                  <Text
                    testID="mdocShowQrError"
                    weight="semibold"
                    align="center"
                    color={C.ink}
                    margin="10 0 4 0">
                    {t('mdocShare.qrErrorTitle')}
                  </Text>
                  <Text size="smaller" align="center" color={C.inkMuted}>
                    {t('mdocShare.qrErrorMessage')}
                  </Text>
                </>
              ) : (
                <>
                  <ActivityIndicator color={C.ink} />
                  <Text
                    size="smaller"
                    align="center"
                    color={C.inkMuted}
                    margin="10 0 0 0">
                    {t('mdocShare.loadingQr')}
                  </Text>
                </>
              )}
            </View>
          )}
          {!!qrCaption && (
            <Text
              testID="mdocShowQrHolder"
              size="smaller"
              align="center"
              color={C.inkMuted}
              margin="10 0 0 0"
              numLines={1}>
              {qrCaption}
            </Text>
          )}
        </View>

        {!!props.qrValue && (
          <View
            testID="mdocShowQrWaiting"
            style={styles.waitingPill}
            accessibilityLiveRegion="polite">
            <Animated.View style={[styles.waitingDot, {opacity: pulse}]} />
            <ShrinkWrappedText size="smaller" weight="semibold" color={B.cyan}>
              {t('mdocShare.waitingForScan')}
            </ShrinkWrappedText>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon
            name="verified-user"
            type="material"
            size={18}
            color={B.mist}
            containerStyle={styles.infoIcon}
          />
          <Text size="smaller" color={B.mist} style={styles.infoText}>
            {t('mdocShare.scanInfo')}
          </Text>
        </View>
      </ScrollView>
      <View style={[styles.footer, {paddingBottom: props.bottomInset}]}>
        <MdocShareButton
          testID="mdocShowQrCancel"
          variant="linkOnNavy"
          title={t('mdocShare.cancel')}
          onPress={props.onCancel}
        />
      </View>
    </View>
  );
};

export interface MdocShowQrStepProps {
  title: string;
  credentialName: string;
  issuerName?: string;
  issuerLogoUrl?: string;
  holderName?: string;
  qrValue: string;
  error: boolean;
  bottomInset: number;
  onCancel: () => void;
  onQRError: () => void;
  onQrRef: (ref: QrSvgRef) => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: B.navy,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
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
  issuerLogo: {
    width: 28,
    height: 28,
  },
  credentialText: {
    flex: 1,
    marginLeft: 12,
  },
  qrCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  qrWrapper: {
    width: QR_SIZE + 8,
    height: QR_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBadgeHolder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: B.navy,
    borderWidth: 4,
    borderColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholder: {
    width: QR_SIZE + 8,
    height: QR_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  waitingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: B.cyanTint,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 18,
  },
  waitingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: B.cyan,
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    marginTop: 18,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
