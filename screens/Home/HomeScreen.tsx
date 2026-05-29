import React, {useContext, useEffect} from 'react';
import {Icon} from 'react-native-elements';
import {Column} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {HomeRouteProps} from '../../routes/routeTypes';
import {MyVcsTab} from './MyVcsTab';
import {ReceivedVcsTab} from './ReceivedVcsTab';
import {ViewVcModal} from './ViewVcModal';
import {useHomeScreen} from './HomeScreenController';
import {
  selectIsIssuerMachineBusyForDeepLink,
  TabRef,
} from './HomeScreenMachine';
import {ActorRefFrom} from 'xstate';
import LinearGradient from 'react-native-linear-gradient';
import {ErrorMessageOverlay} from '../../components/MessageOverlay';
import {Pressable} from 'react-native';
import testIDProps from '../../shared/commonUtil';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {DeeplinkBanner} from '../../components/DeeplinkBanner';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {useTranslation} from 'react-i18next';
import {Copilot} from '../../components/ui/Copilot';
import {useSelector} from '@xstate/react';
import {GlobalContext} from '../../shared/GlobalContext';
import {APP_EVENTS, selectCredentialOfferUri} from '../../machines/app';
import {
  IssuerScreenTabEvents,
  IssuersMachine,
} from '../../machines/Issuers/IssuersMachine';

export const HomeScreen: React.FC<HomeRouteProps> = props => {
  const controller = useHomeScreen(props);
  const {t} = useTranslation();
  const {appService} = useContext(GlobalContext);
  const credentialOfferUri = useSelector(appService, selectCredentialOfferUri);

  useEffect(() => {
    if (controller.IssuersService && credentialOfferUri === '') {
      navigateToIssuers();
    }
  }, [controller.IssuersService]);

  useEffect(() => {
    if (credentialOfferUri === '') return;
    if (!controller.IssuersService) {
      controller.GOTO_ISSUERS();
      return;
    }
    const isIssuerBusy = selectIsIssuerMachineBusyForDeepLink(
      controller.service.getSnapshot(),
    );
    controller.IssuersService.send(
      IssuerScreenTabEvents.CREDENTIAL_OFFER_VIA_DEEP_LINK(credentialOfferUri),
    );
    if (!isIssuerBusy) {
      navigateToIssuers();
    }
    appService.send(APP_EVENTS.RESET_CREDENTIAL_OFFER_URI());
  }, [credentialOfferUri, controller.IssuersService]);

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
      <DeeplinkBanner />
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
        order={2}
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
