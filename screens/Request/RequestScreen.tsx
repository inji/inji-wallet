import React, {useEffect, useState} from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import {Centered, Button, Column, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {useRequestScreen} from './RequestScreenController';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {View} from 'react-native';
import {ErrorMessageOverlay} from '../../components/MessageOverlay';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainBottomTabParamList} from '../../routes/main';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {ProgressingModal} from '../../components/ProgressingModal';
import {isIOS} from '../../shared/constants';
import testIDProps from '../../shared/commonUtil';

type RequestStackParamList = {
  RequestScreen: undefined;
  ReceiveVcScreen: undefined;
};

type RequestLayoutNavigation = NavigationProp<
  RequestStackParamList & MainBottomTabParamList
>;

export const RequestScreen: React.FC = () => {
  const {t} = useTranslation('RequestScreen');
  const controller = useRequestScreen();
  const props: RequestScreenProps = {t, controller};
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);
  const navigation = useNavigation<RequestLayoutNavigation>();

  useEffect(() => {
    (async () => {
      await BluetoothStateManager.onStateChange(state => {
        if (state === 'PoweredOff') {
          setIsBluetoothOn(false);
        } else {
          setIsBluetoothOn(true);
        }
      }, true);
    })();
  }, [isBluetoothOn]);

  return (
    <Column
      fill
      padding="24"
      align="space-between"
      backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
      {loadQRCode()}
      {controller.isMinimumStorageLimitReached && (
        <ErrorMessageOverlay
          isVisible={controller.isMinimumStorageLimitReached}
          error="errors.storageLimitReached"
          onDismiss={() => {
            navigation.navigate(BOTTOM_TAB_ROUTES.home);
          }}
          translationPath="RequestScreen"
        />
      )}
    </Column>
  );

  function loadQRCode() {
    if (controller.isNearByDevicesPermissionDenied) {
      return <NearByPrompt {...props} />;
    }
    if (
      (controller.isBluetoothDenied || !isBluetoothOn) &&
      controller.isReadyForBluetoothStateCheck
    ) {
      return <BluetoothPrompt {...props} />;
    }
    if (
      !controller.isCheckingBluetoothService &&
      !controller.isBluetoothDenied
    ) {
      return (
        <React.Fragment>
          <Column align="flex-end" fill>
            {controller.isWaitingForConnection && <SharingQR {...props} />}
            <StatusMessage {...props} />
          </Column>
          <ProgressingModal
            title={controller.statusTitle}
            isVisible={
              controller.isWaitingForVc || controller.isWaitingForVcTimeout
            }
            isHintVisible={false}
            isBleErrorVisible={false}
            progress={true}
            onCancel={controller.CANCEL}
          />
        </React.Fragment>
      );
    }
  }
};

const BluetoothPrompt: React.FC<RequestScreenProps> = ({t}) => {
  return (
    <Centered fill>
      <Text
        testID="bluetoothIsTurnedOffMessage"
        color={Theme.Colors.errorMessage}
        align="center"
        margin="0 10">
        {t(isIOS() ? 'bluetoothStateIos' : 'bluetoothStateAndroid')}
      </Text>
    </Centered>
  );
};

const NearByPrompt: React.FC<RequestScreenProps> = ({t, controller}) => {
  return (
    <Column fill align="space-between">
      <Centered fill>
        <Text
          testID="allowNearbyDevicesPermissionMessage"
          color={Theme.Colors.errorMessage}
          align="center">
          {t('errors.nearbyDevicesPermissionDenied.message')}
        </Text>
      </Centered>
      <Button
        testID="allowNearbyDevicesPermissionButton"
        title={t('errors.nearbyDevicesPermissionDenied.button')}
        onPress={controller.GOTO_SETTINGS}
      />
    </Column>
  );
};

const SharingQR: React.FC<RequestScreenProps> = ({t, controller}) => {
  return (
    <React.Fragment>
      <Text testID="showQrCode" align="center">
        {t('showQrCode')}
      </Text>

      <Centered fill>
        {controller.openId4VpUri !== '' ? (
          <View {...testIDProps('qrCode')}>
            <QRCode
              size={200}
              value={controller.openId4VpUri}
              backgroundColor={Theme.Colors.QRCodeBackgroundColor}
            />
          </View>
        ) : null}
      </Centered>
    </React.Fragment>
  );
};

const StatusMessage: React.FC<RequestScreenProps> = ({t, controller}) => {
  return (
    controller.statusMessage !== '' && (
      <Column testID="recievedCardStatus" elevation={1} padding="16 24">
        <Text testID="receiveCardStatusMessage">
          {controller.statusMessage}
        </Text>
        {controller.statusHint !== '' && (
          <Text
            testID="receiveCardStatusHint"
            size="small"
            color={Theme.Colors.textLabel}>
            {controller.statusHint}
          </Text>
        )}
      </Column>
    )
  );
};

interface RequestScreenProps {
  t: TFunction;
  controller: ReturnType<typeof useRequestScreen>;
}
