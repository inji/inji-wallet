import React from 'react';
import {render} from '@testing-library/react-native';
import {DeeplinkBanner} from './DeeplinkBanner';

// Mock all controllers
jest.mock('./BannerNotificationController', () => ({
  UseBannerNotification: jest.fn(() => ({
    isCredentialOfferDroppedBusy: false,
    isResolvingCredentialOffer: false,
    RESET_CREDENTIAL_OFFER_DROPPED_BUSY: jest.fn(),
  })),
}));

jest.mock('./BannerNotification', () => ({
  BannerNotification: jest.fn(() => null),
  BannerStatusType: {
    IN_PROGRESS: 'inProgress',
    SUCCESS: 'success',
    ERROR: 'error',
  },
}));

const {BannerNotification} = require('./BannerNotification');
const {UseBannerNotification} = require('./BannerNotificationController');

const defaultBannerState = {
  isCredentialOfferDroppedBusy: false,
  isResolvingCredentialOffer: false,
  RESET_CREDENTIAL_OFFER_DROPPED_BUSY: jest.fn(),
};

describe('DeeplinkBanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<DeeplinkBanner />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render credential offer busy banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isCredentialOfferDroppedBusy: true,
    });
    render(<DeeplinkBanner />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'credentialOfferBusyPopup',
        type: 'inProgress',
      }),
      expect.anything(),
    );
  });

  it('should render resolving credential offer banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isResolvingCredentialOffer: true,
    });
    render(<DeeplinkBanner />);
    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'resolvingCredentialOfferPopup',
        type: 'inProgress',
      }),
      expect.anything(),
    );
  });
});
