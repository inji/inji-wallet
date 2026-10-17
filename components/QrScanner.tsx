import React, {useContext, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Linking, Pressable, TouchableOpacity, View} from 'react-native';
import {Theme} from './ui/styleUtils';
import {Column, Row, Text} from './ui';
import {GlobalContext} from '../shared/GlobalContext';
import {useSelector} from '@xstate/react';
import {selectIsActive} from '../machines/app';
import {useTranslation} from 'react-i18next';
import testIDProps from '../shared/commonUtil';
import {SvgImage} from './ui/svg';
import {
  CameraView,
  useCameraPermissions,
  PermissionStatus,
  BarcodeScanningResult,
  CameraType,
} from 'expo-camera';
import {CameraPosition} from '../shared/Utils';

export const QrScanner: React.FC<QrScannerProps> = props => {
  const {t} = useTranslation('QrScanner');
  const [scanned, setScanned] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>(CameraPosition.BACK);
  const {
    hasCameraPermission,
    showCameraPermissionDeniedBanner,
    setShowCameraPermissionDeniedBanner,
    openSettings,
  } = useCameraPermission();
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);

  useEffect(() => {
    return () => {
      setIsCameraActive(false);
    };
  }, []);

  if (hasCameraPermission === null) {
    return <View />;
  }

  const CameraDisabledPopUp: React.FC = () => {
    return (
      <View
        {...testIDProps('cameraDisabledPopup')}
        style={Theme.CameraDisabledStyles.container}>
        <Column style={Theme.CameraDisabledStyles.banner}>
          <Row style={Theme.CameraDisabledStyles.bannerTextContainer}>
            <Column>
              <Text
                testID="cameraAccessDisabled"
                color={Theme.Colors.whiteText}
                margin="0 0 5 0"
                style={Theme.CameraDisabledStyles.bannerTitle}>
                {t('cameraAccessDisabled')}
              </Text>
              <Text
                testID="cameraPermissionGuide"
                color={Theme.Colors.whiteText}
                style={Theme.CameraDisabledStyles.bannerGuide}>
                {t('cameraPermissionGuideLabel')}
              </Text>
            </Column>
            <Pressable>
              <Icon
                testID="close"
                name="close"
                onPress={() => setShowCameraPermissionDeniedBanner(false)}
                color={Theme.Colors.whiteText}
                size={18}
              />
            </Pressable>
          </Row>
          <Row
            style={Theme.CameraDisabledStyles.bannerEnablePermissionContainer}>
            <Pressable
              onPress={openSettings}
              style={Theme.CameraDisabledStyles.bannerEnablePermission}>
              <Text
                testID="EnablePermissionText"
                color={Theme.Colors.whiteText}>
                {t('EnablePermission')}
              </Text>
            </Pressable>
          </Row>
        </Column>
      </View>
    );
  };

  return (
    <>
      {hasCameraPermission ? (
        <Column style={Theme.CameraEnabledStyles.container}>
          <View style={Theme.CameraEnabledStyles.scannerContainer}>
            <CameraView
              {...testIDProps('camera')}
              style={Theme.CameraEnabledStyles.scanner}
              barcodeScannerSettings={{
                barcodeTypes: [BarCodeTypes.QR],
              }}
              onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
              facing={cameraType}
              active={isCameraActive}
            />
          </View>
          <Column fill align="space-between" style={{marginTop: 24}}>
            {props.title && (
              <Text
                testID="holdPhoneSteadyMessage"
                align="center"
                style={Theme.CameraEnabledStyles.holdPhoneSteadyText}
                margin="24 57 0 57">
                {props.title}
              </Text>
            )}
            <Column crossAlign="center">
              <TouchableOpacity
                onPress={() => {
                  setCameraType(
                    cameraType === CameraPosition.FRONT
                      ? CameraPosition.BACK
                      : CameraPosition.FRONT,
                  );
                }}>
                {SvgImage.FlipCameraIcon()}
              </TouchableOpacity>
              <Text
                testID="flipCameraText"
                style={Theme.CameraEnabledStyles.iconText}>
                {t('flipCamera')}
              </Text>
            </Column>
          </Column>
        </Column>
      ) : (
        <View style={Theme.CameraDisabledStyles.scannerContainer} />
      )}
      {showCameraPermissionDeniedBanner && <CameraDisabledPopUp />}
    </>
  );

  function onBarcodeScanned(event: BarcodeScanningResult) {
    props.onQrFound(event.data);
    setScanned(true);
  }
};

/**
 * Camera permission for QR scanning: asks once when it is undetermined, re-checks whenever
 * the app comes back to the foreground, and reports whether the "camera access disabled"
 * guidance should show.
 */
export function useCameraPermission() {
  const {appService} = useContext(GlobalContext);
  const isActive = useSelector(appService, selectIsActive);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [
    showCameraPermissionDeniedBanner,
    setShowCameraPermissionDeniedBanner,
  ] = useState(false);
  const [_, requestCameraPermission, getCameraPermissionsAsync] =
    useCameraPermissions();

  const openSettings = () => Linking.openSettings();

  useEffect(() => {
    if (isActive && !Boolean(hasCameraPermission)) {
      (async () => {
        setShowCameraPermissionDeniedBanner(false);
        const cameraPermissionResult = await getCameraPermissionsAsync();
        if (cameraPermissionResult.status === PermissionStatus.UNDETERMINED) {
          const response = await requestCameraPermission();
          setHasCameraPermission(response.granted);
          if (response.granted === false) {
            setShowCameraPermissionDeniedBanner(true);
          }
        } else if (cameraPermissionResult.status === PermissionStatus.GRANTED) {
          setHasCameraPermission(true);
        } else {
          setHasCameraPermission(false);
          setShowCameraPermissionDeniedBanner(true);
        }
      })();
    }
  }, [isActive]);

  return {
    hasCameraPermission,
    showCameraPermissionDeniedBanner,
    setShowCameraPermissionDeniedBanner,
    openSettings,
  };
}

interface QrScannerProps {
  onQrFound: (data: string) => void;
  title?: string;
}

enum BarCodeTypes {
  QR = 'qr',
}
