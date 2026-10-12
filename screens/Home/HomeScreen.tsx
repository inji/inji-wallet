import React, {useEffect, useRef} from 'react';
import {Icon} from 'react-native-elements';
import {Column} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {HomeRouteProps} from '../../routes/routeTypes';
import {MyVcsTab} from './MyVcsTab';
import {ReceivedVcsTab} from './ReceivedVcsTab';
import {ViewVcModal} from './ViewVcModal';
import {useHomeScreen} from './HomeScreenController';
import {TabRef} from './HomeScreenMachine';
import {ActorRefFrom} from 'xstate';
import LinearGradient from 'react-native-linear-gradient';
import {ErrorMessageOverlay} from '../../components/MessageOverlay';
import {Linking, Pressable} from 'react-native';
import testIDProps from '../../shared/commonUtil';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {useTranslation} from 'react-i18next';
import {Copilot} from '../../components/ui/Copilot';
import {IssuerScreenTabEvents} from '../../machines/Issuers/IssuersMachine';

const CREDENTIAL_OFFER_SCHEME = 'openid-credential-offer://';

// getInitialURL keeps returning the launch link for the life of the process, and HomeScreen
// remounts after a logout, so the launch link must only be handled once.
let isInitialUrlHandled = false;

export const HomeScreen: React.FC<HomeRouteProps> = props => {
  const controller = useHomeScreen(props);
  const {t} = useTranslation();
  const pendingCredentialOffer = useRef('');

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

  const DownloadFABIcon: React.FC = () => {
    const plusIcon = (
      <Icon
        {...testIDProps('plusIcon')}
        accessible={true}
        name={'plus'}
        type={'entypo'}
        size={36}
        color={Theme.Colors.whiteText}
      />
    );
    return (
      <LinearGradient
        colors={Theme.Colors.gradientBtn}
        start={Theme.LinearGradientDirection.start}
        end={Theme.LinearGradientDirection.end}
        style={Theme.Styles.downloadFabIconContainer}>
        <Pressable
          onPress={() => {
            controller.GOTO_ISSUERS();
          }}
          {...testIDProps('downloadCardButton')}
          accessible={false}
          style={({pressed}) =>
            pressed
              ? Theme.Styles.downloadFabIconPressed
              : Theme.Styles.downloadFabIconNormal
          }>
          {plusIcon}
        </Pressable>
      </LinearGradient>
    );
  };

  return (
    <React.Fragment>
      <BannerNotificationContainer />
      <Column fill backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
        {controller.haveTabsLoaded && (
          <Column fill>
            <MyVcsTab
              isVisible={controller.activeTab === 0}
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

      <Copilot
        title={t('copilot:downloadTitle')}
        description={t('copilot:downloadMessage')}
        order={1}
        targetStyle={Theme.Styles.downloadFabIconCopilotContainer}>
        <DownloadFABIcon />
      </Copilot>

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
}
