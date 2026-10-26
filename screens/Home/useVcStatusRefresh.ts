import {useContext, useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {useSelector} from '@xstate/react';
import {GlobalContext} from '../../shared/GlobalContext';
import {selectIsOnline} from '../../machines/app';
import {selectIsRefreshingMyVcs} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {VcMetaEvents} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaMachine';

/**
 * Runs "Check Card Status" on every card in the wallet whenever the cards finish loading (the
 * app being opened and unlocked, or a pull to refresh) and whenever the app comes back from
 * the background, which is also when an auto-locked wallet is unlocked. Offline, where the
 * check can't reach the issuer's status list, it waits for the connection to come back.
 * Cards checked recently are skipped, except after a pull to refresh.
 */
export function useVcStatusRefresh() {
  const {appService} = useContext(GlobalContext);
  const vcMetaService = appService.children.get('vcMeta')!;
  const isLoadingVcs = useSelector(vcMetaService, selectIsRefreshingMyVcs);
  const isOnline = useSelector(appService, selectIsOnline);
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  const pulledToRefresh = useRef(false);

  const reverifyAll = (ignoreRecentChecks = false) => {
    if (!isOnlineRef.current) return;
    vcMetaService.send(VcMetaEvents.REVERIFY_ALL_VCS(ignoreRecentChecks));
  };

  useEffect(() => {
    if (isLoadingVcs || !isOnline) return;
    reverifyAll(pulledToRefresh.current);
    pulledToRefresh.current = false;
  }, [isLoadingVcs, isOnline]);

  useEffect(() => {
    let wasInBackground = false;
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'background') {
        wasInBackground = true;
      } else if (state === 'active' && wasInBackground) {
        wasInBackground = false;
        reverifyAll();
      }
    });
    return () => subscription.remove();
  }, []);

  return {
    /** Call when the user pulls to refresh, before the cards reload. */
    onPullToRefresh: () => {
      pulledToRefresh.current = true;
    },
  };
}
