import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';
import mockedConstants from 'react-native.mock';
import mockArgon2 from 'react-native-argon2.mock';
import mockLocalAuthentication from 'expo-local-authentication.mock';
import mockRNLocalize from './react-native-localize.mock';
import mockClipboard from '@react-native-clipboard/clipboard/jest/clipboard-mock.js';
import mockLocalization from 'expo-localization.mock';
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);

jest.mock('react-native-device-info', () => mockRNDeviceInfo);

jest.mock('react-native', () => require('./react-native.mock'));

jest.mock('expo-constants', () => mockedConstants);

jest.mock('react-native-argon2', () => mockArgon2);

jest.mock('react-native-securerandom');

jest.mock('expo-local-authentication', () => mockLocalAuthentication);

jest.mock('react-native-rsa-native', () =>
  require('react-native-rsa-native.mock'),
);

jest.mock('react-native-localize', () => mockRNLocalize);

jest.mock('expo-localization', () => mockLocalization);

jest.mock('iso-639-3');

jest.mock('react-native-fs', () => require('react-native-fs.mock'));

jest.mock('react-native-zip-archive', () =>
  require('./react-native-zip-archive.mock'),
);

jest.mock('react-native-biometrics-changed');

jest.mock('@react-navigation/native');

jest.mock('@mosip/tuvali');

jest.mock('react-native-bluetooth-state-manager');

jest.mock('react-native-permissions');

jest.mock('react-native-linear-gradient', () => (LinearGradient = jest.fn()));

jest.mock('expo-camera', () => {
  return {
    Camera: {
      Constants: {
        Type: {front: 0, back: 1},
      },
    },
    CameraCapturedPicture: jest.fn(),
    PermissionResponse: jest.fn(),
    ImageType: jest.fn(),
    Face: jest.fn(),
    CameraType: jest.fn(),
  };
});

jest.mock('base58-universal/main', () => require('base58-universal-main'));

jest.mock('@react-native-clipboard/clipboard', () => mockClipboard);

jest.mock(
  'react-native-shimmer-placeholder',
  () => (ShimmerPlaceHolder = jest.fn()),
);

jest.mock(
  'expo-camera/build/Camera.types',
  () => (
    (CameraType = jest.requireActual()),
    (Face = jest.fn()),
    (ImageType = jest.fn())
  ),
);

jest.mock(
  'react-native-app-auth',
  () => ((authorize = jest.fn()), (AuthorizeResult = jest.fn())),
);

jest.mock('react-native-vector-icons/MaterialIcons', () => (Icon = jest.fn()));

jest.mock(
  'react-native-vector-icons/MaterialCommunityIcons',
  () => (Icon = jest.fn()),
);

jest.mock('react-native-qrcode-svg', () => (QRCode = jest.fn()));

jest.mock('react-native-spinkit', () => (Spinner = jest.fn()));

jest.mock(
  'react-native-zip-archive',
  () => ((zip = jest.fn()), (unzip = jest.fn())),
);

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

jest.mock('@iriscan/biometric-sdk-react-native', () => ({
  configure: jest.fn(),
  // Add other functions or constants you need to mock here
}));

jest.mock('react-native-gesture-handler', () => {
  const mockScrollView = jest.fn().mockReturnValue(null); // Mock ScrollView component
  return {
    ScrollView: mockScrollView,
    // Add other components or utilities you want to mock from react-native-gesture-handler
  };
});

jest.mock('@invertase/react-native-apple-authentication', () => {});

jest.mock('react-native-share', () => {});

jest.mock('../machines/store', () => ({
  getItem: jest.fn(),
  StoreEvents: {
    GET: () => 'mockedString',
    EXPORT: () => 'mockedString',
  },
}));

// Mocking useState
const mockState = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: initialState => [initialState, mockState],
  useEffect: jest.fn(),
}));
