import {useSelector} from '@xstate/react';
import {useContext} from 'react';
import {ActorRefFrom} from 'xstate';
import {
  selectAreAllVcsDownloaded,
  selectDownloadingFailedVcs,
  selectInProgressVcDownloads,
  selectIsRefreshingMyVcs,
  selectIsReverificationFailure,
  selectIsReverificationSuccess,
  selectIsTampered,
  selectMyVcs,
  selectMyVcsMetadata,
  selectVerificationErrorMessage,
  selectWalletBindingSuccess,
} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {
  selectWalletBindingError,
  selectShowWalletBindingError,
} from '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';
import {GlobalContext} from '../../shared/GlobalContext';
import {HomeScreenTabProps} from './HomeScreen';
import {
  MyVcsTabEvents,
  MyVcsTabMachine,
  selectAddVcModal,
  selectGetVcModal,
  selectIsNetworkOff,
  selectIsRequestSuccessful,
} from './MyVcsTabMachine';
import {
  selectShowHardwareKeystoreNotExistsAlert,
  SettingsEvents,
} from '../../machines/settings';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {VcMetaEvents} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaMachine';
import {
  AuthEvents,
  selectIsInitialDownload,
  selectIsOnboarding,
} from '../../machines/auth';

export function useMyVcsTab(props: HomeScreenTabProps) {
  const service = props.service as ActorRefFrom<typeof MyVcsTabMachine>;
  const {appService} = useContext(GlobalContext);
  const vcMetaService = appService.children.get('vcMeta')!!;
  const settingsService = appService.children.get('settings')!!;
  const authService = appService.children.get('auth');
  return {
    service,
    AddVcModalService: useSelector(service, selectAddVcModal),
    GetVcModalService: useSelector(service, selectGetVcModal),
    vcMetadatas: useSelector(vcMetaService, selectMyVcsMetadata),
    isRefreshingVcs: useSelector(vcMetaService, selectIsRefreshingMyVcs),
    isRequestSuccessful: useSelector(service, selectIsRequestSuccessful),
    walletBindingError: useSelector(service, selectWalletBindingError),
    isBindingError: useSelector(service, selectShowWalletBindingError),
    isBindingSuccess: useSelector(vcMetaService, selectWalletBindingSuccess),
    isNetworkOff: useSelector(service, selectIsNetworkOff),
    inProgressVcDownloads: useSelector(
      vcMetaService,
      selectInProgressVcDownloads,
    ),
    areAllVcsLoaded: useSelector(vcMetaService, selectAreAllVcsDownloaded),
    isTampered: useSelector(vcMetaService, selectIsTampered),
    downloadFailedVcs: useSelector(vcMetaService, selectDownloadingFailedVcs),
    vcData: useSelector(vcMetaService, selectMyVcs),
    showHardwareKeystoreNotExistsAlert: useSelector(
      settingsService,
      selectShowHardwareKeystoreNotExistsAlert,
    ),
    verificationErrorMessage: useSelector(
      vcMetaService,
      selectVerificationErrorMessage,
    ),
    reverificationSuccess: useSelector(vcMetaService,selectIsReverificationSuccess),
    reverificationfailure: useSelector(vcMetaService,selectIsReverificationFailure),
    RESET_REVERIFICATION_FAILURE: () => {
      vcMetaService.send(VcMetaEvents.RESET_REVERIFY_VC_FAILED());
    },
    RESET_REVERIFICATION_SUCCESS: () => {
      vcMetaService.send(VcMetaEvents.RESET_REVERIFY_VC_SUCCESS());
    },
    RESET_HIGHLIGHT:()=>{
      vcMetaService.send(VcMetaEvents.RESET_HIGHLIGHT());
    },
    SET_STORE_VC_ITEM_STATUS: () =>
      service.send(MyVcsTabEvents.SET_STORE_VC_ITEM_STATUS()),

    RESET_STORE_VC_ITEM_STATUS: () =>
      service.send(MyVcsTabEvents.RESET_STORE_VC_ITEM_STATUS()),

    RESET_IN_PROGRESS_VCS_DOWNLOADED: () =>
      vcMetaService.send(VcMetaEvents.RESET_IN_PROGRESS_VCS_DOWNLOADED()),

    DISMISS: () => service.send(MyVcsTabEvents.DISMISS()),

    TRY_AGAIN: () => service.send(MyVcsTabEvents.TRY_AGAIN()),

    DOWNLOAD_ID: () => service.send(MyVcsTabEvents.ADD_VC()),

    GET_VC: () => service.send(MyVcsTabEvents.GET_VC()),

    REFRESH: () => vcMetaService.send(VcMetaEvents.REFRESH_MY_VCS()),

    VIEW_VC: (vcRef: ActorRefFrom<typeof VCItemMachine>) => {
      return service.send(MyVcsTabEvents.VIEW_VC(vcRef));
    },

    DISMISS_WALLET_BINDING_NOTIFICATION_BANNER: () =>
      vcMetaService?.send(VcMetaEvents.RESET_WALLET_BINDING_SUCCESS()),

    ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS: () =>
      settingsService.send(SettingsEvents.ACCEPT_HARDWARE_SUPPORT_NOT_EXISTS()),

    REMOVE_TAMPERED_VCS: () =>
      vcMetaService?.send(VcMetaEvents.REMOVE_TAMPERED_VCS()),

    DELETE_VC: () => vcMetaService?.send(VcMetaEvents.DELETE_VC()),

    RESET_VERIFY_ERROR: () => {
      vcMetaService?.send(VcMetaEvents.RESET_VERIFY_ERROR());
    },
    SET_TOUR_GUIDE: set => {
      authService?.send(AuthEvents.SET_TOUR_GUIDE(set));
    },
    isOnboarding: authService && useSelector(authService, selectIsOnboarding),
    isInitialDownloading:
      authService && useSelector(authService, selectIsInitialDownload),
  };
}
