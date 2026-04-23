import {AppState, AppStateStatus} from 'react-native';
import {isAndroid} from '../shared/constants';

type FocusStateEvent = {type: 'ACTIVE'} | {type: 'INACTIVE'};

type FocusStateCallback = (event: FocusStateEvent) => void;

export function createCheckFocusStateService(callback: FocusStateCallback) {
  const changeHandler = (newState: AppStateStatus) => {
    switch (newState) {
      case 'background':
      case 'inactive':
        callback({type: 'INACTIVE'});
        break;
      case 'active':
        callback({type: 'ACTIVE'});
        break;
    }
  };

  const blurHandler = () => callback({type: 'INACTIVE'});
  const focusHandler = () => callback({type: 'ACTIVE'});

  const changeEventSubscription = AppState.addEventListener(
    'change',
    changeHandler,
  );

  let blurEventSubscription: {remove: () => void} | undefined;
  let focusEventSubscription: {remove: () => void} | undefined;

  if (isAndroid()) {
    blurEventSubscription = AppState.addEventListener('blur', blurHandler);
    focusEventSubscription = AppState.addEventListener('focus', focusHandler);
  }

  const currentState = AppState.currentState;
  if (currentState) {
    changeHandler(currentState);
  }

  return () => {
    changeEventSubscription.remove();
    blurEventSubscription?.remove();
    focusEventSubscription?.remove();
  };
}
