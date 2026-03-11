import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./WelcomeScreenController', () => ({
  useWelcomeScreen: () => ({
    SELECT: jest.fn(),
    unlockPage: jest.fn(),
  }),
}));

jest.mock('./Settings/BackupRestoreController', () => ({
  useBackupRestoreScreen: () => ({
    DOWNLOAD_UNSYNCED_BACKUP_FILES: jest.fn(),
  }),
}));

jest.mock('../i18n', () => ({
  __esModule: true,
  default: {language: 'en'},
  SUPPORTED_LANGUAGES: {en: 'English', fr: 'French', ar: 'Arabic'},
}));

jest.mock('../components/ui/SetupPicker', () => ({
  SetupPicker: () => null,
}));

jest.mock('../components/ui/svg', () => ({
  SvgImage: {
    settingsLanguageIcon: () => 'settingsLanguageIcon',
  },
}));

jest.mock('../components/LanguageSelector', () => ({
  changeLanguage: jest.fn(),
}));

jest.mock('../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {SetupLanguageScreen} from './SetupLanguageScreen';

describe('SetupLanguageScreen', () => {
  const defaultProps = {
    navigation: {navigate: jest.fn()},
    route: {},
  } as any;

  it('should render setup language screen', () => {
    const {toJSON} = render(<SetupLanguageScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
