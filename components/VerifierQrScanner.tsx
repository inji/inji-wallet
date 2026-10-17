import React, {useEffect, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {BarcodeScanningResult, CameraView} from 'expo-camera';
import {useTranslation} from 'react-i18next';
import {useCameraPermission} from './QrScanner';
import {Theme} from './ui/styleUtils';
import testIDProps from '../shared/commonUtil';
import {CameraPosition} from '../shared/Utils';

const COLORS = Theme.Colors.Design;
const CORNER_SIZE = 64;
const CORNER_THICKNESS = 5;
const CORNER_RADIUS = 28;
const SCAN_LINE_HEIGHT = 3;
const SCAN_SWEEP_MS = 1800;

/**
 * Dark QR scanner for the Scan tab: the back camera inside a frame with cyan corners and a
 * sweeping scan line, and guidance under it. Without camera access the frame shows a QR
 * placeholder and the guidance points to Settings.
 */
export const VerifierQrScanner: React.FC<VerifierQrScannerProps> = ({
  onQrFound,
  isTorchOn,
  title,
  subtitle,
}) => {
  const {t} = useTranslation('ScanScreen');
  const {width} = useWindowDimensions();
  const frameSize = Math.min(width - 96, 320);
  const {hasCameraPermission, openSettings} = useCameraPermission();
  const [scanned, setScanned] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);

  useEffect(() => {
    return () => setIsCameraActive(false);
  }, []);

  // The line sweeps down and back, unless the phone asks for reduced motion.
  const scanPosition = useRef(new Animated.Value(0)).current;
  useEffect(() => {
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
        if (isActive) {
          if (reduceMotion) {
            scanPosition.setValue(1);
          } else {
            sweep.start();
          }
        }
      });
    return () => {
      isActive = false;
      sweep.stop();
    };
  }, []);
  const scanTranslateY = scanPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [CORNER_THICKNESS * 3, frameSize - CORNER_THICKNESS * 4],
  });

  const onBarcodeScanned = (event: BarcodeScanningResult) => {
    setScanned(true);
    onQrFound(event.data);
  };

  const isPermissionDenied = hasCameraPermission === false;

  return (
    <View style={styles.container}>
      <View style={{width: frameSize, height: frameSize}}>
        <View style={styles.preview}>
          {hasCameraPermission ? (
            <CameraView
              {...testIDProps('camera')}
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{barcodeTypes: ['qr']}}
              onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
              facing={CameraPosition.BACK}
              enableTorch={isTorchOn}
              active={isCameraActive}
            />
          ) : (
            <Icon
              name="qrcode"
              type="material-community"
              size={frameSize * 0.55}
              color={COLORS.darkPlaceholder}
            />
          )}
        </View>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
        {!isPermissionDenied && (
          <Animated.View
            style={[
              styles.scanLine,
              {transform: [{translateY: scanTranslateY}]},
            ]}
          />
        )}
      </View>

      <Text testID="holdPhoneSteadyMessage" style={styles.title}>
        {isPermissionDenied ? t('cameraOffTitle') : title}
      </Text>
      <Text style={styles.subtitle}>
        {isPermissionDenied ? t('cameraOffSubtitle') : subtitle}
      </Text>
      {isPermissionDenied && (
        <Pressable
          testID="EnablePermissionText"
          accessibilityRole="button"
          onPress={openSettings}
          style={({pressed}) => [
            styles.settingsButton,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.settingsButtonText}>{t('openSettings')}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  preview: {
    ...StyleSheet.absoluteFillObject,
    margin: CORNER_THICKNESS,
    borderRadius: CORNER_RADIUS - CORNER_THICKNESS,
    overflow: 'hidden',
    backgroundColor: COLORS.darkSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLORS.scanLine,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: CORNER_RADIUS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: CORNER_RADIUS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: CORNER_RADIUS,
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: CORNER_THICKNESS * 3,
    right: CORNER_THICKNESS * 3,
    height: SCAN_LINE_HEIGHT,
    borderRadius: SCAN_LINE_HEIGHT,
    backgroundColor: COLORS.scanLine,
    shadowColor: COLORS.scanLine,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 0},
    elevation: 6,
  },
  title: {
    marginTop: 32,
    marginHorizontal: 12,
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.darkText,
  },
  subtitle: {
    marginTop: 10,
    marginHorizontal: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.darkMutedText,
  },
  settingsButton: {
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  settingsButtonText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 16,
    color: COLORS.navy,
  },
  pressed: {
    opacity: 0.8,
  },
});

interface VerifierQrScannerProps {
  onQrFound: (data: string) => void;
  isTorchOn: boolean;
  title: string;
  subtitle: string;
}
