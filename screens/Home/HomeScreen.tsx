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
import {Linking} from 'react-native';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {AddToWalletSheet} from '../../components/addCredential/AddToWalletSheet';
import {IssuerScreenTabEvents} from '../../machines/Issuers/IssuersMachine';

const CREDENTIAL_OFFER_SCHEME = 'openid-credential-offer://';

// getInitialURL keeps returning the launch link for the life of the process, and HomeScreen
// remounts after a logout, so the launch link must only be handled once.
let isInitialUrlHandled = false;

export const HomeScreen: React.FC<HomeRouteProps> = props => {
  const controller = useHomeScreen(props);
  const [isAddToWalletVisible, setIsAddToWalletVisible] = useState(false);
  const shouldScanAfterSheetCloses = useRef(false);
  const pendingCredentialOffer = useRef('');

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

  useEffect(() => {
    const startCredentialOfferDownload = (url: string | null) => {
      if (!url?.startsWith(CREDENTIAL_OFFER_SCHEME)) return;
      pendingCredentialOffer.current = url;
      controller.GOTO_ISSUERS();
    };

    if (!isInitialUrlHandled) {
      isInitialUrlHandled = true;
      Linking.getInitialURL().then(startCredentialOfferDownload);
    }
    const subscription = Linking.addEventListener('url', ({url}) =>
      startCredentialOfferDownload(url),
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (controller.IssuersService) {
      if (pendingCredentialOffer.current !== '') {
        controller.IssuersService.send(
          IssuerScreenTabEvents.SCAN_CREDENTIAL_OFFER_QR_CODE(),
        );
        controller.IssuersService.send(
          IssuerScreenTabEvents.QR_CODE_SCANNED(pendingCredentialOffer.current),
        );
        pendingCredentialOffer.current = '';
      }
      navigateToIssuers();
    }
  }, [controller.IssuersService]);

  useEffect(() => {
    if (controller.isMinimumStorageLimitReached) {
      pendingCredentialOffer.current = '';
    }
  }, [controller.isMinimumStorageLimitReached]);

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
              openVcKey={props.route.params?.openVcKey}
              onVcOpened={() =>
                props.navigation.setParams({openVcKey: undefined})
              }
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
  /** Opens this credential's detail view as soon as its card has loaded. */
  openVcKey?: string;
  onVcOpened?: () => void;
}
