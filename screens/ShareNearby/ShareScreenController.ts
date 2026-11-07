import {useCallback, useContext, useEffect, useState} from 'react';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useSelector} from '@xstate/react';
import {GlobalContext} from '../../shared/GlobalContext';
import {ScanEvents} from '../../machines/bleShare/scan/scanMachine';
import {
  selectIsMdocReadiness,
  selectMdocEndedWithoutSharing,
  selectMdocPresentationRef,
} from '../../machines/bleShare/scan/scanSelectors';
import {selectShareableVcs} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {VCFormat} from '../../shared/VCFormat';
import {MainBottomTabParamList} from '../../routes/routeTypes';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {Theme} from '../../components/ui/styleUtils';

import {useMdocReadiness} from './readiness/MdocReadinessController';
import {useMdocPresentationScreen} from './MdocPresentationScreenController';
import {getHomeMachineService} from '../Home/HomeScreenController';
import {HomeScreenEvents} from '../Home/HomeScreenMachine';
import type {ShareTab} from './share/types';

export function useShareScreen() {
  const {appService} = useContext(GlobalContext);
  const scanService = appService.children.get('scan')!;
  const vcMetaService = appService.children.get('vcMeta')!;
  const mdocPresentationActor = useSelector(
    scanService,
    selectMdocPresentationRef,
  );
  const isShowingMdocReadiness = useSelector(
    scanService,
    selectIsMdocReadiness,
  );
  const hasEndedWithoutSharing = useSelector(
    scanService,
    selectMdocEndedWithoutSharing,
  );
  const hasMdocCredential = useSelector(vcMetaService, snapshot =>
    selectShareableVcs(snapshot).some(
      vc => vc.vcMetadata.format === VCFormat.mso_mdoc,
    ),
  );
  const navigation =
    useNavigation<
      NavigationProp<MainBottomTabParamList & {Request: undefined}>
    >();
  const [selectedTab, setSelectedTab] = useState<ShareTab>('scan');
  const [isHelpVisible, setHelpVisible] = useState(false);

  const GOTO_HOME = useCallback(
    () => navigation.navigate(BOTTOM_TAB_ROUTES.home),
    [navigation],
  );
  const SHOW_SCAN_TAB = useCallback(() => setSelectedTab('scan'), []);
  const GOTO_HISTORY = useCallback(
    () => navigation.navigate(BOTTOM_TAB_ROUTES.history),
    [navigation],
  );
  // As MainLayout does for offers: Home opens the issuer list once its issuers machine starts.
  const GOTO_ADD_CARD = useCallback(() => {
    getHomeMachineService()?.send(HomeScreenEvents.GOTO_ISSUERS());
    navigation.navigate(BOTTOM_TAB_ROUTES.home);
  }, [navigation]);
  const presentationController = useMdocPresentationScreen(
    mdocPresentationActor,
    GOTO_HOME,
    SHOW_SCAN_TAB,
    GOTO_HISTORY,
    GOTO_ADD_CARD,
  );
  const readinessController = useMdocReadiness();
  // Share nearby stays on screen while readiness is checked; Bluetooth off is a sheet over
  // it (NBY-03). Only the other readiness problems take over the screen.
  const readinessIssue = presentationController
    ? undefined
    : isShowingMdocReadiness
    ? readinessController.readinessIssue
    : undefined;
  const isShowingBluetoothSheet = readinessIssue === 'bluetooth';
  const isShowingReadinessScreen =
    readinessIssue !== undefined && !isShowingBluetoothSheet;
  const isShowingMdocFlow =
    !!presentationController || isShowingReadinessScreen;
  // The mobile ID flow is full screen in the design: no bottom tabs while it runs.
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: isShowingMdocFlow
        ? {display: 'none'}
        : Theme.BottomTabBarStyle.tabBarStyle,
    });
  }, [navigation, isShowingMdocFlow]);

  return {
    presentationController,
    readinessController,
    mdocPresentationActor,
    isShowingMdocReadiness: isShowingReadinessScreen,
    isShowingBluetoothSheet,
    hasMdocCredential,
    hasEndedWithoutSharing,
    selectedTab,
    isHelpVisible,
    SELECT_TAB: (tab: ShareTab) => setSelectedTab(tab),
    OPEN_HELP: () => setHelpVisible(true),
    CLOSE_HELP: () => setHelpVisible(false),
    DISMISS_SESSION_ENDED: () =>
      scanService.send(ScanEvents.DISMISS_MDOC_BANNER()),
    PRESENT_MDOC: () => scanService.send(ScanEvents.PRESENT_MDOC()),
    RECEIVE_CARD: () => navigation.navigate('Request'),
    GOTO_HOME,
  };
}
