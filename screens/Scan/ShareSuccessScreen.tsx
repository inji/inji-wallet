import React, {useEffect, useMemo, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Animated,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {format} from 'date-fns';
import {Theme} from '../../components/ui/styleUtils';
import {
  getCredentialType,
  getSharedFieldLabels,
} from '../../components/VC/common/VCUtils';
import {useVcCardData} from '../../components/VC/useVcCardData';
import {VCMetadata} from '../../shared/VCMetadata';
import {isIOS} from '../../shared/constants';

const COLORS = Theme.Colors.Design;

/**
 * Shown after a card is shared with a verifier, online or over Bluetooth: who received it,
 * which details each card sent, and when. A share started from a verifier's deep link
 * returns to the verifier app on its own, so it has no buttons.
 */
export const ShareSuccessScreen: React.FC<ShareSuccessScreenProps> = ({
  isVisible,
  verifierName,
  sharedCards,
  wasAcceptedByVerifier,
  isViaDeepLink,
  goToHome,
  goToHistory,
}) => {
  const {t} = useTranslation('ScanScreen');
  const insets = useSafeAreaInsets();
  // The time the share finished, not the time this screen re-renders.
  const sharedAt = useMemo(() => new Date(), [isVisible]);

  const checkScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isVisible) {
      checkScale.setValue(0);
      return;
    }
    Animated.spring(checkScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !isViaDeepLink) {
      return;
    }
    const timeout = setTimeout(
      () => {
        BackHandler.exitApp();
        goToHome();
      },
      isIOS() ? 4000 : 2000,
    );
    return () => clearTimeout(timeout);
  }, [isVisible, isViaDeepLink]);

  const messageKey = wasAcceptedByVerifier
    ? 'shareSuccess.messageAccepted'
    : 'shareSuccess.message';

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={goToHome}>
      <View
        testID="sharingSuccessModal"
        style={[
          styles.screen,
          {paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16},
        ]}>
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          <Animated.View
            style={[styles.checkOuter, {transform: [{scale: checkScale}]}]}>
            <View style={styles.checkInner}>
              <Icon
                name="check"
                type="material-community"
                size={56}
                color={COLORS.surface}
              />
            </View>
          </Animated.View>

          <Text
            testID="sharingStatusTitle"
            style={styles.title}
            accessibilityRole="header">
            {t('shareSuccess.title')}
          </Text>
          <Text testID="sharingStatusMessage" style={styles.message}>
            {t(messageKey, {
              verifier: verifierName,
              count: sharedCards.length,
              interpolation: {escapeValue: false},
            })}
          </Text>

          <View style={styles.summary}>
            <SummaryRow
              label={t('shareSuccess.sharedWith')}
              value={verifierName}
            />
            {sharedCards.map(card => (
              <SharedCardRow
                key={new VCMetadata(card.vcMetadata).getVcKey()}
                vcMetadata={card.vcMetadata}
                selectedDisclosures={card.selectedDisclosures}
              />
            ))}
            <SummaryRow
              label={t('shareSuccess.date')}
              value={format(sharedAt, 'dd MMM yyyy, h:mm a')}
              isLast
            />
          </View>

          {isViaDeepLink && isIOS() && (
            <Text style={styles.message}>
              {t('status.accepted.additionalMessage')}
            </Text>
          )}
        </ScrollView>

        {!isViaDeepLink && (
          <View style={styles.actions}>
            <Pressable
              testID="successfullyVcSharedHomeIcon"
              accessibilityRole="button"
              onPress={goToHome}
              style={({pressed}) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.primaryButtonText}>
                {t('shareSuccess.backToWallet')}
              </Text>
            </Pressable>
            <Pressable
              testID="successfullyVcSharedHistoryIcon"
              accessibilityRole="button"
              onPress={goToHistory}
              style={({pressed}) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.secondaryButtonText}>
                {t('shareSuccess.viewHistory')}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
};

/** One shared card: its type as the label, the details it sent as the value. */
const SharedCardRow: React.FC<{
  vcMetadata: VCMetadata;
  selectedDisclosures?: string[];
}> = ({vcMetadata, selectedDisclosures}) => {
  const {t} = useTranslation('ScanScreen');
  const {controller, vc, wellknown, isLoaded} = useVcCardData(vcMetadata);
  const details = isLoaded
    ? getSharedFieldLabels(
        vc,
        controller.verifiableCredentialData.format,
        wellknown,
        selectedDisclosures,
      )
    : [];
  return (
    <SummaryRow
      label={isLoaded ? getCredentialType(wellknown) : t('shareSuccess.card')}
      value={details.length > 0 ? details.join(', ') : '…'}
    />
  );
};

const SummaryRow: React.FC<{
  label: string;
  value: string;
  isLast?: boolean;
}> = ({label, value, isLast}) => (
  <View style={[styles.row, !isLast && styles.rowDivider]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.sheetBackground,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  checkOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 24,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 30,
    color: COLORS.navy,
  },
  message: {
    marginTop: 10,
    marginHorizontal: 8,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.bodyText,
  },
  summary: {
    alignSelf: 'stretch',
    marginTop: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: {
    marginRight: 16,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: COLORS.bodyText,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.navy,
  },
  actions: {
    paddingTop: 12,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: COLORS.navy,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  primaryButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: COLORS.surface,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 12,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
    backgroundColor: COLORS.surface,
  },
  secondaryButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: COLORS.navy,
  },
  pressed: {
    opacity: 0.8,
  },
});

interface ShareSuccessScreenProps {
  isVisible: boolean;
  verifierName: string;
  sharedCards: {vcMetadata: VCMetadata; selectedDisclosures?: string[]}[];
  // Bluetooth verifiers report back that they accepted the card; online ones do not.
  wasAcceptedByVerifier: boolean;
  isViaDeepLink: boolean;
  goToHome: () => void;
  goToHistory: () => void;
}
