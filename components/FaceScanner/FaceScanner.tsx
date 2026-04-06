import React, {useEffect, useRef} from 'react';
import {ActivityIndicator} from 'react-native';
import {Column, Text} from '.././ui';
import {Theme} from '.././ui/styleUtils';
import {faceCompare} from 'react-native-nprime-face';

export const FaceScanner: React.FC<FaceScannerProps> = props => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const runNPrimeSDK = async () => {
      try {
        // 1. Get VC Image
        let vcImage =
          props.vcImages && props.vcImages.length > 0 ? props.vcImages[0] : '';

        if (vcImage.includes(',')) {
          console.info('NPrime: Cleaning Base64 metadata prefix...');
          vcImage = vcImage.split(',')[1];
        }

        console.info('NPrime: Starting face verification...');

        // 2. Call SDK
        const isMatch = await faceCompare(false, true, vcImage);

        if (isMatch) {
          console.info('NPrime: Verification Successful');

          setTimeout(() => {
            props.onValid();
          }, 500);
        } else {
          console.warn('NPrime: Verification Failed');
          props.onInvalid();
        }
      } catch (error) {
        console.error('NPrime: SDK Error', error);
        props.onInvalid();
      }
    };

    runNPrimeSDK();
  }, []);

  return (
    <Column
      fill
      align="center"
      justify="center"
      backgroundColor={Theme.Colors.white}>
      <ActivityIndicator size="large" color={Theme.Colors.primary} />

      <Text margin="16" weight="bold" align="center" color={Theme.Colors.black}>
        Initializing Secure Face Scan...
      </Text>

      <Text align="center" color={Theme.Colors.grey}>
        Please do not close the app
      </Text>
    </Column>
  );
};

interface FaceScannerProps {
  vcImages: string[];
  onValid: () => void;
  onInvalid: () => void;
  onCancel: () => void;
}
