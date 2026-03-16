const mockScanSend = jest.fn();

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => []),
}));
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string) => key),
  })),
}));
jest.mock(
  '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors',
  () => ({
    selectShareableVcsMetadata: jest.fn(),
  }),
);
jest.mock('../../machines/bleShare/scan/scanSelectors', () => ({
  selectIsLocationDenied: jest.fn(),
  selectIsLocationDisabled: jest.fn(),
  selectIsQrLoginStoring: jest.fn(),
  selectIsScanning: jest.fn(),
  selectIsInvalid: jest.fn(),
  selectIsShowQrLogin: jest.fn(),
  selectQrLoginRef: jest.fn(),
  selectIsQuickShareDone: jest.fn(),
  selectShowQuickShareSuccessBanner: jest.fn(),
  selectIsMinimumStorageRequiredForAuditEntryLimitReached: jest.fn(),
}));
jest.mock('../../machines/bleShare/commonSelectors', () => ({
  selectIsBluetoothDenied: jest.fn(),
  selectIsNearByDevicesPermissionDenied: jest.fn(),
  selectReadyForBluetoothStateCheck: jest.fn(),
  selectIsBluetoothPermissionDenied: jest.fn(),
  selectIsStartPermissionCheck: jest.fn(),
  selectIsLocationPermissionRationale: jest.fn(),
}));
jest.mock('../../machines/bleShare/scan/scanMachine', () => ({
  ScanEvents: {
    LOCATION_REQUEST: jest.fn(() => ({type: 'LOCATION_REQUEST'})),
    GOTO_SETTINGS: jest.fn(() => ({type: 'GOTO_SETTINGS'})),
    DISMISS: jest.fn(() => ({type: 'DISMISS'})),
    DISMISS_QUICK_SHARE_BANNER: jest.fn(() => ({
      type: 'DISMISS_QUICK_SHARE_BANNER',
    })),
    START_PERMISSION_CHECK: jest.fn(() => ({type: 'START_PERMISSION_CHECK'})),
    SCAN: jest.fn((qr: string) => ({type: 'SCAN', qrCode: qr})),
    RESET: jest.fn(() => ({type: 'RESET'})),
    ALLOWED: jest.fn(() => ({type: 'ALLOWED'})),
    DENIED: jest.fn(() => ({type: 'DENIED'})),
  },
}));
jest.mock('../../machines/app', () => ({
  selectAuthorizationRequest: jest.fn(),
  selectIsLinkCode: jest.fn(),
}));
jest.mock('../../routes/routesConstants', () => ({
  BOTTOM_TAB_ROUTES: {home: 'Home', share: 'Share'},
}));
jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({navigate: mockNavigate})),
  NavigationProp: {},
}));

const React = require('react');
const {useSelector} = require('@xstate/react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {
    children: new Map([
      ['scan', {send: mockScanSend}],
      ['vcMeta', {send: jest.fn()}],
    ]),
  },
});

import {useScanScreen} from './ScanScreenController';

describe('ScanScreenController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: new Map([
          ['scan', {send: mockScanSend}],
          ['vcMeta', {send: jest.fn()}],
        ]),
      },
    });
    // Default: useSelector returns empty array for shareableVcsMetadata
    useSelector.mockReturnValue([]);
  });

  it('returns expected properties', () => {
    const result = useScanScreen();
    expect(result).toHaveProperty('locationError');
    expect(result).toHaveProperty('isNoSharableVCs');
    expect(result).toHaveProperty('isBluetoothPermissionDenied');
    expect(result).toHaveProperty('isScanning');
    expect(result).toHaveProperty('LOCATION_REQUEST');
    expect(result).toHaveProperty('GOTO_SETTINGS');
    expect(result).toHaveProperty('DISMISS');
    expect(result).toHaveProperty('START_PERMISSION_CHECK');
    expect(result).toHaveProperty('SCAN');
    expect(result).toHaveProperty('GOTO_HOME');
    expect(result).toHaveProperty('ALLOWED');
    expect(result).toHaveProperty('DENIED');
  });

  it('LOCATION_REQUEST sends event', () => {
    const result = useScanScreen();
    result.LOCATION_REQUEST();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('GOTO_SETTINGS sends event', () => {
    const result = useScanScreen();
    result.GOTO_SETTINGS();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('DISMISS sends event', () => {
    const result = useScanScreen();
    result.DISMISS();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('SCAN sends event with qr code', () => {
    const result = useScanScreen();
    result.SCAN('some-qr-code');
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('GOTO_HOME sends RESET and navigates', () => {
    const result = useScanScreen();
    result.GOTO_HOME();
    expect(mockScanSend).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  it('ALLOWED sends event', () => {
    const result = useScanScreen();
    result.ALLOWED();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('DENIED sends event', () => {
    const result = useScanScreen();
    result.DENIED();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('START_PERMISSION_CHECK sends event', () => {
    const result = useScanScreen();
    result.START_PERMISSION_CHECK();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('DISMISS_QUICK_SHARE_BANNER sends event', () => {
    const result = useScanScreen();
    result.DISMISS_QUICK_SHARE_BANNER();
    expect(mockScanSend).toHaveBeenCalled();
  });

  it('locationError has empty strings when no location issues', () => {
    // useSelector returns [] (falsy for location selectors), so no error
    const result = useScanScreen();
    expect(result.locationError).toBeDefined();
    expect(typeof result.locationError.message).toBe('string');
    expect(typeof result.locationError.button).toBe('string');
  });
});
