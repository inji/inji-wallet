import React from 'react';
import {ActivityIndicator, Image, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {Text} from '../ui';
import {BottomSheet} from '../ui/BottomSheet';
import {PillButton} from '../ui/PillButton';
import {ShieldIcon} from '../ui/ShieldIcon';
import {Theme} from '../ui/styleUtils';

const {colors: C, brand: B} = Theme.Tokens;

type ConsentStatus = 'idle' | 'loading' | 'success';

/** Asks the user to trust an issuer they are downloading from for the first time. */
export const TrustIssuerSheet: React.FC<TrustIssuerSheetProps> = props => {
  const {t} = useTranslation('issuerTrustScreen');
  const isLoading = props.consentStatus === 'loading';
  const isSuccess = props.consentStatus === 'success';
  const displayName = props.name || t('unknownIssuer');
  const infoPointsValue = t('infoPoints', {returnObjects: true});
  const infoPoints: string[] = Array.isArray(infoPointsValue)
    ? infoPointsValue
    : [];

  const onRequestClose = () => {
    if (!isLoading && !isSuccess) {
      props.onCancel();
    }
  };

  return (
    <BottomSheet
      testID="trustIssuerSheet"
      isVisible={props.isVisible}
      onRequestClose={onRequestClose}
      dismissOnBackdropPress={false}>
      {isSuccess ? (
        <View style={styles.success}>
          <View style={styles.successIcon}>
            <ShieldIcon mark="check" size={30} color={C.pass} />
          </View>
          <Text
            testID="issuerTrusted"
            weight="bold"
            align="center"
            color={C.ink}
            style={styles.successTitle}>
            {t('successfullyTrusted')}
          </Text>
          <Text align="center" color={C.inkMuted} style={styles.successBody}>
            {t('trustedSubtitle', {name: displayName})}
          </Text>
          <View style={styles.successProgress}>
            <ActivityIndicator size="small" color={C.azureInk} />
            <Text
              size="small"
              color={C.inkMuted}
              style={styles.successProgressText}>
              {t('downloadingCard')}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.pill}>
            <Icon
              name="alert-circle-outline"
              type="material-community"
              size={14}
              color={C.warn}
            />
            <Text
              size="smaller"
              weight="semibold"
              color={C.warn}
              numLines={1}
              style={styles.pillText}>
              {t('firstTime')}
            </Text>
          </View>

          <Text
            testID="trustIssuerTitle"
            weight="bold"
            color={C.ink}
            style={styles.title}>
            {t('title')}
          </Text>

          <View style={styles.issuerCard}>
            <View style={styles.issuerRow}>
              <IssuerLogo logo={props.logo} />
              <Text
                testID="trustIssuerName"
                weight="bold"
                color={C.ink}
                style={styles.issuerName}>
                {displayName}
              </Text>
            </View>
            {props.credentialTypes.length > 0 && (
              <View style={styles.offeringRow}>
                <Text size="small" color={C.inkMuted}>
                  {t('offering')}
                </Text>
                <Text
                  testID="trustIssuerOffering"
                  weight="semibold"
                  align="right"
                  color={C.ink}
                  style={styles.offeringValue}>
                  {props.credentialTypes.join(', ')}
                </Text>
              </View>
            )}
          </View>

          <Text size="small" color={C.inkMuted} style={styles.description}>
            {t('description', {name: displayName})}
          </Text>

          {infoPoints.map(point => (
            <View key={point} style={styles.infoPoint}>
              <View style={styles.checkCircle}>
                <Icon name="check" type="material" size={13} color={C.pass} />
              </View>
              <Text size="small" color={C.ink} style={styles.infoPointText}>
                {point}
              </Text>
            </View>
          ))}

          <PillButton
            testID="trustIssuerConfirm"
            title={t('confirm')}
            loadingTitle={t('inProgress')}
            loading={isLoading}
            icon={<ShieldIcon mark="check" size={18} color={B.onNavy} />}
            onPress={props.onConfirm}
            style={styles.confirm}
          />
          <PillButton
            testID="trustIssuerCancel"
            variant="link"
            title={t('cancel')}
            disabled={isLoading}
            onPress={props.onCancel}
          />
        </>
      )}
    </BottomSheet>
  );
};

const IssuerLogo: React.FC<{logo?: string}> = ({logo}) =>
  logo ? (
    <View style={styles.logo}>
      <Image source={{uri: logo}} style={styles.logoImage} />
    </View>
  ) : (
    <View style={[styles.logo, styles.logoFallback]}>
      <ShieldIcon mark="check" size={26} color={B.onNavy} />
    </View>
  );

interface TrustIssuerSheetProps {
  isVisible: boolean;
  name: string;
  /** Display names of the credentials in the offer; the "Offering" row is hidden when empty. */
  credentialTypes: string[];
  logo?: string;
  consentStatus: ConsentStatus;
  onConfirm: () => void;
  onCancel: () => void;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.tintWarn,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillText: {
    marginLeft: 5,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    marginTop: 10,
    marginBottom: 16,
  },
  issuerCard: {
    backgroundColor: C.tintAzure,
    borderRadius: 16,
    padding: 14,
  },
  issuerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offeringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  offeringValue: {
    flex: 1,
    marginLeft: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.card,
    borderWidth: 2,
    borderColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  logoFallback: {
    backgroundColor: B.navy,
  },
  issuerName: {
    flex: 1,
    marginLeft: 14,
    fontSize: 16,
    lineHeight: 21,
  },
  description: {
    marginTop: 18,
    marginBottom: 8,
    lineHeight: 20,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.tintPass,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  infoPointText: {
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  },
  confirm: {
    marginTop: 24,
    marginBottom: 4,
  },
  success: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.tintPass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginTop: 16,
  },
  successBody: {
    marginTop: 8,
    lineHeight: 21,
  },
  successProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  successProgressText: {
    marginLeft: 8,
  },
});
