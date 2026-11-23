import React from 'react';
import {AppState, NativeEventEmitter, NativeModules, Text} from 'react-native';
import type {AppStateStatus} from 'react-native';
import {NavigationContext} from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import {useQrBrightness} from './useQrBrightness';

function Brightness({enabled}: {enabled: boolean}) {
  const increased = useQrBrightness(enabled);
  return <Text>{increased ? 'brightened' : 'normal'}</Text>;
}

describe('QR brightness lifecycle', () => {
  const originalModule = NativeModules.ScreenBrightness;
  const originalAppState = AppState.currentState;
  const setBoostEnabled = jest.fn();
  const releaseBoost = jest.fn();
  let onBoostChanged: (event: {isBoostApplied: boolean}) => void;
  const removeBrightnessListener = jest.fn();
  let onAppStateChange: (state: AppStateStatus) => void;
  const removeAppStateListener = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(React, 'useState')
      .mockImplementation(jest.requireActual('react').useState);
    jest
      .spyOn(React, 'useEffect')
      .mockImplementation(jest.requireActual('react').useEffect);
    AppState.currentState = 'active';
    NativeModules.ScreenBrightness = {
      setBoostEnabled,
      releaseBoost,
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    };
    setBoostEnabled.mockReset().mockImplementation(async enabled => enabled);
    releaseBoost.mockReset().mockResolvedValue(undefined);
    removeBrightnessListener.mockClear();
    removeAppStateListener.mockClear();
    jest
      .spyOn(NativeEventEmitter.prototype, 'addListener')
      .mockImplementation((event, listener) => {
        expect(event).toBe('onBrightnessBoostChanged');
        onBoostChanged = listener;
        return {remove: removeBrightnessListener};
      });
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_, listener) => {
        onAppStateChange = listener;
        return {remove: removeAppStateListener};
      });
  });
  afterEach(() => {
    NativeModules.ScreenBrightness = originalModule;
    AppState.currentState = originalAppState;
    jest.restoreAllMocks();
  });

  it('brightens only an enabled QR and restores when the QR leaves', async () => {
    const screen = render(<Brightness enabled={false} />);
    expect(setBoostEnabled).not.toHaveBeenCalled();

    await act(async () => screen.rerender(<Brightness enabled />));
    expect(setBoostEnabled).toHaveBeenLastCalledWith(true);
    expect(screen.getByText('brightened')).toBeOnTheScreen();

    await act(async () => screen.rerender(<Brightness enabled={false} />));
    expect(releaseBoost).toHaveBeenCalledTimes(1);
    expect(screen.getByText('normal')).toBeOnTheScreen();
  });

  it('restores on navigation blur and only re-enables for a focused screen', async () => {
    const listeners: Record<string, () => void> = {};
    const navigation = {
      isFocused: () => true,
      addListener: jest.fn((event, listener) => {
        listeners[event] = listener;
        return () => delete listeners[event];
      }),
    } as unknown as React.ContextType<typeof NavigationContext>;
    const screen = render(
      <NavigationContext.Provider value={navigation}>
        <Brightness enabled />
      </NavigationContext.Provider>,
    );
    await act(async () => listeners.blur());
    expect(setBoostEnabled).toHaveBeenLastCalledWith(false);
    await act(async () => onAppStateChange('active'));
    expect(setBoostEnabled).toHaveBeenLastCalledWith(false);
    await act(async () => listeners.focus());
    expect(setBoostEnabled).toHaveBeenLastCalledWith(true);
    screen.unmount();
    expect(releaseBoost).toHaveBeenCalledTimes(1);
    expect(listeners).toEqual({});
  });

  it('restores when the app becomes inactive and reapplies when it returns', async () => {
    const screen = render(<Brightness enabled />);
    await act(async () => onAppStateChange('inactive'));
    expect(setBoostEnabled).toHaveBeenLastCalledWith(false);
    await act(async () => onAppStateChange('active'));
    expect(setBoostEnabled).toHaveBeenLastCalledWith(true);
    screen.unmount();
    expect(releaseBoost).toHaveBeenCalledTimes(1);
  });

  it('ignores an earlier enable completion after the screen blurs', async () => {
    let finishIncrease: (increased: boolean) => void = () => undefined;
    setBoostEnabled.mockImplementation(enabled =>
      enabled
        ? new Promise(resolve => {
            finishIncrease = resolve;
          })
        : Promise.resolve(false),
    );
    const screen = render(<Brightness enabled />);
    await act(async () => onAppStateChange('background'));
    await act(async () => finishIncrease(true));
    expect(screen.getByText('normal')).toBeOnTheScreen();
  });

  it('yields to a native override and keeps the boost off after returning to the app', async () => {
    const screen = render(<Brightness enabled />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('brightened')).toBeOnTheScreen();
    setBoostEnabled.mockResolvedValue(false);
    await act(async () => onBoostChanged({isBoostApplied: false}));
    expect(screen.getByText('normal')).toBeOnTheScreen();
    await act(async () => onAppStateChange('inactive'));
    await act(async () => onAppStateChange('active'));
    expect(screen.getByText('normal')).toBeOnTheScreen();
    screen.unmount();
    expect(releaseBoost).toHaveBeenCalledTimes(1);
    expect(removeBrightnessListener).toHaveBeenCalledTimes(1);
  });

  it('ignores an in-flight boost result after an external brightness change', async () => {
    let finishIncrease: (increased: boolean) => void = () => undefined;
    setBoostEnabled.mockImplementation(
      () =>
        new Promise(resolve => {
          finishIncrease = resolve;
        }),
    );
    const screen = render(<Brightness enabled />);
    await act(async () => onBoostChanged({isBoostApplied: false}));
    await act(async () => finishIncrease(true));
    expect(screen.getByText('normal')).toBeOnTheScreen();
  });

  it('keeps normal help wording when native brightness fails or is unavailable', async () => {
    setBoostEnabled.mockRejectedValue(new Error('No active window'));
    const screen = render(<Brightness enabled />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('normal')).toBeOnTheScreen();
    screen.unmount();
    NativeModules.ScreenBrightness = {};
    const unavailableScreen = render(<Brightness enabled />);
    expect(unavailableScreen.getByText('normal')).toBeOnTheScreen();
  });
});
