import React from 'react';
import {render} from '@testing-library/react-native';
import {DeeplinkBanner} from './DeeplinkBanner';

// Mock all controllers
jest.mock('./BannerNotificationController', () => ({
  UseBannerNotification: jest.fn(() => ({
    isCredentialOfferDroppedDueToBusyState: false,
    RESET_CREDENTIAL_OFFER_DROPPED_DUE_TO_BUSY_STATE: jest.fn(),
  })),
}));

jest.mock('./BannerNotification', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    BannerNotification: jest.fn(() =>
      React.createElement(View, {testID: 'mock-banner'}),
    ),
    BannerStatusType: {
      IN_PROGRESS: 'inProgress',
      SUCCESS: 'success',
      ERROR: 'error',
    },
  };
});

const {BannerNotification} = require('./BannerNotification');
const {UseBannerNotification} = require('./BannerNotificationController');

const defaultBannerState = {
  isCredentialOfferDroppedDueToBusyState: false,
  RESET_CREDENTIAL_OFFER_DROPPED_DUE_TO_BUSY_STATE: jest.fn(),
};

describe('DeeplinkBanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<DeeplinkBanner />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when busy in inline mode', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isCredentialOfferDroppedDueToBusyState: true,
    });
    const {toJSON} = render(<DeeplinkBanner />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when busy in absolute mode', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isCredentialOfferDroppedDueToBusyState: true,
    });
    const {toJSON} = render(<DeeplinkBanner absolute />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render credential offer busy banner', () => {
    (UseBannerNotification as jest.Mock).mockReturnValueOnce({
      ...defaultBannerState,
      isCredentialOfferDroppedDueToBusyState: true,
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
});
