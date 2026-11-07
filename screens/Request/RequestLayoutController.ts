import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useSelector} from '@xstate/react';
import {useContext, useEffect} from 'react';

import {MainBottomTabParamList} from '../../routes/routeTypes';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  selectIsWaitingForConnection,
  selectSenderInfo,
  selectIsDone,
  selectIsNavigatingToReceivedCards,
  selectIsNavigatingToHome,
} from '../../machines/bleShare/request/selectors';
import {
  selectIsAccepted,
  selectIsDisconnected,
  selectIsHandlingBleError,
  selectIsRejected,
  selectIsReviewing,
  selectBleError,
} from '../../machines/bleShare/commonSelectors';
import {RequestEvents} from '../../machines/bleShare/request/requestMachine';
import {
  BOTTOM_TAB_ROUTES,
  REQUEST_ROUTES,
  RequestStackParamList,
} from '../../routes/routesConstants';
import {VCSharingErrorStatusProps} from '../../components/MessageOverlay';
import {useTranslation} from 'react-i18next';

type RequestLayoutNavigation = NavigationProp<
  RequestStackParamList & MainBottomTabParamList
>;

export function useRequestLayout() {
  const {t} = useTranslation('RequestScreen');
  const {appService} = useContext(GlobalContext);
  const requestService = appService.children.get('request');
  const navigation = useNavigation<RequestLayoutNavigation>();

  useEffect(() => {
    const subscriptions = [
      navigation.addListener('focus', () =>
        requestService.send(RequestEvents.SCREEN_FOCUS()),
      ),
      navigation.addListener('blur', () =>
        requestService.send(RequestEvents.SCREEN_BLUR()),
      ),
    ];

    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
      // Native-stack Back can unmount this screen without emitting blur.
      requestService.send(RequestEvents.SCREEN_BLUR());
    };
  }, [navigation, requestService]);

  const isReviewing = useSelector(requestService, selectIsReviewing);
  const isDone = useSelector(requestService, selectIsDone);
  const isBleError = useSelector(requestService, selectIsHandlingBleError);
  const bleError = useSelector(requestService, selectBleError);
  const isDisconnected = useSelector(requestService, selectIsDisconnected);
  const isWaitingForConnection = useSelector(
    requestService,
    selectIsWaitingForConnection,
  );
  const isNavigatingToReceivedCards = useSelector(
    requestService,
    selectIsNavigatingToReceivedCards,
  );
  const isNavigationToHome = useSelector(
    requestService,
    selectIsNavigatingToHome,
  );

  let errorStatusOverlay: Pick<
    VCSharingErrorStatusProps,
    'title' | 'message'
  > | null = null;
  if (isDisconnected) {
    errorStatusOverlay = {
      title: t('status.disconnected.title'),
      message: t('status.disconnected.message'),
    };
  } else if (isBleError) {
    errorStatusOverlay = {
      title: t(`status.bleError.${bleError.code}.title`),
      message: t(`status.bleError.${bleError.code}.message`),
    };
  }

  useEffect(() => {
    if (isNavigationToHome) {
      navigation.navigate(BOTTOM_TAB_ROUTES.home);
    } else if (isReviewing) {
      navigation.navigate(REQUEST_ROUTES.ReceiveVcScreen);
    } else if (isWaitingForConnection) {
      navigation.navigate(REQUEST_ROUTES.RequestScreen);
    }
  }, [isNavigationToHome, isReviewing, isWaitingForConnection]);

  return {
    senderInfo: useSelector(requestService, selectSenderInfo),

    isAccepted: useSelector(requestService, selectIsAccepted),
    isRejected: useSelector(requestService, selectIsRejected),
    isDisconnected,
    isBleError,
    bleError,
    errorStatusOverlay,
    isReviewing,
    isDone,
    isNavigatingToReceivedCards,
    DISMISS: () => requestService.send(RequestEvents.DISMISS()),
    RESET: () => requestService.send(RequestEvents.RESET()),
    GOTO_HOME: () => requestService.send(RequestEvents.GOTO_HOME()),
  };
}
