import {useContext, useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from '@xstate/react';
import {MMKV} from '../../shared/storage';
import {GlobalContext} from '../../shared/GlobalContext';
import {AuthEvents, selectAuthorized} from '../../machines/auth';

const AUTO_LOCK_KEY = 'settings.autoLockMinutes';

/** Minutes in the background before the wallet locks; 0 means never. */
export const AUTO_LOCK_OPTIONS = [1, 5, 15, 0];
const DEFAULT_MINUTES = 1;

/** Screens where leaving the app is part of the flow, such as an issuer's login while downloading. */
const NO_LOCK_SCREENS = ['IssuersScreen', 'AuthView'];

function openScreens(state: any): string[] {
  const names: string[] = [];
  let node = state;
  while (node?.routes) {
    const route = node.routes[node.index ?? node.routes.length - 1];
    if (!route) break;
    names.push(route.name);
    node = route.state;
  }
  return names;
}

export function readAutoLockMinutes(): number {
  const stored = MMKV.getInt(AUTO_LOCK_KEY);
  return typeof stored === 'number' && AUTO_LOCK_OPTIONS.includes(stored)
    ? stored
    : DEFAULT_MINUTES;
}

export function useAutoLockSetting(): [number, (minutes: number) => void] {
  const [minutes, setMinutes] = useState(readAutoLockMinutes);
  const update = (next: number) => {
    MMKV.setInt(AUTO_LOCK_KEY, next);
    setMinutes(next);
  };
  return [minutes, update];
}

/**
 * Locks the wallet when it comes back to the foreground after spending longer than the chosen
 * time in the background, sending the user to the unlock screen with their data kept.
 */
export function useAutoLock() {
  const {appService} = useContext(GlobalContext);
  const authService = appService.children.get('auth')!;
  const isAuthorized = useSelector(authService, selectAuthorized);
  const navigation = useNavigation<any>();
  const leftAt = useRef<number | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background') {
        leftAt.current = Date.now();
        return;
      }
      if (state !== 'active' || leftAt.current === null) return;
      const away = Date.now() - leftAt.current;
      leftAt.current = null;
      const minutes = readAutoLockMinutes();
      const inHandOff = openScreens(navigation.getState()).some(name =>
        NO_LOCK_SCREENS.includes(name),
      );
      if (
        isAuthorized &&
        !inHandOff &&
        minutes > 0 &&
        away >= minutes * 60_000
      ) {
        navigation.navigate('Welcome');
        authService.send(AuthEvents.LOGOUT());
      }
    });
    return () => sub.remove();
  }, [isAuthorized]);
}
