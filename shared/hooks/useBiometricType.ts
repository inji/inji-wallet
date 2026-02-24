import {useState, useEffect, useCallback, useRef} from 'react';
import {NativeModules, Platform, AppState} from 'react-native';

export type BiometricType = 'FACE' | 'FINGERPRINT' | 'BOTH' | 'NONE';

const {RNSecureKeystoreModule} = NativeModules;

/**
 * Fetches the supported biometric type from the native secure keystore module.
 * Returns "FACE", "FINGERPRINT", "BOTH", or "NONE".
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
  const isLoadingRef = useRef(true);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBiometricType = useCallback(() => {
    let cancelled = false;
    isLoadingRef.current = true;

    getSupportedBiometricType()
      .then(type => {
        if (!cancelled) {
          setBiometricType(type);
        }
      })
      .finally(() => {
        if (!cancelled) {
          isLoadingRef.current = false;
          setIsLoading(false);
          if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
          }
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancelFetch = fetchBiometricType();

    fallbackTimerRef.current = setTimeout(() => {
      if (isLoadingRef.current) {
        isLoadingRef.current = false;
        setBiometricType('FINGERPRINT');
        setIsLoading(false);
      }
    }, 2000);

    return () => {
      cancelFetch();
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [fetchBiometricType]);

  useEffect(() => {
    let cancelCurrentFetch: (() => void) | null = null;

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        if (cancelCurrentFetch) {
          cancelCurrentFetch();
        }
        cancelCurrentFetch = fetchBiometricType();
      }
    });

    return () => {
      if (cancelCurrentFetch) {
        cancelCurrentFetch();
      }
      subscription.remove();
    };
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
