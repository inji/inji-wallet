import {useInterpret, useSelector} from '@xstate/react';
import {useContext, useEffect, useRef} from 'react';
import {HomeRouteProps} from '../../routes/routeTypes';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  HomeScreenEvents,
  HomeScreenMachine,
  selectActiveTab,
  selectSelectedVc,
  selectTabRefs,
  selectTabsLoaded,
  selectViewingVc,
  selectIssuersMachine,
  selectIsMinimumStorageLimitReached,
  selectIsIssuerMachineBusyForDeepLink,
} from './HomeScreenMachine';
import {selectVc} from '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';

let homeMachineService;
function useCreateHomeMachineService() {
  const {appService} = useContext(GlobalContext);
  const machine = useRef(
    HomeScreenMachine.withContext({
      ...HomeScreenMachine.context,
      serviceRefs: appService.getSnapshot().context.serviceRefs,
    }),
  );
  return (homeMachineService = useInterpret(machine.current));
}

export function getHomeMachineService() {
  return homeMachineService;
}

export function useHomeScreen(props: HomeRouteProps) {
  const service = useCreateHomeMachineService();

  useEffect(() => {
    if (props.route.params?.activeTab != null) {
      SELECT_TAB(props.route.params.activeTab);
    }
  }, [props.route.params, props.route.params?.activeTab]);

  return {
    service,
    activeTab: useSelector(service, selectActiveTab),
    selectedVc: useSelector(service, selectSelectedVc),
    isIssuerMachineBusyForDeepLink: useSelector(
      service,
      selectIsIssuerMachineBusyForDeepLink,
    ),
    vc: useSelector(service, selectVc),
    tabRefs: useSelector(service, selectTabRefs),
    isViewingVc: useSelector(service, selectViewingVc),
    haveTabsLoaded: useSelector(service, selectTabsLoaded),
    IssuersService: useSelector(service, selectIssuersMachine),
    isMinimumStorageLimitReached: useSelector(
      service,
      selectIsMinimumStorageLimitReached,
    ),
    DISMISS: () => service.send(HomeScreenEvents.DISMISS()),
    GOTO_ISSUERS: () => service.send(HomeScreenEvents.GOTO_ISSUERS()),
    DISMISS_MODAL: () => service.send(HomeScreenEvents.DISMISS_MODAL()),
  };

  function SELECT_TAB(index: number) {
    const tabs = [
      HomeScreenEvents.SELECT_MY_VCS,
      HomeScreenEvents.SELECT_RECEIVED_VCS,
      HomeScreenEvents.SELECT_HISTORY,
    ];
    service.send(tabs[index]());
  }
}
