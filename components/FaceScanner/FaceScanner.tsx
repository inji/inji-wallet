import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {CameraType, CameraView} from 'expo-camera';
import {Button, Column, Text} from '.././ui';
import {useInterpret, useSelector} from '@xstate/react';
import {useTranslation} from 'react-i18next';
import {
  createFaceScannerMachine,
  FaceScannerEvents,
  selectCameraRef,
  selectIsCapturing,
  selectIsCheckingPermission,
  selectIsInvalid,
  selectIsPermissionDenied,
  selectIsScanning,
  selectIsValid,
  selectIsVerifying,
} from '../../machines/faceScanner';
import {GlobalContext} from '../../shared/GlobalContext';
import {selectIsActive} from '../../machines/app';
import {Theme} from '.././ui/styleUtils';
import {getRandomInt} from '../../shared/commonUtil';
import {
  cropEyeAreaFromFace,
  faceDetectorConfig,
  getFaceBounds,
  imageCaptureConfig,
} from './FaceScannerHelper';
import LivenessDetection from './LivenessDetection';
import FaceCompare from './FaceCompare';
import {LIVENESS_CHECK} from '../../shared/constants';
import {CameraPosition} from '../../shared/Utils';

export const FaceScanner: React.FC<FaceScannerProps> = props => {
  const {t} = useTranslation('FaceScanner');
  const {appService} = useContext(GlobalContext);
  const isActive = useSelector(appService, selectIsActive);

  const machine = useRef(createFaceScannerMachine(props.vcImages));
  const service = useInterpret(machine.current);

  const [cameraType, setCameraType] = useState<CameraType>(
    CameraPosition.FRONT,
  );
  const cameraRef = useSelector(service, selectCameraRef);

  const isPermissionDenied = useSelector(service, selectIsPermissionDenied);
  const isValid = useSelector(service, selectIsValid);
  const isInvalid = useSelector(service, selectIsInvalid);
  const isCheckingPermission = useSelector(service, selectIsCheckingPermission);
  const isScanning = useSelector(service, selectIsScanning);
  const isCapturing = useSelector(service, selectIsCapturing);
  const isVerifying = useSelector(service, selectIsVerifying);

  const [counter, setCounter] = useState(0);
  const [screenColor, setScreenColor] = useState('#0000ff');
  const [faceToCompare, setFaceToCompare] = useState(null);
  const [opacity, setOpacity] = useState(1);
  const [picArray, setPicArray] = useState([]);

  const screenFlashColors = ['#0000FF', '#00FF00', '#FF0000'];
  const MAX_COUNTER = 15;

  const randomNumToFaceCompare = getRandomInt(counter, MAX_COUNTER - 1);
  const [infoText, setInfoText] = useState<string>(t('livenessCaptureGuide'));

  const setCameraRef = useCallback(
    (node: CameraView) => {
      if (node != null && !isScanning) {
        service.send(FaceScannerEvents.READY(node));
      }
    },
    [isScanning, service],
  );

  const flipCamera = () => {
    setCameraType(prevType =>
      prevType === CameraPosition.FRONT
        ? CameraPosition.BACK
        : CameraPosition.FRONT,
    );
  };

  const handleOnCancel = () => {
    props.onCancel();
  };

  const captureImage = async (screenColor: string) => {
    try {
      if (cameraRef) {
        const capturedImage = await cameraRef.takePictureAsync(
          imageCaptureConfig,
        );
        setPicArray(prevArray => [
          ...prevArray,
          {color: screenColor, image: capturedImage},
        ]);
        if (counter === randomNumToFaceCompare) {
          setFaceToCompare(capturedImage);
        }
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };

  const handleFacesDetected = async ({faces}: {faces: any[]}) => {
    if (!faces || faces.length === 0) return;

    if (counter === MAX_COUNTER) {
      setCounter(prev => prev + 1);
      cameraRef?.pausePreview();

      setScreenColor('#ffffff');
      setInfoText(t('faceProcessingInfo'));

      const result = await cropEyeAreaFromFace(
        picArray,
        props.vcImages[0],
        faceToCompare,
      );
      return result ? props.onValid() : props.onInvalid();
    }

    const face = faces[0];
    const [withinXBounds, withinYBounds, withinYawAngle, withinRollAngle] =
      getFaceBounds(face);

    if (withinXBounds && withinYBounds && withinRollAngle && withinYawAngle) {
      setScreenColor(screenFlashColors[getRandomInt(0, 2)]);
      setCounter(prev => prev + 1);
      setInfoText(t('faceInGuide'));
      await captureImage(screenColor);
    } else {
      setInfoText(t('faceOutGuide'));
    }
  };

  useEffect(() => {
    if (isValid) props.onValid();
    if (isInvalid) props.onInvalid();
  }, [isValid, isInvalid, props]);

  useEffect(() => {
    if (isActive) {
      service.send(FaceScannerEvents.APP_FOCUSED());
    }
  }, [isActive, service]);

  if (isCheckingPermission) {
    return <Column>{undefined}</Column>;
  }

  if (isPermissionDenied) {
    return (
      <Column padding="24" fill align="space-between">
        <Text
          testID="missingPermissionText"
          align="center"
          color={Theme.Colors.errorMessage}>
          {t('missingPermissionText')}
        </Text>
        <Button
          testID="allowCameraButton"
          title={t('allowCameraButton')}
          onPress={() => service.send(FaceScannerEvents.OPEN_SETTINGS())}
        />
      </Column>
    );
  }

  if (LIVENESS_CHECK) {
    return (
      <LivenessDetection
        screenColor={screenColor}
        infoText={infoText}
        whichCamera={cameraType}
        setCameraRef={setCameraRef}
        handleFacesDetected={handleFacesDetected}
        faceDetectorConfig={faceDetectorConfig}
        handleOnCancel={handleOnCancel}
        opacity={opacity}
        setOpacity={setOpacity}
        t={t}
      />
    );
  }

  return (
    <FaceCompare
      whichCamera={cameraType}
      setCameraRef={setCameraRef}
      flipCamera={flipCamera}
      isCapturing={isCapturing}
      isVerifying={isVerifying}
      service={service}
      t={t}
    />
  );
};

interface FaceScannerProps {
  vcImages: string[];
  onValid: () => void;
  onInvalid: () => void;
  onCancel: () => void;
}
