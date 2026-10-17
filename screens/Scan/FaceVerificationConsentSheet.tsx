import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {BottomSheet} from '../../components/BottomSheet';
import {Theme} from '../../components/ui/styleUtils';

const COLORS = Theme.Colors.Design;
const AVATAR_SIZE = 96;
const AVATAR_BORDER = 3;
const SCAN_LINE_HEIGHT = 3;
const SCAN_SWEEP_MS = 1400;

/**
 * Asks for consent to the selfie check before cards with a photo are shared over
 * OpenID4VP. Continue stays disabled until the holder ticks the agreement.
 */
export const FaceVerificationConsentSheet: React.FC<
  FaceVerificationConsentSheetProps
> = ({
  isVisible,
  face,
  photoCardName,
  cardNames,
  verifierName,
  onConfirm,
  onCancel,
}) => {
  const {t} = useTranslation('SendVPScreen');
  const [hasAgreed, setHasAgreed] = useState(false);

  // A line sweeping over the photo while the sheet is open, unless the phone asks for
  // reduced motion.
  const scanPosition = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isVisible || !face) {
      return;
    }
    let isActive = true;
    const sweep = Animated.loop(
      Animated.sequence(
        [1, 0].map(toValue =>
          Animated.timing(scanPosition, {
            toValue,
            duration: SCAN_SWEEP_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ),
      ),
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then(reduceMotion => {
        if (isActive && !reduceMotion) {
          scanPosition.setValue(0);
          sweep.start();
        }
      });
    return () => {
      isActive = false;
      sweep.stop();
    };
  }, [isVisible, face]);
  const scanTranslateY = scanPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, AVATAR_SIZE - 2 * AVATAR_BORDER - SCAN_LINE_HEIGHT],
  });

  // Continue closes the sheet first and confirms once it is gone, because confirming
  // opens the selfie camera in a modal of its own.
  const [isConfirming, setIsConfirming] = useState(false);
  const hasConfirmedRef = useRef(false);
  const onSheetClosed = () => {
    if (isConfirming && !hasConfirmedRef.current) {
      hasConfirmedRef.current = true;
      onConfirm();
    }
  };

  // Each request asks afresh.
  useEffect(() => {
    if (!isVisible) {
      setIsConfirming(false);
      hasConfirmedRef.current = false;
    }
    if (isVisible) {
      setHasAgreed(false);
    }
  }, [isVisible]);

  const interpolation = {escapeValue: false};
  const card = photoCardName || t('cardFallback');
  const cards = formatList(
    cardNames.length > 0 ? cardNames : [card],
    t('listAnd'),
  );
  const points = t('faceConsentPoints', {
    returnObjects: true,
    card,
    verifier: verifierName,
    interpolation,
  });

  return (
    <BottomSheet
      isVisible={isVisible && !isConfirming}
      onRequestClose={onCancel}
      onClosed={onSheetClosed}
      testID="faceVerificationConsentSheet">
      <View style={styles.header}>
        <View style={styles.avatar}>
          {face ? (
            <>
              <Image source={{uri: face}} style={styles.avatarImage} />
              <Animated.View
                style={[
                  styles.scanLine,
                  {transform: [{translateY: scanTranslateY}]},
                ]}
              />
            </>
          ) : (
            <Icon
              name="account-outline"
              type="material-community"
              size={44}
              color={COLORS.navy}
            />
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">
            {t('faceConsentTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {t('faceConsentSubtitle', {card, interpolation})}
          </Text>
        </View>
      </View>

      <View style={styles.pointsBox}>
        {Array.isArray(points) &&
          points.map((point: string, index: number) => (
            <View
              key={index}
              style={[
                styles.point,
                index === points.length - 1 && styles.lastPoint,
              ]}>
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
      </View>

      <Pressable
        testID="faceConsentAgree"
        accessibilityRole="checkbox"
        accessibilityState={{checked: hasAgreed}}
        onPress={() => setHasAgreed(agreed => !agreed)}
        style={styles.agreeRow}>
        <View style={[styles.checkbox, hasAgreed && styles.checkboxOn]}>
          {hasAgreed && (
            <Icon
              name="check"
              type="material-community"
              size={20}
              color={COLORS.surface}
            />
          )}
        </View>
        <Text style={styles.agreeText}>
          {t('faceConsentAgree', {
            cards,
            verifier: verifierName,
            interpolation,
          })}
        </Text>
      </Pressable>

      <Pressable
        testID="faceConsentContinue"
        accessibilityRole="button"
        accessibilityState={{disabled: !hasAgreed}}
        disabled={!hasAgreed}
        onPress={() => setIsConfirming(true)}
        style={({pressed}) => [
          styles.continueButton,
          !hasAgreed && styles.continueButtonDisabled,
          pressed && styles.pressed,
        ]}>
        <Text
          style={[
            styles.continueText,
            !hasAgreed && styles.continueTextDisabled,
          ]}>
          {hasAgreed
            ? t('faceConsentContinue')
            : t('faceConsentTickToContinue')}
        </Text>
      </Pressable>

      <Pressable
        testID="faceConsentNotNow"
        accessibilityRole="button"
        onPress={onCancel}
        style={({pressed}) => [styles.notNowButton, pressed && styles.pressed]}>
        <Text style={styles.notNowText}>{t('faceConsentNotNow')}</Text>
      </Pressable>
    </BottomSheet>
  );
};

// "A", "A and B", "A, B and C".
function formatList(items: string[], and: string): string {
  if (items.length <= 1) {
    return items[0] ?? '';
  }
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: AVATAR_BORDER,
    borderColor: COLORS.navy,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCAN_LINE_HEIGHT,
    backgroundColor: COLORS.scanLine,
    shadowColor: COLORS.scanLine,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 26,
    color: COLORS.navy,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.bodyText,
  },
  pointsBox: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    padding: 18,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  lastPoint: {
    marginBottom: 0,
  },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.mutedIcon,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkboxOn: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.teal,
  },
  agreeText: {
    flex: 1,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.navy,
  },
  continueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    borderRadius: 29,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.mutedBackground,
  },
  continueText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: COLORS.surface,
  },
  continueTextDisabled: {
    color: COLORS.bodyText,
  },
  notNowButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  notNowText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: COLORS.link,
  },
  pressed: {
    opacity: 0.8,
  },
});

interface FaceVerificationConsentSheetProps {
  isVisible: boolean;
  // Photo from the card the selfie is matched against.
  face?: string;
  // Type name of that card, e.g. "National ID".
  photoCardName?: string;
  // Type names of every card being shared.
  cardNames: string[];
  verifierName: string;
  onConfirm: () => void;
  onCancel: () => void;
}
