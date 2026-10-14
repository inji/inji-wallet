import React, {useEffect, useRef} from 'react';
import {Column} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {HomeRouteProps} from '../../routes/routeTypes';
import {MyVcsTab} from './MyVcsTab';
import {ReceivedVcsTab} from './ReceivedVcsTab';
import {ViewVcModal} from './ViewVcModal';
import {useHomeScreen} from './HomeScreenController';
import {TabRef} from './HomeScreenMachine';
import {ActorRefFrom} from 'xstate';
import {ErrorMessageOverlay} from '../../components/MessageOverlay';
import {DeviceEventEmitter} from 'react-native';
import {SCAN_TO_ADD_EVENT} from '../../components/revamp/RevampTabBar';
import {IssuersEvents} from '../../machines/Issuers/IssuersEvents';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';

export const HomeScreen: React.FC<HomeRouteProps> = props => {
  const controller = useHomeScreen(props);

  // The bottom bar's Scan opens the add-card flow straight into its QR scanner.
  const scanOnOpen = useRef(false);
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(SCAN_TO_ADD_EVENT, () => {
      scanOnOpen.current = true;
      controller.GOTO_ISSUERS();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (controller.IssuersService) {
      navigateToIssuers();
      if (scanOnOpen.current) {
        scanOnOpen.current = false;
        (controller.IssuersService as {send: (event: object) => void}).send(
          IssuersEvents.SCAN_CREDENTIAL_OFFER_QR_CODE(),
        );
      }
    }
  }, [controller.IssuersService]);

  const navigateToIssuers = () => {
    props.navigation.navigate('IssuersScreen', {
      service: controller.IssuersService,
    });
  };

  return (
    <React.Fragment>
      <BannerNotificationContainer />
      <Column fill backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
        {controller.haveTabsLoaded && (
          <Column fill>
            <MyVcsTab
              isVisible={controller.activeTab === 0}
              onAddCredential={controller.GOTO_ISSUERS}
              service={controller.tabRefs.myVcs}
              vcItemActor={controller.selectedVc}
              isViewingVc={controller.isViewingVc}
            />
            <ReceivedVcsTab
              isVisible={controller.activeTab === 1}
              service={controller.tabRefs.receivedVcs}
              vcItemActor={controller.selectedVc}
            />
          </Column>
        )}
      </Column>

      <ErrorMessageOverlay
        translationPath={'MyVcsTab'}
        isVisible={controller.isMinimumStorageLimitReached}
        error={'errors.storageLimitReached'}
        onDismiss={controller.DISMISS}
      />
      {controller.selectedVc && (
        <ViewVcModal
          isVisible={controller.isViewingVc}
          onDismiss={controller.DISMISS_MODAL}
          vcItemActor={controller.selectedVc}
          activeTab={controller.activeTab}
          flow="downloadedVc"
        />
      )}
    </React.Fragment>
  );
};

export interface HomeScreenTabProps {
  isViewingVc: any;
  isVisible: boolean;
  service: TabRef;
  vcItemActor: ActorRefFrom<typeof VCItemMachine>;
  vc: VerifiableCredential | Credential;
  onAddCredential?: () => void;
}
