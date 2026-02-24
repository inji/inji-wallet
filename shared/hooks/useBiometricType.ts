import {useState, useEffect, useCallback} from 'react';
import {NativeModules, Platform, AppState} from 'react-native';

export type BiometricType = 'FACE' | 'FINGERPRINT' | 'BOTH' | 'NONE';

const {RNSecureKeystoreModule} = NativeModules;

/**
 * Fetches the supported biometric type from the native secure keystore module.
 * Returns "FACE", "FINGERPRINT", "BOTH", or "NONE".
 *
 * iOS only: Uses LAContext.biometryType to reliably detect Face ID vs Touch ID.
 * Android: Always returns 'FINGERPRINT' – adaptive biometric detection is not
 *   supported on Android in this release.
 */
export async function getSupportedBiometricType(): Promise<BiometricType> {
  // Android: skip native call, always treat as fingerprint
  if (Platform.OS !== 'ios') {
    return 'FINGERPRINT';
  }

  try {
    const type = await RNSecureKeystoreModule.getSupportedBiometricType();
    if (
      type === 'FACE' ||
      type === 'FINGERPRINT' ||
      type === 'BOTH' ||
      type === 'NONE'
    ) {
      return type;
    }
    return 'NONE';
  } catch (e) {
    return 'NONE';
  }
}

/**
 * Returns a user-friendly label for the given biometric type,
 * adapting to the device's OS.
 *
 * iOS: "Face ID" / "Touch ID"
 * Android: Always returns "Biometrics" (no adaptive detection)
 */
export function getBiometricLabel(biometricType: BiometricType): string {
  if (Platform.OS === 'ios') {
    switch (biometricType) {
      case 'FACE':
      case 'BOTH':
        return 'Face ID';
      case 'FINGERPRINT':
        return 'Touch ID';
      default:
        return 'Biometrics';
    }
  }
  return 'Biometrics';
}

export function getBiometricTranslationSuffix(
  biometricType: BiometricType,
): string {
  if (Platform.OS === 'ios') {
    switch (biometricType) {
      case 'FACE':
      case 'BOTH':
        return 'FaceId';
      case 'FINGERPRINT':
        return 'TouchId';
      default:
        return 'Biometrics';
    }
  }
  return 'Biometrics';
}

export function useBiometricType() {
  const [biometricType, setBiometricType] = useState<BiometricType>('NONE');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBiometricType = useCallback(() => {
    getSupportedBiometricType()
      .then(type => {
        setBiometricType(type);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchBiometricType();

    // added a fallback timer to set biometric type to FINGERPRINT
    const fallbackTimer = setTimeout(() => {
      setIsLoading(prev => {
        if (prev) {
          setBiometricType('FINGERPRINT');
        }
        return false;
      });
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [fetchBiometricType]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchBiometricType();
      }
    });
    return () => subscription.remove();
  }, [fetchBiometricType]);

  return {
    biometricType,
    isLoading,
    biometricLabel: getBiometricLabel(biometricType),
    translationSuffix: getBiometricTranslationSuffix(biometricType),
    isFace: biometricType === 'FACE' || biometricType === 'BOTH',
    isFingerprint: biometricType === 'FINGERPRINT',
    isNone: biometricType === 'NONE',
  };
}
