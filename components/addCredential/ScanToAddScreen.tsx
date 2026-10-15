import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Text} from '../ui';
import {PillButton} from '../ui/PillButton';
import {QrScanFrame} from '../ui/QrScanFrame';
import {Theme} from '../ui/styleUtils';
import {ColorTokens} from '../ui/themes/designTokens';
import {useCameraPermission} from '../QrScanner';
import testIDProps from '../../shared/commonUtil';

const {brand: B} = Theme.Tokens;
const DARK = ColorTokens.dark;

const FRAME_SIZE = Math.min(Dimensions.get('window').width - 96, 300);

/**
 * Full-screen QR scanner for credential offers. While `isCameraActive` is false the frame stays
 * on screen without scanning, as the backdrop for the processing state and the trust sheet.
 */
export const ScanToAddScreen: React.FC<ScanToAddScreenProps> = props => {
  const {t} = useTranslation('ScanToAdd');
  const insets = useSafeAreaInsets();
  const {hasCameraPermission, openSettings} = useCameraPermission();
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const isScanning =
    props.isCameraActive && hasCameraPermission === true && !hasScanned;

  useEffect(() => {
    if (props.isCameraActive) {
      setHasScanned(false);
    }
  }, [props.isCameraActive]);

  const onQrFound = (data: string) => {
    setHasScanned(true);
    props.onQrFound(data);
  };

  return (
    <View {...testIDProps('scanToAddScreen')} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DARK.canvas} />
      <LinearGradient
        colors={[DARK.canvas, DARK.sand, DARK.canvas]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.topBar, {paddingTop: insets.top + 8}]}>
        <RoundIconButton
          testID="scanToAddClose"
          icon="close"
          accessibilityLabel={t('close')}
          onPress={props.onClose}
        />
        <Text
          testID="scanToAddTitle"
          weight="bold"
          color={B.onNavy}
          style={styles.title}>
          {t('title')}
        </Text>
        {hasCameraPermission === true && (
          <RoundIconButton
            testID="scanToAddTorch"
            icon={isTorchOn ? 'flash' : 'flash-outline'}
            accessibilityLabel={isTorchOn ? t('torchOff') : t('torchOn')}
            onPress={() => setIsTorchOn(!isTorchOn)}
          />
        )}
      </View>

      <View style={styles.frameArea}>
        <QrScanFrame
          size={FRAME_SIZE}
          hasCameraPermission={hasCameraPermission}
          isCameraActive={props.isCameraActive}
          isScanning={isScanning}
          isTorchOn={isTorchOn}
          onQrFound={onQrFound}
        />

        <View style={styles.footer}>
          {props.isProcessing ? (
            <>
              <ActivityIndicator size="small" color={B.cyan} />
              <Text
                testID="scanToAddProcessing"
                weight="semibold"
                align="center"
                color={B.onNavy}
                style={styles.footerTitle}>
                {t('processingTitle')}
              </Text>
              <Text
                size="small"
                align="center"
                color={B.mist}
                style={styles.footerBody}>
                {t('processingBody')}
              </Text>
            </>
          ) : hasCameraPermission === false ? (
            <>
              <Text
                testID="cameraAccessOff"
                weight="semibold"
                align="center"
                color={B.onNavy}
                style={styles.footerTitle}>
                {t('cameraOffTitle')}
              </Text>
              <Text
                size="small"
                align="center"
                color={B.mist}
                style={styles.footerBody}>
                {t('cameraOffBody')}
              </Text>
              <PillButton
                testID="openCameraSettings"
                variant="light"
                title={t('openSettings')}
                onPress={openSettings}
                style={styles.settingsButton}
              />
            </>
          ) : (
            <>
              <Text
                testID="scanToAddInstruction"
                weight="semibold"
                align="center"
                color={B.onNavy}
                style={styles.footerTitle}>
                {t('instructionTitle')}
              </Text>
              <Text
                size="small"
                align="center"
                color={B.mist}
                style={styles.footerBody}>
                {t('instructionBody')}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const RoundIconButton: React.FC<{
  testID: string;
  /** MaterialCommunityIcons name. */
  icon: string;
  accessibilityLabel: string;
  onPress: () => void;
}> = props => (
  <Pressable
    {...testIDProps(props.testID)}
    accessibilityRole="button"
    accessibilityLabel={props.accessibilityLabel}
    hitSlop={8}
    onPress={props.onPress}
    style={({pressed}) => [
      styles.roundButton,
      pressed && styles.roundButtonPressed,
    ]}>
    <Icon
      name={props.icon}
      type="material-community"
      size={22}
      color={B.onNavy}
    />
  </Pressable>
);

interface ScanToAddScreenProps {
  onQrFound: (data: string) => void;
  onClose: () => void;
  isCameraActive: boolean;
  isProcessing?: boolean;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK.canvas,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
    marginLeft: 14,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: B.navyFill,
    borderWidth: 1,
    borderColor: B.navyLine,
  },
  roundButtonPressed: {
    opacity: 0.7,
  },
  frameArea: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Dimensions.get('window').height * 0.07,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 36,
  },
  footerTitle: {
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
  },
  footerBody: {
    marginTop: 8,
    lineHeight: 19,
  },
  settingsButton: {
    marginTop: 20,
    alignSelf: 'stretch',
  },
});
