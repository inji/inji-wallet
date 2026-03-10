import {useState, useEffect} from 'react';
import {NativeModules, AppState} from 'react-native';
import {isAndroid} from '../constants';

export enum BiometricType {
  FACE = 'FACE',
  FINGERPRINT = 'FINGERPRINT',
  NONE = 'NONE',
}

export type BiometricCategory = 'face' | 'fingerprint' | 'none';

const {RNSecureKeystoreModule} = NativeModules;

export async function getAvailableBiometricType(): Promise<BiometricType> {
  if (isAndroid()) {
    return BiometricType.FINGERPRINT;
  }

  try {
    const type = await RNSecureKeystoreModule.getAvailableBiometricType();
    if (
      type === BiometricType.FACE ||
      type === BiometricType.FINGERPRINT ||
      type === BiometricType.NONE
    ) {
      return type;
    }
    return BiometricType.NONE;
  } catch (e) {
    return BiometricType.NONE;
  }
}

export function getBiometricLabel(biometricType: BiometricType): string {
  if (isAndroid()) {
    return 'Biometrics';
  }
  switch (biometricType) {
    case BiometricType.FACE:
      return 'Face ID';
    case BiometricType.FINGERPRINT:
      return 'Touch ID';
    default:
      return 'Biometrics';
  }
}

export function getBiometricTranslationSuffix(
  biometricType: BiometricType,
): string {
  if (isAndroid()) {
    return 'Biometrics';
  }
  switch (biometricType) {
    case BiometricType.FACE:
      return 'FaceId';
    case BiometricType.FINGERPRINT:
      return 'TouchId';
    default:
      return 'Biometrics';
  }
}

export function getBiometricCategory(
  biometricType: BiometricType,
): BiometricCategory {
  switch (biometricType) {
    case BiometricType.FACE:
      return 'face';
    case BiometricType.FINGERPRINT:
      return 'fingerprint';
    default:
      return 'none';
  }
}

export function useBiometricType() {
  const [biometricType, setBiometricType] = useState<BiometricType>(
    BiometricType.NONE,
  );
  const [isBiometricsLoading, setIsBiometricsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      if (!cancelled) {
        setBiometricType(BiometricType.FINGERPRINT);
        setIsBiometricsLoading(false);
      }
    }, 2000);

    getAvailableBiometricType()
      .then(type => {
        if (!cancelled) {
          clearTimeout(timer);
          setBiometricType(type);
          setIsBiometricsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(timer);
          setIsBiometricsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        getAvailableBiometricType().then(setBiometricType);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    biometricType,
    isBiometricsLoading,
    biometricLabel: getBiometricLabel(biometricType),
    translationSuffix: getBiometricTranslationSuffix(biometricType),
    biometricCategory: getBiometricCategory(biometricType),
  };
}
