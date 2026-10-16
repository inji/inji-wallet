import React, {useEffect, useRef, useState} from 'react';
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
import {IssuerScreenTabEvents} from '../../machines/Issuers/IssuersMachine';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {AddToWalletSheet} from '../../components/addCredential/AddToWalletSheet';

export const HomeScreen: React.FC<HomeRouteProps> = props => {
  const controller = useHomeScreen(props);
  const [isAddToWalletVisible, setIsAddToWalletVisible] = useState(false);
  const shouldScanAfterSheetCloses = useRef(false);

  const startScanToAdd = () => {
    shouldScanAfterSheetCloses.current = true;
    setIsAddToWalletVisible(false);
  };

  const onAddToWalletClosed = () => {
    if (shouldScanAfterSheetCloses.current) {
      shouldScanAfterSheetCloses.current = false;
      controller.GOTO_ISSUERS();
    }
  };

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
          IssuerScreenTabEvents.SCAN_CREDENTIAL_OFFER_QR_CODE(),
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
              onAddCredential={() => setIsAddToWalletVisible(true)}
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

      <AddToWalletSheet
        isVisible={isAddToWalletVisible}
        onScanToAdd={startScanToAdd}
        onCancel={() => setIsAddToWalletVisible(false)}
        onClosed={onAddToWalletClosed}
      />

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
