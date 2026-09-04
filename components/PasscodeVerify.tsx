import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {PinInput} from './PinInput';
import {encodePinHash, hashData, parsePinHash} from '../shared/commonUtil';
import {CURRENT_PIN_KDF_VERSION, PIN_KDF_PROFILES} from '../shared/constants';
import {
  getErrorEventData,
  sendErrorEvent,
} from '../shared/telemetry/TelemetryUtils';
import {TelemetryConstants} from '../shared/telemetry/TelemetryConstants';

export const MAX_PIN = 6;

export const PasscodeVerify: React.FC<PasscodeVerifyProps> = props => {
  const {t} = useTranslation('PasscodeVerify');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (isVerified) {
      props.onSuccess();
      setIsVerified(false);
    }
  }, [isVerified]);

  return (
    <PinInput
      testID={props.testID}
      length={MAX_PIN}
      onDone={verify}
      autosubmit={true}
    />
  );

  async function verify(value: string) {
    try {
      const {version, hash: storedHash} = parsePinHash(props.passcode);
      const config = PIN_KDF_PROFILES[version] ?? PIN_KDF_PROFILES.v1;
      const candidate = await hashData(value, props.salt, config);

      if (storedHash !== candidate) {
        if (props.onError) {
          props.onError(t('passcodeMismatchError'));
        }
        return;
      }

      if (version !== CURRENT_PIN_KDF_VERSION && props.onUpgrade) {
        try {
          const upgradedHash = await hashData(
            value,
            props.salt,
            PIN_KDF_PROFILES[CURRENT_PIN_KDF_VERSION],
          );
          props.onUpgrade(encodePinHash(CURRENT_PIN_KDF_VERSION, upgradedHash));
        } catch (upgradeError) {
          console.warn(
            'PIN hash upgrade failed, will retry next login',
            upgradeError,
          );
        }
      }

      setIsVerified(true);
    } catch (error) {
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.appLogin,
          TelemetryConstants.ErrorId.mismatch,
          error,
        ),
      );
      if (props.onError) {
        props.onError(
          t('passcodeVerifyError', {
            defaultValue: 'Something went wrong. Please try again.',
          }),
        );
      }
      console.error('error while verifying passCode ', error);
    }
  }
};

interface PasscodeVerifyProps {
  passcode: string;
  onSuccess: () => void;
  onError?: (error: string) => void;
  onUpgrade?: (newHash: string) => void;
  salt: string;
  testID: string;
}
