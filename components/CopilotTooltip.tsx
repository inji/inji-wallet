import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {UseCopilotTooltip} from './CopilotTooltipController';
import {ArrowRightIcon} from './revamp/Icons';
import {useRevampTheme} from './revamp/useRevampTheme';
import {fonts, radii, shadows} from './revamp/tokens';
import {
  COPILOT_FINAL_STEP,
  COPILOT_PRE_FINAL_STEP,
  KEY_MANAGEMENT_STEP,
} from '../shared/constants';
import {useSettingsScreen} from '../screens/Settings/SettingScreenController';

export const CopilotTooltip = () => {
  const {t} = useTranslation('copilot');
  const {c} = useRevampTheme();
  const controller = UseCopilotTooltip();
  const settingsController = useSettingsScreen();

  controller.copilotEvents.on('stop', () => {
    controller.SET_TOUR_GUIDE(false);
    if (
      controller.CURRENT_STEP <= COPILOT_PRE_FINAL_STEP &&
      controller.isOnboarding
    ) {
      controller.ONBOARDING_DONE();
    }
    if (
      controller.CURRENT_STEP === COPILOT_FINAL_STEP &&
      controller.isInitialDownloading
    ) {
      controller.INITIAL_DOWNLOAD_DONE();
    }
    settingsController.BACK();
  });

  const showPrevious = !(
    controller.isFirstStep ||
    controller.CURRENT_STEP === KEY_MANAGEMENT_STEP ||
    (controller.isFinalStep && controller.isInitialDownloading)
  );
  const isDoneStep =
    controller.isLastStep || controller.CURRENT_STEP === KEY_MANAGEMENT_STEP;

  // The dots follow the same count as the "n of total" label, which shows
  // standalone steps as "1 of 1".
  const {isStandalone} = controller;
  const dotCount = isStandalone ? 1 : controller.totalStepsNumber ?? 1;
  const activeDot = isStandalone ? 0 : (controller.currentStepNumber ?? 1) - 1;

  return (
    <View>
      <View style={styles.topRow}>
        <Text
          testID={`${controller.CURRENT_STEP}stepCount`}
          style={[styles.stepCount, {color: c.azureInk}]}>
          {`${t('quickTour')} · ${controller.stepCount}`}
        </Text>
        <View
          style={styles.dots}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          {Array.from({length: dotCount}, (_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeDot
                  ? [styles.dotActive, {backgroundColor: c.primary}]
                  : {backgroundColor: c.line},
              ]}
            />
          ))}
        </View>
      </View>

      <Text
        testID={controller.titleTestID}
        style={[styles.title, {color: c.ink}]}
        accessibilityRole="header">
        {controller.currentStepTitle}
      </Text>
      <Text
        testID={controller.descriptionTestID}
        style={[styles.description, {color: c.inkMuted}]}>
        {controller.currentStepDescription}
      </Text>

      <View style={styles.actions}>
        {showPrevious ? (
          <Pressable
            testID="copilot-prev-action"
            accessibilityRole="button"
            onPress={controller.goToPrev}
            style={({pressed}) => [
              styles.textButton,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.textButtonLabel, {color: c.inkMuted}]}>
              {t('previous')}
            </Text>
          </Pressable>
        ) : !isDoneStep ? (
          <Pressable
            testID="copilot-skip-action"
            accessibilityRole="button"
            onPress={controller.stop}
            style={({pressed}) => [
              styles.textButton,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.textButtonLabel, {color: c.inkMuted}]}>
              {t('skipTour')}
            </Text>
          </Pressable>
        ) : (
          <View />
        )}

        <Pressable
          testID="copilot-next-action"
          accessibilityRole="button"
          onPress={isDoneStep ? controller.stop : controller.goToNext}
          style={({pressed}) => [
            styles.primaryButton,
            shadows.raised,
            {backgroundColor: c.primary},
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.primaryButtonLabel, {color: c.onPrimary}]}>
            {isDoneStep ? t('done') : t('next')}
          </Text>
          {!isDoneStep && (
            <View style={styles.primaryButtonIcon}>
              <ArrowRightIcon color={c.onPrimary} size={18} strokeWidth={2.4} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCount: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: 6,
  },
  dotActive: {
    width: 26,
  },
  title: {
    marginTop: 12,
    fontFamily: fonts.bold,
    fontSize: 24,
  },
  description: {
    marginTop: 10,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  textButton: {
    paddingVertical: 10,
    paddingRight: 12,
  },
  textButtonLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
  },
  primaryButtonLabel: {
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  primaryButtonIcon: {
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.8,
  },
});
