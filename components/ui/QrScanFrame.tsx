import React, {useEffect, useRef} from 'react';
import {AccessibilityInfo, Animated, Easing, StyleSheet, View} from 'react-native';
import {BarcodeScanningResult, CameraView} from 'expo-camera';
import {Theme} from './styleUtils';
import {ColorTokens} from './themes/designTokens';
import testIDProps from '../../shared/commonUtil';
import {CameraPosition} from '../../shared/Utils';

const {brand: B} = Theme.Tokens;
const CORNER_SIZE = 44;
const CORNER_THICKNESS = 4;
const CORNER_RADIUS = 22;
const CAMERA_INSET = 10;
const SCAN_LINE_INSET = 18;
const SCAN_SWEEP_MS = 1800;

/**
 * Square camera window with cyan corners for the dark scanning screens. The camera only
 * shows once permission is granted; the sweeping line and `onQrFound` only run while
 * `isScanning`, so the frame can stay on screen as a backdrop after a scan.
 */
export const QrScanFrame: React.FC<QrScanFrameProps> = ({
  size,
  hasCameraPermission,
  isCameraActive,
  isScanning,
  isTorchOn,
  onQrFound,
}) => {
  const onBarcodeScanned = (event: BarcodeScanningResult) =>
    onQrFound(event.data);

  return (
    <View style={{width: size, height: size}}>
      <View style={styles.cameraWindow}>
        {hasCameraPermission && (
          <CameraView
            {...testIDProps('camera')}
            style={StyleSheet.absoluteFill}
            facing={CameraPosition.BACK}
            active={isCameraActive}
            enableTorch={isTorchOn && isCameraActive}
            barcodeScannerSettings={{barcodeTypes: ['qr']}}
            onBarcodeScanned={isScanning ? onBarcodeScanned : undefined}
          />
        )}
      </View>
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
      {isScanning && <ScanLine frameSize={size} />}
    </View>
  );
};

/** Sweeps down and back across the frame; holds still when the phone asks for reduced motion. */
const ScanLine: React.FC<{frameSize: number}> = ({frameSize}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;
    const sweep = Animated.loop(
      Animated.sequence(
        [1, 0].map(toValue =>
          Animated.timing(progress, {
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
        if (!isMounted) {
          return;
        }
        if (reduceMotion) {
          progress.setValue(0.5);
        } else {
          sweep.start();
        }
      });
    return () => {
      isMounted = false;
      sweep.stop();
    };
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.scanLine,
        {
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [SCAN_LINE_INSET, frameSize - SCAN_LINE_INSET],
              }),
            },
          ],
        },
      ]}
    />
  );
};

interface QrScanFrameProps {
  size: number;
  hasCameraPermission: boolean | null;
  isCameraActive: boolean;
  isScanning: boolean;
  isTorchOn: boolean;
  onQrFound: (data: string) => void;
}

const styles = StyleSheet.create({
  cameraWindow: {
    ...StyleSheet.absoluteFillObject,
    margin: CAMERA_INSET,
    borderRadius: CORNER_RADIUS - 4,
    overflow: 'hidden',
    backgroundColor: ColorTokens.dark.card,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: B.cyan,
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
    left: SCAN_LINE_INSET,
    right: SCAN_LINE_INSET,
    height: 2,
    borderRadius: 1,
    backgroundColor: B.cyan,
    shadowColor: B.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 0},
  },
});
