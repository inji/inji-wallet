import React from 'react';
import {useTranslation} from 'react-i18next';
import {MessageOverlay} from '../components/MessageOverlay';
import {Button, Column, Text} from '../components/ui';
import {Theme} from '../components/ui/styleUtils';
import {RootRouteProps} from '../routes';
import {useAuthScreen} from './AuthScreenController';
import {
  getStartEventData,
  getInteractEventData,
  sendInteractEvent,
  sendStartEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';
import {SvgImage} from '../components/ui/svg';

export const AuthScreen: React.FC<RootRouteProps> = props => {
  const {t} = useTranslation('AuthScreen');
  const controller = useAuthScreen(props);

  const handleUsePasscodeButtonPress = () => {
    sendStartEvent(
      getStartEventData(TelemetryConstants.FlowType.appOnboarding),
    );
    sendInteractEvent(
      getInteractEventData(
        TelemetryConstants.FlowType.appOnboarding,
        TelemetryConstants.InteractEventSubtype.click,
        'Use Passcode Button',
      ),
    );
    controller.navigateToPasscode();
  };
  return (
    <Column
      fill
      padding={[32, 25, 32, 32]}
      backgroundColor={Theme.Colors.whiteBackgroundColor}
      align="space-between">
      <MessageOverlay
        isVisible={controller.alertMsg != ''}
        onBackdropPress={controller.hideAlert}
        title={controller.alertMsg}
      />
      <Column crossAlign="center">
        {SvgImage.fingerprintIcon(66)}
        <Column margin="30 0 0 0">
          <Text
            testID="selectAppUnlockMethod"
            align="center"
            style={Theme.TextStyles.header}>
            {t('header')}
          </Text>
          <Text
            testID="description"
            align="center"
            style={{paddingTop: 3}}
            weight="semibold"
            color={Theme.Colors.GrayText}
            margin="6 0">
            {t('Description')}
          </Text>
          <Text
            testID="passwordTypeDescription"
            align="center"
            style={{paddingTop: 3}}
            weight="semibold"
            color={Theme.Colors.GrayText}
            margin="6 0">
            {t('PasswordTypeDescription')}
          </Text>
        </Column>
      </Column>

      <Column>
        <Button
          testID="useBiometrics"
          title={t('useBiometrics')}
          type="gradient"
          margin="0 0 8 0"
          disabled={!controller.isBiometricsAvailable}
          onPress={controller.useBiometrics}
        />
        <Button
          testID="usePasscode"
          type="clear"
          title={t('usePasscode')}
          onPress={() => handleUsePasscodeButtonPress()}
        />
      </Column>
    </Column>
  );
};
