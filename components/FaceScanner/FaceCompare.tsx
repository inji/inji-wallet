import React, {useEffect, useState} from 'react';
import {CameraType, CameraView} from 'expo-camera';
import {View, TouchableOpacity} from 'react-native';
import {SvgImage} from '../ui/svg';
import {Text, Column, Row, Centered} from '../ui';
import {RotatingIcon} from '../RotatingIcon';
import {Theme} from '../ui/styleUtils';
import testIDProps from '../../shared/commonUtil';

const FaceCompare: React.FC<FaceCompareProps> = ({
  whichCamera,
  setCameraRef,
  isCapturing,
  isVerifying,
  flipCamera,
  service,
  t,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);

  useEffect(() => {
    return () => {
      setIsCameraActive(false);
    };
  }, []);

  return (
    <Column fill align="space-between" style={{backgroundColor: '#ffffff'}}>
      <View style={{flex: 2, marginTop: 15}}>
        <View style={Theme.CameraEnabledStyles.scannerContainer}>
          <View>
            <CameraView
              {...testIDProps('camera')}
              style={Theme.CameraEnabledStyles.scanner}
              facing={whichCamera}
              ref={setCameraRef}
              active={isCameraActive}
            />
          </View>
        </View>
        <Text
          testID="imageCaptureGuide"
          align="center"
          weight="semibold"
          style={Theme.TextStyles.base}
          margin="80 57">
          {t('imageCaptureGuide')}
        </Text>
      </View>
      <Centered>
        {isCapturing || isVerifying ? (
          <RotatingIcon name="sync" size={64} />
        ) : (
          <Row align="center">
            <Centered style={Theme.Styles.imageCaptureButton}>
              <TouchableOpacity
                testID="captureButton"
                onPress={() => service.send('CAPTURE')}>
                {SvgImage.CameraCaptureIcon()}
              </TouchableOpacity>
              <Text
                testID="captureText"
                style={Theme.CameraEnabledStyles.iconText}>
                {t('capture')}
              </Text>
            </Centered>
            <Centered>
              <TouchableOpacity testID="flipCameraButton" onPress={flipCamera}>
                {SvgImage.FlipCameraIcon()}
              </TouchableOpacity>
              <Text
                testID="flipCameraText"
                style={Theme.CameraEnabledStyles.iconText}>
                {t('flipCamera')}
              </Text>
            </Centered>
          </Row>
        )}
      </Centered>
    </Column>
  );
};

export default FaceCompare;

interface FaceCompareProps {
  whichCamera: CameraType;
  setCameraRef: (node: CameraView) => void;
  isCapturing: boolean;
  isVerifying: boolean;
  flipCamera: () => void;
  service: any;
  t: (key: string) => string;
}
