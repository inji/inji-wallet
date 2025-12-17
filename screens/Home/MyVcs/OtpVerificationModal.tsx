import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {PinInput} from '../../../components/PinInput';
import {Button, Column, Text} from '../../../components/ui';
import {Modal} from '../../../components/ui/Modal';
import {Theme} from '../../../components/ui/styleUtils';
import {KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import {
  getImpressionEventData,
  incrementRetryCount,
  resetRetryCount,
  sendImpressionEvent,
} from '../../../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../../../shared/telemetry/TelemetryConstants';
import {MessageOverlay} from '../../../components/MessageOverlay';
import {
  OtpVerificationModalProps,
  useOtpVerificationModal,
} from './OtpVerificationModalController';
import {GET_INDIVIDUAL_ID, isIOS} from '../../../shared/constants';
import {SvgImage} from '../../../components/ui/svg';
import {useScreenHeight} from '../../../shared/hooks/useScreenHeight';

export const OtpVerificationModal: React.FC<
  OtpVerificationModalProps
> = props => {
  const {t} = useTranslation('OtpVerificationModal');

  const [timer, setTimer] = useState(180); // 30 seconds

  const controller = useOtpVerificationModal(props);

  useEffect(() => {
    sendImpressionEvent(
      getImpressionEventData(
        props.flow,
        TelemetryConstants.Screens.otpVerificationModal,
      ),
    );
  }, [props.flow]);

  useEffect(() => {
    if (timer === 0) return;

    const intervalId = setInterval(() => {
      setTimer(timer - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timer]);

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const Seconds = seconds % 60;
    return `${minutes < 10 ? '0' + minutes : minutes}:${
      Seconds < 10 ? '0' + Seconds : Seconds
    }`;
  };

  const handleOtpResend = () => {
    incrementRetryCount(
      props.flow,
      TelemetryConstants.Screens.otpVerificationModal,
    );
    props.resend();
  };

  const handleEnteredOtp = (otp: string) => {
    resetRetryCount();
    props.onInputDone(otp);
  };

  const handleRequestOTPCancel = () => {
    GET_INDIVIDUAL_ID({id: '', idType: 'UIN'});
    controller.CANCEL();
  };

  const {isSmallScreen, screenHeight} = useScreenHeight();

  return (
    <Modal
      isVisible={props.isVisible}
      onDismiss={props.onDismiss}
      onShow={() => setTimer(180)}>
      <KeyboardAvoidingView
        style={
          isSmallScreen
            ? {flex: 1, paddingHorizontal: 10}
            : Theme.Styles.keyboardAvoidStyle
        }
        behavior={isIOS() ? 'padding' : 'height'}>
        <Column
          crossAlign="center"
          style={
            isSmallScreen
              ? null
              : {
                  maxHeight: screenHeight,
                  flex: 1,
                  justifyContent: 'space-between',
                  marginBottom: 20,
                }
          }>
          {SvgImage.OtpVerificationIcon()}
          <Text
            testID="otpVerificationHeader"
            weight="bold"
            style={Theme.TextStyles.header}>
            {t('title')}
          </Text>
          <Text
            testID="otpVerificationDescription"
            color={Theme.Colors.RetrieveIdLabel}
            weight="semibold"
            size="small"
            align="center">
            {t('otpSentMessage', {phone: props.phone, email: props.email})}
          </Text>
          <Text
            testID="otpVerificationError"
            align="center"
            color={Theme.Colors.errorMessage}>
            {props.error}
          </Text>
          <PinInput
            testID="otpVerificationPinInput"
            length={6}
            onDone={handleEnteredOtp}
            autosubmit={true}
          />
          <Column crossAlign="center">
            <Text
              testID="otpVerificationTimer"
              color={Theme.Colors.resendCodeTimer}
              weight="regular">
              {timer > 0 ? `${t('resendTheCode')} : ${formatTime(timer)}` : ''}
            </Text>

            <TouchableOpacity
              testID="resendCodeView"
              disabled={timer > 0}
              activeOpacity={1}
              onPress={
                timer > 0
                  ? null
                  : () => {
                      handleOtpResend();
                      setTimer(180);
                    }
              }>
              <Text
                testID="resendCode"
                color={
                  timer > 0 ? Theme.Colors.GrayText : Theme.Colors.AddIdBtnBg
                }
                margin="5 0 0 0"
                weight="semibold">
                {t('resendOtp')}
              </Text>
            </TouchableOpacity>
          </Column>
        </Column>
      </KeyboardAvoidingView>

      <MessageOverlay
        testID="confirmationPopupHeader"
        isVisible={controller.isDownloadCancelled}
        title={t('confirmationDialog.title')}
        message={t('confirmationDialog.message')}
        minHeight={250}>
        <Column>
          <Button
            testID="wait"
            type="gradient"
            title={t('confirmationDialog.wait')}
            onPress={controller.WAIT}
            margin={[0, 0, 8, 0]}
          />
          <Button
            testID="cancel"
            type="clear"
            title={t('confirmationDialog.cancel')}
            onPress={handleRequestOTPCancel}
          />
        </Column>
      </MessageOverlay>
    </Modal>
  );
};
