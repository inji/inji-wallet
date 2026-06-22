import React from 'react';
import {Icon} from 'react-native-elements';
import {Theme} from '../../../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {BindingVcWarningOverlay} from './BindingVcWarningOverlay';
import {OtpVerificationModal} from './OtpVerificationModal';
import {MessageOverlay} from '../../../components/MessageOverlay';
import {useKebabPopUp} from '../../../components/KebabPopUpController';
import {ActorRefFrom} from 'xstate';
import {VCMetadata} from '../../../shared/VCMetadata';
import {TelemetryConstants} from '../../../shared/telemetry/TelemetryConstants';
import {VCItemMachine} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {useOverlayVisibleAfterTimeout} from '../../../shared/hooks/useOverlayVisibleAfterTimeout';
import {isAndroid} from '../../../shared/constants';

export const WalletVerified: React.FC = () => {
  return (
    <Icon
      name="verified-user"
      color={Theme.Colors.VerifiedIcon}
      size={28}
      containerStyle={{marginStart: 4, bottom: 1}}
    />
  );
};

export const WalletBinding: React.FC<WalletBindingProps> = props => {
  const controller = useKebabPopUp(props);
  const {t} = useTranslation('WalletBinding');
  const delay = isAndroid() ? 0 : 200;
  const isWalletBindingInProgress = useOverlayVisibleAfterTimeout(
    controller.walletBindingInProgress,
    delay,
  );
  const isWalletBindingError = useOverlayVisibleAfterTimeout(
    !!controller.walletBindingError,
    delay,
  );

  return (
    <>
      <BindingVcWarningOverlay
        isVisible={controller.isBindingWarning}
        onConfirm={controller.CONFIRM}
        onCancel={controller.CANCEL}
      />

      {controller.isAcceptingOtpInput && (
        <OtpVerificationModal
          service={props.service}
          isVisible={controller.isAcceptingOtpInput}
          onDismiss={controller.DISMISS}
          onInputDone={controller.INPUT_OTP}
          error={controller.otpError}
          resend={controller.RESEND_OTP}
          phone={controller.communicationDetails.phoneNumber}
          email={controller.communicationDetails.emailId}
          flow={TelemetryConstants.FlowType.vcActivationFromKebab}
        />
      )}

      <MessageOverlay
        key="walletBindingError"
        testID="walletBindingError"
        isVisible={isWalletBindingError}
        title={controller.walletBindingError}
        onBackdropPress={controller.CANCEL}
        onButtonPress={controller.CANCEL}
      />
      <MessageOverlay
        key={'walletBindingProgress'}
        isVisible={isWalletBindingInProgress}
        title={t('inProgress')}
        progress
      />
    </>
  );
};

interface WalletBindingProps {
  testID?: string;
  service: ActorRefFrom<typeof VCItemMachine>;
  vcMetadata: VCMetadata;
}
