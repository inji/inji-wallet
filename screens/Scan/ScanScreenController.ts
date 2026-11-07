import {useSelector} from '@xstate/react';
import {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {selectShareableVcsMetadata} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {GlobalContext} from '../../shared/GlobalContext';
import {
  selectIsLocationDenied,
  selectIsLocationDisabled,
  selectIsQrLoginStoring,
  selectIsScanning,
  selectIsInvalid,
  selectIsShowQrLogin,
  selectQrLoginRef,
  selectIsQuickShareDone,
  selectShowQuickShareSuccessBanner,
  selectMdocSharedDetailCount,
} from '../../machines/bleShare/scan/scanSelectors';
import {
  selectIsBluetoothDenied,
  selectIsNearByDevicesPermissionDenied,
  selectReadyForBluetoothStateCheck,
  selectIsBluetoothPermissionDenied,
  selectIsStartPermissionCheck,
  selectIsLocationPermissionRationale,
} from '../../machines/bleShare/commonSelectors';
import {ScanEvents} from '../../machines/bleShare/scan/scanMachine';
import {selectIsMinimumStorageRequiredForAuditEntryLimitReached} from '../../machines/bleShare/scan/scanSelectors';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {MainBottomTabParamList} from '../../routes/routeTypes';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {selectAuthorizationRequest, selectIsLinkCode} from '../../machines/app';

export function useScanScreen() {
  const {t} = useTranslation('ScanScreen');
  const {appService} = useContext(GlobalContext);
  const scanService = appService.children.get('scan')!!;
  const vcMetaService = appService.children.get('vcMeta')!!;

  const shareableVcsMetadata = useSelector(
    vcMetaService,
    selectShareableVcsMetadata,
  );

  const isLocationDisabled = useSelector(scanService, selectIsLocationDisabled);
  const isLocationDenied = useSelector(scanService, selectIsLocationDenied);
  const isReadyForBluetoothStateCheck = useSelector(
    scanService,
    selectReadyForBluetoothStateCheck,
  );
  const isStartPermissionCheck = useSelector(
    scanService,
    selectIsStartPermissionCheck,
  );
  const isNearByDevicesPermissionDenied = useSelector(
    scanService,
    selectIsNearByDevicesPermissionDenied,
  );
  const isBluetoothPermissionDenied = useSelector(
    scanService,
    selectIsBluetoothPermissionDenied,
  );
  const isBluetoothDenied = useSelector(scanService, selectIsBluetoothDenied);
  const locationError = {message: '', button: ''};
  const isMinimumStorageRequiredForAuditEntryLimitReached = useSelector(
    scanService,
    selectIsMinimumStorageRequiredForAuditEntryLimitReached,
  );

  if (isLocationDisabled) {
    locationError.message = t('errors.locationDisabled.message');
    locationError.button = t('errors.locationDisabled.button');
  } else if (isLocationDenied) {
    locationError.message = t('errors.locationDenied.message');
    locationError.button = t('errors.locationDenied.button');
  }
  type ScanScreenNavigation = NavigationProp<MainBottomTabParamList>;
  const navigation = useNavigation<ScanScreenNavigation>();
  const GOTO_HOME = () => {
    scanService.send(ScanEvents.RESET());
    navigation.navigate(BOTTOM_TAB_ROUTES.home);
  };
  const ALLOWED = () => scanService.send(ScanEvents.ALLOWED());
  const DENIED = () => scanService.send(ScanEvents.DENIED());
  const isLocalPermissionRational = useSelector(
    scanService,
    selectIsLocationPermissionRationale,
  );
  const isNoSharableVCs = !shareableVcsMetadata.length;

  return {
    mdocSharedDetailCount: useSelector(
      scanService,
      selectMdocSharedDetailCount,
    ),
    DISMISS_MDOC_BANNER: () =>
      scanService.send(ScanEvents.DISMISS_MDOC_BANNER()),
    locationError,
    isNoSharableVCs,
    isBluetoothPermissionDenied,
    isNearByDevicesPermissionDenied,
    isLocationDisabled,
    isLocationDenied,
    isBluetoothDenied,
    isStartPermissionCheck,
    isReadyForBluetoothStateCheck,
    isMinimumStorageRequiredForAuditEntryLimitReached,
    isScanning: useSelector(scanService, selectIsScanning),
    isQuickShareDone: useSelector(scanService, selectIsQuickShareDone),
    showQuickShareSuccessBanner: useSelector(
      scanService,
      selectShowQuickShareSuccessBanner,
    ),
    selectIsInvalid: useSelector(scanService, selectIsInvalid),
    isQrLogin: useSelector(scanService, selectIsShowQrLogin),
    isQrLoginstoring: useSelector(scanService, selectIsQrLoginStoring),
    isQrRef: useSelector(scanService, selectQrLoginRef),
    LOCATION_REQUEST: () => scanService.send(ScanEvents.LOCATION_REQUEST()),
    GOTO_SETTINGS: () => scanService.send(ScanEvents.GOTO_SETTINGS()),
    DISMISS: () => scanService.send(ScanEvents.DISMISS()),
    DISMISS_QUICK_SHARE_BANNER: () =>
      scanService.send(ScanEvents.DISMISS_QUICK_SHARE_BANNER()),
    START_PERMISSION_CHECK: () =>
      scanService.send(ScanEvents.START_PERMISSION_CHECK()),
    SCAN: (qrCode: string) => scanService.send(ScanEvents.SCAN(qrCode)),
    GOTO_HOME,
    ALLOWED,
    DENIED,
    isLocalPermissionRational,
    authorizationRequest: useSelector(appService, selectAuthorizationRequest),
    linkcode: useSelector(appService, selectIsLinkCode),
  };
}
