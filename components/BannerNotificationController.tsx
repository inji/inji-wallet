import {useSelector} from '@xstate/react';
import {
  selectIsPasscodeUnlock,
  selectIsBiometricUnlock,
  SettingsEvents,
} from '../machines/settings';
import {useContext} from 'react';
import {GlobalContext} from '../shared/GlobalContext';
import {VcMetaEvents} from '../machines/VerifiableCredential/VCMetaMachine/VCMetaMachine';
import {
  selectIsDownloadingFailed,
  selectIsDownloadingSuccess,
  selectIsReverificationFailure,
  selectIsReverificationSuccess,
  selectWalletBindingSuccess,
} from '../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {selectVerificationStatus} from '../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';

export const UseBannerNotification = () => {
  const {appService} = useContext(GlobalContext);
  const settingsService = appService.children.get('settings')!!;
  const vcMetaService = appService.children.get('vcMeta')!!;

  return {
    isBindingSuccess: useSelector(vcMetaService, selectWalletBindingSuccess),
    verificationStatus: useSelector(vcMetaService, selectVerificationStatus),
    isPasscodeUnlock: useSelector(settingsService, selectIsPasscodeUnlock),

    isBiometricUnlock: useSelector(settingsService, selectIsBiometricUnlock),
    isDownloadingSuccess: useSelector(vcMetaService, selectIsDownloadingSuccess),
    isDownloadingFailed: useSelector(vcMetaService, selectIsDownloadingFailed),
    isReverificationSuccess: useSelector(vcMetaService,selectIsReverificationSuccess),
    isReverificationFailed: useSelector(vcMetaService, selectIsReverificationFailure),
    DISMISS: () => {
      settingsService.send(SettingsEvents.DISMISS());
    },
    RESET_WALLET_BINDING_SUCCESS: () =>
      vcMetaService.send(VcMetaEvents.RESET_WALLET_BINDING_SUCCESS()),
    RESET_VERIFICATION_STATUS: () =>
      vcMetaService.send(VcMetaEvents.RESET_VERIFICATION_STATUS(null)),
    RESET_DOWNLOADING_FAILED: () => {
      vcMetaService.send(VcMetaEvents.RESET_DOWNLOADING_FAILED());
    },
    RESET_DOWNLOADING_SUCCESS: () => {
      vcMetaService.send(VcMetaEvents.RESET_DOWNLOADING_SUCCESS());
    },
    RESET_REVIRIFICATION_SUCCESS: () => {
      vcMetaService.send(VcMetaEvents.RESET_REVERIFY_VC_SUCCESS());
    },
    RESET_REVERIFICATION_FAILURE: () => {
      vcMetaService.send(VcMetaEvents.RESET_REVERIFY_VC_FAILED());
    },
  };
};
