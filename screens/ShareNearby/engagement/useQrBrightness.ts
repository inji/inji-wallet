import {useContext, useEffect, useState} from 'react';
import {AppState, NativeEventEmitter, NativeModules} from 'react-native';
import {NavigationContext} from '@react-navigation/native';

export function useQrBrightness(enabled: boolean) {
  const navigation = useContext(NavigationContext);
  const [isBrightnessIncreased, setBrightnessIncreased] = useState(false);

  useEffect(() => {
    setBrightnessIncreased(false);
    const brightnessModule = NativeModules.ScreenBrightness;
    if (
      !enabled ||
      !brightnessModule?.setBoostEnabled ||
      !brightnessModule?.releaseBoost
    )
      return;

    let isDisposed = false;
    let isFocused = navigation?.isFocused() ?? true;
    let isAppActive = AppState.currentState === 'active';
    let updateNumber = 0;
    const updateBrightness = () => {
      const currentUpdate = ++updateNumber;
      const shouldIncreaseBrightness = isFocused && isAppActive;
      if (!shouldIncreaseBrightness) setBrightnessIncreased(false);
      Promise.resolve(
        brightnessModule.setBoostEnabled(shouldIncreaseBrightness),
      ).then(
        (increased: boolean) => {
          if (!isDisposed && currentUpdate === updateNumber)
            setBrightnessIncreased(increased);
        },
        () => {
          if (!isDisposed && currentUpdate === updateNumber)
            setBrightnessIncreased(false);
        },
      );
    };
    const brightnessSubscription = new NativeEventEmitter(
      brightnessModule,
    ).addListener(
      'onBrightnessBoostChanged',
      ({isBoostApplied}: {isBoostApplied: boolean}) => {
        if (isDisposed) return;
        updateNumber += 1;
        setBrightnessIncreased(isBoostApplied && isFocused && isAppActive);
      },
    );
    const appStateSubscription = AppState.addEventListener('change', state => {
      isAppActive = state === 'active';
      updateBrightness();
    });
    const unsubscribeFocus = navigation?.addListener('focus', () => {
      isFocused = true;
      updateBrightness();
    });
    const unsubscribeBlur = navigation?.addListener('blur', () => {
      isFocused = false;
      updateBrightness();
    });
    updateBrightness();

    return () => {
      isDisposed = true;
      appStateSubscription.remove();
      brightnessSubscription.remove();
      unsubscribeFocus?.();
      unsubscribeBlur?.();
      void Promise.resolve(brightnessModule.releaseBoost()).catch(
        () => undefined,
      );
    };
  }, [enabled, navigation]);

  return enabled && isBrightnessIncreased;
}
