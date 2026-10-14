import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Theme} from './ui/styleUtils';
import {VerifierAvatar} from './VerifierAvatar';

const COLORS = Theme.Colors.Design;

/**
 * Bottom sheet asking the user to trust an OpenID4VP verifier the first time it sends a
 * request. Confirming stores the verifier, so this is not shown for it again.
 */
export const TrustModalVerifier = ({
  isVisible,
  logo,
  name,
  url,
  requestName,
  isRegistered,
  onConfirm,
  onCancel,
}: {
  isVisible: boolean;
  logo?: string;
  name: string;
  url?: string;
  requestName?: string;
  isRegistered?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  const {t} = useTranslation('trustScreen');
  const insets = useSafeAreaInsets();
  const infoPoints = t('verifierInfoPoints', {returnObjects: true});

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, {paddingBottom: insets.bottom + 8}]}>
          <View style={styles.handle} />
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            <View style={styles.badge}>
              <Icon
                name="alert-circle-outline"
                type="material-community"
                size={16}
                color={COLORS.warningText}
              />
              <Text style={styles.badgeText}>{t('verifierFirstTime')}</Text>
            </View>

            <Text style={styles.title} accessibilityRole="header">
              {t('verifierTitle')}
            </Text>

            <View style={styles.card}>
              <View style={styles.verifierRow}>
                <View style={styles.avatar}>
                  <VerifierAvatar logo={logo} />
                </View>
                <View style={styles.verifierInfo}>
                  <Text
                    style={styles.verifierName}
                    numberOfLines={2}
                    testID="trustVerifierName">
                    {name}
                  </Text>
                  {isRegistered && (
                    <View style={styles.registeredRow}>
                      <Icon
                        name="shield-check-outline"
                        type="material-community"
                        size={16}
                        color={COLORS.teal}
                      />
                      <Text style={styles.registeredText}>
                        {t('registeredVerifier')}
                      </Text>
                    </View>
                  )}
                  {!!url && (
                    <Text
                      style={styles.url}
                      numberOfLines={2}
                      testID="trustVerifierUrl">
                      {url}
                    </Text>
                  )}
                </View>
              </View>

              {!!requestName && (
                <View style={styles.requestRow}>
                  <Text style={styles.requestLabel}>{t('wantsToCheck')}</Text>
                  <Text style={styles.requestValue} numberOfLines={2}>
                    {requestName}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.intro}>{t('verifierIntro', {name})}</Text>

            {Array.isArray(infoPoints) &&
              infoPoints.map((point: string, index: number) => (
                <View key={index} style={styles.point}>
                  <View style={styles.checkCircle}>
                    <Icon
                      name="check"
                      type="material-community"
                      size={16}
                      color={COLORS.teal}
                    />
                  </View>
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
          </ScrollView>

          <Pressable
            testID="trustVerifierConfirm"
            accessibilityRole="button"
            onPress={onConfirm}
            style={({pressed}) => [
              styles.confirmButton,
              pressed && styles.pressed,
            ]}>
            <Icon
              name="shield-check-outline"
              type="material-community"
              size={22}
              color={COLORS.surface}
            />
            <Text style={styles.confirmText}>{t('verifierConfirm')}</Text>
          </Pressable>
          <Pressable
            testID="trustVerifierCancel"
            accessibilityRole="button"
            onPress={onCancel}
            style={({pressed}) => [
              styles.cancelButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: COLORS.sheetBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.sheetHandle,
    marginBottom: 18,
  },
  content: {
    paddingBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningBackground,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    marginLeft: 6,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: COLORS.warningText,
  },
  title: {
    marginTop: 10,
    marginBottom: 18,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 28,
    color: COLORS.navy,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 22,
    padding: 18,
  },
  verifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  verifierInfo: {
    flex: 1,
  },
  verifierName: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    color: COLORS.navy,
  },
  registeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  registeredText: {
    flexShrink: 1,
    marginLeft: 5,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: COLORS.teal,
  },
  url: {
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: COLORS.bodyText,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  requestLabel: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: COLORS.bodyText,
  },
  requestValue: {
    flexShrink: 1,
    marginLeft: 12,
    textAlign: 'right',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    color: COLORS.navy,
  },
  intro: {
    marginTop: 20,
    marginBottom: 14,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.bodyText,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  pointText: {
    flex: 1,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.navy,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    marginTop: 10,
    borderRadius: 29,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  confirmText: {
    marginLeft: 10,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: COLORS.surface,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: COLORS.link,
  },
  pressed: {
    opacity: 0.8,
  },
});
