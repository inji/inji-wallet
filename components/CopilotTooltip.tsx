import React from 'react';
import {Text, Button, Row, Column} from './../components/ui';
import {useTranslation} from 'react-i18next';
import {UseCopilotTooltip} from './CopilotTooltipController';
import {Theme} from './ui/styleUtils';
import {
  COPILOT_FINAL_STEP,
  COPILOT_PRE_FINAL_STEP,
  KEY_MANAGEMENT_STEP,
} from '../shared/constants';
import {useSettingsScreen} from '../screens/Settings/SettingScreenController';

export const CopilotTooltip = () => {
  const {t} = useTranslation('copilot');
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

  return (
    <Column style={Theme.Styles.copilotBgContainer}>
      <Text testID={controller.titleTestID} weight="bold" margin="0 0 10 0">
        {controller.currentStepTitle}
      </Text>
      <Text testID={controller.descriptionTestID}>
        {controller.currentStepDescription}
      </Text>
      <Row
        align="space-between"
        crossAlign="center"
        style={Theme.Styles.copilotButtonsContainer}>
        <Text testID={`${controller.CURRENT_STEP}stepCount`} weight="bold">
          {controller.stepCount}
        </Text>
        <Row>
          {controller.isFirstStep ||
          controller.CURRENT_STEP === KEY_MANAGEMENT_STEP ||
          (controller.isFinalStep && controller.isInitialDownloading) ? null : (
            <Button
              testID={'copilot-prev-action'}
              title={t('previous')}
              type="outline"
              styles={Theme.Styles.copilotButton}
              onPress={controller.goToPrev}
            />
          )}
          {controller.isLastStep ||
          controller.CURRENT_STEP === KEY_MANAGEMENT_STEP ? (
            <Button
              testID={'copilot-next-action'}
              title={t('done')}
              type="gradient"
              styles={Theme.Styles.copilotButton}
              onPress={controller.stop}
            />
          ) : (
            <Button
              testID={'copilot-next-action'}
              title={t('next')}
              type="gradient"
              styles={Theme.Styles.copilotButton}
              onPress={controller.goToNext}
            />
          )}
        </Row>
      </Row>
    </Column>
  );
};
