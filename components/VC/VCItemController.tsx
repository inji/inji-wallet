import {useContext, useEffect, useRef} from 'react';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  selectContext,
  selectGeneratedOn,
  selectKebabPopUp,
  selectWalletBindingResponse,
  selectVerifiableCredentialData,
  selectCredential,
  isReverifyingVc,
  selectIsVcItemIdle,
} from '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';
import {selectReverifyAllVcsRequestId} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {useInterpret, useSelector} from '@xstate/react';
import {
  createVCItemMachine,
  VCItemEvents,
} from '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {selectIsSavingFailedInIdle} from '../../screens/Home/MyVcsTabMachine';
import {selectIsTourGuide} from '../../machines/auth';
import {VCMetadata} from "../../shared/VCMetadata";
import {ActivityLogEvents} from "../../machines/activityLog";
import {IssuerWellknownResponse} from "../../machines/VerifiableCredential/VCMetaMachine/vc";

export function useVcItemController(vcMetadata: VCMetadata) {
  const {appService} = useContext(GlobalContext);
  const machine = useRef(
    createVCItemMachine(
      appService.getSnapshot().context.serviceRefs,
      vcMetadata,
    ),
  );
  const VCItemService = useInterpret(machine.current, {devTools: __DEV__});
  const authService = appService.children.get('auth');
  const activityService = appService.children.get('activityLog');
  const vcMetaService = appService.children.get('vcMeta')!;

  // Waits until the card is idle (loaded, no menu or binding open) before checking it, and
  // ignores requests made before this card existed.
  const reverifyAllVcsRequestId = useSelector(
    vcMetaService,
    selectReverifyAllVcsRequestId,
  );
  const isIdle = useSelector(VCItemService, selectIsVcItemIdle);
  const handledReverifyRequestId = useRef(reverifyAllVcsRequestId);
  useEffect(() => {
    if (!isIdle || handledReverifyRequestId.current === reverifyAllVcsRequestId)
      return;
    handledReverifyRequestId.current = reverifyAllVcsRequestId;
    VCItemService.send(VCItemEvents.REVERIFY_VC_IN_BACKGROUND());
  }, [reverifyAllVcsRequestId, isIdle]);

  return {
    VCItemService,
    context: useSelector(VCItemService, selectContext),
    credential: useSelector(VCItemService, selectCredential),
    verifiableCredentialData: useSelector(
      VCItemService,
      selectVerifiableCredentialData,
    ),
    walletBindingResponse: useSelector(
      VCItemService,
      selectWalletBindingResponse,
    ),
    isKebabPopUp: useSelector(VCItemService, selectKebabPopUp),
    DISMISS: () => VCItemService.send(VCItemEvents.DISMISS()),
    KEBAB_POPUP: () => VCItemService.send(VCItemEvents.KEBAB_POPUP()),
    UPDATE_VC_METADATA: vcMetadata =>
      VCItemService.send(VCItemEvents.UPDATE_VC_METADATA(vcMetadata)),
    isSavingFailedInIdle: useSelector(
      VCItemService,
      selectIsSavingFailedInIdle,
    ),
    isReverifyingVc: useSelector(VCItemService, isReverifyingVc),
    storeErrorTranslationPath: 'errors.savingFailed',
    generatedOn: useSelector(VCItemService, selectGeneratedOn),
    isTourGuide: useSelector(authService, selectIsTourGuide),
    STORE_INCOMING_VC_WELLKNOWN_CONFIG: (issuer: string, wellknown: IssuerWellknownResponse) =>
        activityService?.send(
            ActivityLogEvents.STORE_INCOMING_VC_WELLKNOWN_CONFIG(issuer, wellknown),
        )
  };
}
