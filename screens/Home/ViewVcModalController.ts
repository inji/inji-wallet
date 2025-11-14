import {useMachine, useSelector} from '@xstate/react';
import {useContext, useEffect, useState} from 'react';
import {ActorRefFrom} from 'xstate';
import NetInfo from '@react-native-community/netinfo';
import {ModalProps} from '../../components/ui/Modal';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  selectAcceptingBindingOtp,
  selectBindingAuthFailedError,
  selectBindingWarning,
  selectIsCommunicationDetails,
  selectOtpError,
  selectShowWalletBindingError,
  selectVc,
  selectVerifiableCredentialData,
  selectWalletBindingError,
  selectWalletBindingInProgress,
  selectWalletBindingResponse,
  selectWalletBindingSuccess,
  selectVerificationStatus,
  selectIsVerificationInProgress,
  selectShowVerificationStatusBanner,
  selectIsVerificationCompleted,
  selectCredential,
  isReverifyingVc,
} from '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';
import {selectPasscode} from '../../machines/auth';
import {biometricsMachine, selectIsSuccess} from '../../machines/biometrics';
import {
  VCItemEvents,
  VCItemMachine,
} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {selectIsAcceptingOtpInput} from './MyVcs/AddVcModalMachine';
import {BannerStatusType} from '../../components/BannerNotification';

export function useViewVcModal({vcItemActor, isVisible}: ViewVcModalProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [reAuthenticating, setReAuthenticating] = useState('');
  const [error, setError] = useState('');
  const {appService} = useContext(GlobalContext);
  const authService = appService.children.get('auth');
  const [, bioSend, bioService] = useMachine(biometricsMachine);

  const isSuccessBio = useSelector(bioService, selectIsSuccess);
  const vc = useSelector(vcItemActor, selectVc);
  const otError = useSelector(vcItemActor, selectOtpError);
  const onSuccess = () => {
    bioSend({type: 'SET_IS_AVAILABLE', data: true});
    setError('');
    setReAuthenticating('');
  };

  const onError = (value: string) => {
    setError(value);
  };

  const showToast = (message: string) => {
    setToastVisible(true);
    setMessage(message);
    setTimeout(() => {
      setToastVisible(false);
      setMessage('');
    }, 3000);
  };

  const netInfoFetch = (otp: string) => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        vcItemActor.send(VCItemEvents.INPUT_OTP(otp));
      } else {
        vcItemActor.send(VCItemEvents.DISMISS());
        showToast('Request network failed');
      }
    });
  };

  useEffect(() => {
    if (isSuccessBio && reAuthenticating != '') {
      onSuccess();
    }
  }, [reAuthenticating, isSuccessBio, otError, vc]);

  useEffect(() => {
    vcItemActor.send(VCItemEvents.REFRESH());
  }, [isVisible]);
  return {
    error,
    message,
    toastVisible,
    credential: useSelector(vcItemActor, selectCredential),
    verifiableCredentialData: useSelector(
      vcItemActor,
      selectVerifiableCredentialData,
    ),
    otpError: useSelector(vcItemActor, selectOtpError),
    bindingAuthFailedError: useSelector(
      vcItemActor,
      selectBindingAuthFailedError,
    ),
    reAuthenticating,
    isAcceptingOtpInput: useSelector(vcItemActor, selectIsAcceptingOtpInput),
    storedPasscode: useSelector(authService, selectPasscode),
    isAcceptingBindingOtp: useSelector(vcItemActor, selectAcceptingBindingOtp),
    walletBindingResponse: useSelector(
      vcItemActor,
      selectWalletBindingResponse,
    ),
    walletBindingError: useSelector(vcItemActor, selectWalletBindingError),
    isWalletBindingInProgress: useSelector(
      vcItemActor,
      selectWalletBindingInProgress,
    ),
    isBindingError: useSelector(vcItemActor, selectShowWalletBindingError),
    isBindingSuccess: useSelector(vcItemActor, selectWalletBindingSuccess),
    isBindingWarning: useSelector(vcItemActor, selectBindingWarning),
    isReverifyingVc: useSelector(vcItemActor, isReverifyingVc),
    isCommunicationDetails: useSelector(
      vcItemActor,
      selectIsCommunicationDetails,
    ),
    setReAuthenticating,
    onError,
    addtoWallet: () => {
      vcItemActor.send(VCItemEvents.ADD_WALLET_BINDING_ID());
    },
    inputOtp: (otp: string) => {
      netInfoFetch(otp);
    },
    verificationStatus: useSelector(vcItemActor, selectVerificationStatus),
    isVerificationInProgress: useSelector(
      vcItemActor,
      selectIsVerificationInProgress,
    ),
    isVerificationCompleted: useSelector(
      vcItemActor,
      selectIsVerificationCompleted,
    ),
    showVerificationStatusBanner: useSelector(
      vcItemActor,
      selectShowVerificationStatusBanner,
    ),
    RESET_VERIFICATION_STATUS: () =>
      vcItemActor.send(VCItemEvents.RESET_VERIFICATION_STATUS()),
    SHOW_VERIFICATION_STATUS_BANNER: () =>
      vcItemActor.send({
        type: 'SHOW_VERIFICATION_STATUS_BANNER',
        response: {statusType: BannerStatusType.IN_PROGRESS},
      }),
    onSuccess,
    DISMISS: () => vcItemActor.send(VCItemEvents.DISMISS()),
    INPUT_OTP: (otp: string) => vcItemActor.send(VCItemEvents.INPUT_OTP(otp)),
    RESEND_OTP: () => vcItemActor.send(VCItemEvents.RESEND_OTP()),
    CANCEL: () => vcItemActor.send(VCItemEvents.CANCEL()),
    CONFIRM: () => vcItemActor.send(VCItemEvents.CONFIRM()),
  };
}

export interface ViewVcModalProps extends ModalProps {
  vcItemActor: ActorRefFrom<typeof VCItemMachine>;
  onDismiss: () => void;
  activeTab: Number;
  flow: string;
}
