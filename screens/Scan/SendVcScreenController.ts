import {useSelector} from '@xstate/react';
import {useContext, useState} from 'react';
import {ActorRefFrom} from 'xstate';
import {selectShareableVcsMetadata} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  selectCredential,
  selectIsSelectingVc,
  selectReceiverInfo,
  selectVcName,
  selectVerifiableCredentialData,
} from '../../machines/bleShare/scan/scanSelectors';
import {
  selectIsCancelling,
  selectIsInvalidIdentity,
  selectIsVerifyingIdentity,
} from '../../machines/bleShare/commonSelectors';
import {ScanEvents} from '../../machines/bleShare/scan/scanMachine';
import {selectIsFaceVerificationConsent} from '../../machines/bleShare/scan/scanSelectors';
import {VCShareFlowType} from '../../shared/Utils';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RootRouteProps} from '../../routes';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {VCItemMachine} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {Theme} from '../../components/ui/styleUtils';
import { useTabBarVisibility } from '../../shared/hooks/useTabBarVisibility';

type MyVcsTabNavigation = NavigationProp<RootRouteProps>;

export function useSendVcScreen() {
  const {appService} = useContext(GlobalContext);
  const scanService = appService.children.get('scan')!!;
  const vcMetaService = appService.children.get('vcMeta')!!;
  const navigation = useNavigation<MyVcsTabNavigation>();
  const {showTabBar} = useTabBarVisibility();

  const [selectedIndex, setSelectedIndex] = useState<number>(null);

  return {
    selectedIndex,
    receiverInfo: useSelector(scanService, selectReceiverInfo),
    vcName: useSelector(scanService, selectVcName),
    shareableVcsMetadata: useSelector(
      vcMetaService,
      selectShareableVcsMetadata,
    ),
    isSelectingVc: useSelector(scanService, selectIsSelectingVc),
    isVerifyingIdentity: useSelector(scanService, selectIsVerifyingIdentity),
    isInvalidIdentity: useSelector(scanService, selectIsInvalidIdentity),
    isCancelling: useSelector(scanService, selectIsCancelling),
    isFaceVerificationConsent: useSelector(
      scanService,
      selectIsFaceVerificationConsent,
    ),
    credential: useSelector(scanService, selectCredential),
    verifiableCredentialData: useSelector(
      scanService,
      selectVerifiableCredentialData,
    ),
    CANCEL: () => scanService.send(ScanEvents.CANCEL()),
    ACCEPT_REQUEST: () => scanService.send(ScanEvents.ACCEPT_REQUEST()),
    FACE_VERIFICATION_CONSENT: (isDoNotAskAgainChecked: boolean) =>
      scanService.send(
        ScanEvents.FACE_VERIFICATION_CONSENT(isDoNotAskAgainChecked),
      ),
    VERIFY_AND_ACCEPT_REQUEST: () =>
      scanService.send(ScanEvents.VERIFY_AND_ACCEPT_REQUEST()),
    DISMISS: () => scanService.send(ScanEvents.DISMISS()),
    UPDATE_VC_NAME: (vcName: string) =>
      scanService.send(ScanEvents.UPDATE_VC_NAME(vcName)),
    FACE_VALID: () => scanService.send(ScanEvents.FACE_VALID()),
    FACE_INVALID: () => scanService.send(ScanEvents.FACE_INVALID()),
    RETRY_VERIFICATION: () => scanService.send(ScanEvents.RETRY_VERIFICATION()),
    GO_TO_HOME: () => {
      navigation.navigate(BOTTOM_TAB_ROUTES.home, {screen: 'HomeScreen'});
      showTabBar();
    },
    SELECT_VC_ITEM:
      (index: number) => (vcRef: ActorRefFrom<typeof VCItemMachine>) => {
        setSelectedIndex(index);
        const {
          serviceRefs,
          wellknownResponse,
          verifiableCredential: {
            processedCredential,
            ...filteredVerifiableCredential
          },
          ...rest
        } = vcRef.getSnapshot().context;
        const vcData = {
          ...rest,
          processedCredential,
          verifiableCredential: filteredVerifiableCredential,
        };
        scanService.send(
          ScanEvents.SELECT_VC(vcData, VCShareFlowType.SIMPLE_SHARE),
        );
      },
  };
}
