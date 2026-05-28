import React from 'react';
import {render} from '@testing-library/react-native';
import {HomeScreen, isIssuerMachineBusyForDeepLink} from './HomeScreen';

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => ''),
}));

jest.mock('../../shared/GlobalContext', () => {
  const React = require('react');
  return {
    GlobalContext: React.createContext({
      appService: {
        send: jest.fn(),
      },
    }),
  };
});

jest.mock('../../machines/app', () => ({
  APP_EVENTS: {
    RESET_CREDENTIAL_OFFER_URI: jest.fn(() => ({
      type: 'RESET_CREDENTIAL_OFFER_URI',
    })),
  },
  selectCredentialOfferUri: jest.fn(),
}));

jest.mock('../../machines/Issuers/IssuersMachine', () => ({
  IssuersMachine: {},
  IssuerScreenTabEvents: {
    CREDENTIAL_OFFER_VIA_DEEP_LINK: jest.fn((data: string) => ({
      type: 'CREDENTIAL_OFFER_VIA_DEEP_LINK',
      data,
    })),
  },
}));

jest.mock('./HomeScreenController', () => ({
  useHomeScreen: () => ({
    IssuersService: null,
    activeTab: 0,
    haveTabsLoaded: true,
    tabRefs: {myVcs: {}, receivedVcs: {}},
    selectedVc: null,
    isViewingVc: false,
    isMinimumStorageLimitReached: false,
    DISMISS: jest.fn(),
    DISMISS_MODAL: jest.fn(),
    GOTO_ISSUERS: jest.fn(),
  }),
}));

jest.mock('./MyVcsTab', () => ({
  MyVcsTab: () => 'MyVcsTab',
}));

jest.mock('./ReceivedVcsTab', () => ({
  ReceivedVcsTab: () => 'ReceivedVcsTab',
}));

jest.mock('./ViewVcModal', () => ({
  ViewVcModal: () => 'ViewVcModal',
}));

jest.mock('../../components/MessageOverlay', () => ({
  ErrorMessageOverlay: () => null,
}));

jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => 'BannerNotificationContainer',
}));

jest.mock('../../shared/commonUtil', () => jest.fn(() => ({})));

jest.mock('../../components/ui/Copilot', () => ({
  Copilot: ({children}: any) => children,
}));

describe('HomeScreen', () => {
  const defaultProps = {
    navigation: {navigate: jest.fn()} as any,
    route: {} as any,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<HomeScreen {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it.each([
    'credentialDownloadFromOffer',
    'downloadCredentials',
    'proccessingCredential',
    'verifyingCredential',
    'storing',
  ])('treats %s as busy for deeplink handling', stateName => {
    const service = {
      getSnapshot: () => ({
        matches: (value: string) => value === stateName,
      }),
    };

    expect(isIssuerMachineBusyForDeepLink(service as any)).toBe(true);
  });

  it('does not treat resting issuer state as busy for deeplink handling', () => {
    const service = {
      getSnapshot: () => ({
        matches: () => false,
      }),
    };

    expect(isIssuerMachineBusyForDeepLink(service as any)).toBe(false);
  });
});
