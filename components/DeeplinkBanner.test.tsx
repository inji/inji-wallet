import React from 'react';
import {render} from '@testing-library/react-native';
import {DeeplinkBanner} from './DeeplinkBanner';

jest.mock('./BannerNotificationController', () => ({
  UseBannerNotification: jest.fn(() => ({
    isCredentialOfferDroppedDueToBusyState: false,
    RESET_CREDENTIAL_OFFER_DROPPED_DUE_TO_BUSY_STATE: jest.fn(),
  })),
}));

jest.mock('./BannerNotification', () => ({
  BannerNotification: jest.fn(() => null),
  BannerStatusType: {
    IN_PROGRESS: 'inProgress',
  },
}));

const {BannerNotification} = require('./BannerNotification');
const {UseBannerNotification} = require('./BannerNotificationController');

describe('DeeplinkBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no credential offer was dropped', () => {
    const {toJSON} = render(<DeeplinkBanner />);

    expect(toJSON()).toBeNull();
  });

  it('renders the busy banner with a dismiss action', () => {
    const dismiss = jest.fn();
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      isCredentialOfferDroppedDueToBusyState: true,
      RESET_CREDENTIAL_OFFER_DROPPED_DUE_TO_BUSY_STATE: dismiss,
    });

    render(<DeeplinkBanner />);

    expect(BannerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 'credentialOfferBusyPopup',
        type: 'inProgress',
        onClosePress: dismiss,
      }),
      expect.anything(),
    );
  });
});
