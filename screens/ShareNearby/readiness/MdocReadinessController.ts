import {useContext} from 'react';
import {Linking} from 'react-native';
import {useSelector} from '@xstate/react';
import {GlobalContext} from '../../../shared/GlobalContext';
import {ScanEvents} from '../../../machines/bleShare/scan/scanMachine';
import {
  selectIsMdocBusy,
  selectIsLocationDenied,
  selectIsLocationDisabled,
  selectIsMinimumStorageRequiredForAuditEntryLimitReached,
} from '../../../machines/bleShare/scan/scanSelectors';
import {
  selectIsBluetoothDenied,
  selectIsBluetoothPermissionDenied,
  selectIsNearByDevicesPermissionDenied,
  selectIsLocationPermissionRationale,
} from '../../../machines/bleShare/commonSelectors';

export type MdocReadinessKind =
  | 'busy'
  | 'bluetooth'
  | 'permission'
  | 'location'
  | 'storage';

export function useMdocReadiness() {
  const {appService} = useContext(GlobalContext);
  const scanService = appService.children.get('scan')!;
  const isAnotherShareActive = useSelector(scanService, selectIsMdocBusy);
  const isBluetoothDenied = useSelector(scanService, selectIsBluetoothDenied);
  const isBluetoothPermissionDenied = useSelector(
    scanService,
    selectIsBluetoothPermissionDenied,
  );
  const isNearbyPermissionDenied = useSelector(
    scanService,
    selectIsNearByDevicesPermissionDenied,
  );
  const isLocationDenied = useSelector(scanService, selectIsLocationDenied);
  const isLocationDisabled = useSelector(scanService, selectIsLocationDisabled);
  const shouldRequestLocationConsent = useSelector(
    scanService,
    selectIsLocationPermissionRationale,
  );
  const isStorageRestricted = useSelector(
    scanService,
    selectIsMinimumStorageRequiredForAuditEntryLimitReached,
  );
  const isPermissionDenied =
    isBluetoothPermissionDenied || isNearbyPermissionDenied;
  const isLocationUnavailable = isLocationDenied || isLocationDisabled;
  const shouldOfferSettings =
    isPermissionDenied || isBluetoothDenied || isLocationUnavailable;
  const readinessIssue: MdocReadinessKind | undefined = isAnotherShareActive
    ? 'busy'
    : isBluetoothDenied
    ? 'bluetooth'
    : isPermissionDenied
    ? 'permission'
    : isLocationUnavailable || shouldRequestLocationConsent
    ? 'location'
    : isStorageRestricted
    ? 'storage'
    : undefined;

  return {
    isAnotherShareActive,
    readinessIssue,
    shouldOfferSettings,
    shouldRequestLocationConsent,
    isCheckingReadiness:
      !isAnotherShareActive &&
      !shouldOfferSettings &&
      !shouldRequestLocationConsent &&
      !isStorageRestricted,
    CANCEL: () =>
      scanService.send(
        isAnotherShareActive ? ScanEvents.DISMISS() : ScanEvents.CANCEL(),
      ),
    RETRY: () =>
      scanService.send(
        isAnotherShareActive
          ? ScanEvents.PRESENT_MDOC()
          : ScanEvents.APP_ACTIVE(),
      ),
    CONTINUE: () => scanService.send(ScanEvents.ALLOWED()),
    TURN_ON_BLUETOOTH: () => scanService.send(ScanEvents.REQUEST_BLUETOOTH()),
    OPEN_SETTINGS: () => {
      void Linking.openSettings();
    },
  };
}
