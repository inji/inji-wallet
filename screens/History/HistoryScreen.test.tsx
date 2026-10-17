import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {HistoryScreen} from './HistoryScreen';
import {VCItemContainerFlowType} from '../../shared/Utils';

const mockMarkAllAsRead = jest.fn();
const mockMarkAsRead = jest.fn();
let mockUnreadCount = 0;
let mockActivities: object[] = [];
let mockExpiryDates = new Map<string, string>();

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options?.count != null ? `${key}:${options.count}` : key,
    i18n: {language: 'en'},
  }),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    canGoBack: () => true,
    goBack: jest.fn(),
    navigate: mockNavigate,
  }),
}));

jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => null,
}));

jest.mock('./HistoryScreenController', () => ({
  useHistoryTab: () => ({
    activities: mockActivities,
    isRefreshing: false,
    getWellKnownIssuerMap: () => null,
    REFRESH: jest.fn(),
  }),
  useNotificationReadState: () => ({
    isUnread: () => mockUnreadCount > 0,
    unreadCount: mockUnreadCount,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
  }),
  useWalletCredentials: () =>
    new Map([['vc-in-wallet', {credentialType: 'Driving Licence'}]]),
  useWalletExpiryDates: () => mockExpiryDates,
}));

const today = Date.now();

describe('HistoryScreen', () => {
  beforeEach(() => {
    mockUnreadCount = 0;
    mockExpiryDates = new Map();
    mockMarkAllAsRead.mockClear();
    mockNavigate.mockClear();
    mockMarkAsRead.mockClear();
    mockActivities = [
      {
        _vcKey: 'vc-in-wallet',
        type: 'VC_DOWNLOADED',
        timestamp: today,
        flow: VCItemContainerFlowType.VC_SHARE,
        issuer: 'issuer',
      },
      {
        type: 'USER_DECLINED_CONSENT',
        timestamp: today - 1000,
        flow: VCItemContainerFlowType.VP_SHARE,
      },
    ];
  });

  it('lists notifications under the Today section with design titles', () => {
    const {getByText, getAllByLabelText} = render(<HistoryScreen />);

    expect(getByText('title')).toBeTruthy();
    expect(getByText('allCaughtUp')).toBeTruthy();
    expect(getByText('sections.today')).toBeTruthy();
    expect(
      getAllByLabelText('notificationTitle').map(n => n.props.children),
    ).toEqual([
      'notificationTitles.credentialIssued',
      'notificationTitles.requestDeclined',
    ]);
  });

  it('shows every filter with "All" selected', () => {
    const {getByLabelText, getByText} = render(<HistoryScreen />);

    ['all', 'credentials', 'sharing', 'account'].forEach(option =>
      expect(getByText(`filters.${option}`)).toBeTruthy(),
    );
    expect(getByLabelText('filter-all').props.accessibilityState).toEqual({
      selected: true,
    });
  });

  it('shows the action-needed label for an expired credential', () => {
    mockActivities = [
      {
        type: 'VC_STATUS_CHANGED',
        vcStatus: 'EXPIRED',
        timestamp: today,
        flow: VCItemContainerFlowType.VC_SHARE,
        issuer: 'issuer',
      },
    ];
    const {getByText} = render(<HistoryScreen />);

    expect(getByText('notificationTitles.statusExpired')).toBeTruthy();
    expect(getByText('actionNeeded')).toBeTruthy();
  });

  it('shows a renewal notice for a credential expiring soon and opens it on Home', () => {
    mockActivities = [];
    mockExpiryDates = new Map([
      ['vc-in-wallet', new Date(today + 10 * 86_400_000).toISOString()],
    ]);
    const {getByText, getByLabelText} = render(<HistoryScreen />);

    expect(getByText('notificationTitles.renewalDue')).toBeTruthy();
    expect(getByText('text.VC_EXPIRY_DUE')).toBeTruthy();
    expect(getByText('actionNeeded')).toBeTruthy();

    fireEvent.press(getByLabelText('notificationRow'));
    expect(mockNavigate).toHaveBeenCalledWith('home', {
      screen: 'HomeScreen',
      params: {activeTab: 0, openVcKey: 'vc-in-wallet'},
    });
  });

  it('shows the unread count and marks everything as read', () => {
    mockUnreadCount = 2;
    const {getByText, getByLabelText, getAllByLabelText} = render(
      <HistoryScreen />,
    );

    expect(getByText('unreadCount:2')).toBeTruthy();
    expect(getAllByLabelText('unreadDot')).toHaveLength(2);

    fireEvent.press(getByLabelText('markAllAsRead'));
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('shows the no-history message when there is no activity', () => {
    mockActivities = [];
    const {getByTestId} = render(<HistoryScreen />);

    expect(getByTestId('noHistory').props.children).toBe('noHistory');
  });

  it('opens a downloaded credential that is still in the wallet on Home', () => {
    const {getAllByLabelText} = render(<HistoryScreen />);

    fireEvent.press(getAllByLabelText('notificationRow')[0]);

    expect(mockNavigate).toHaveBeenCalledWith('home', {
      screen: 'HomeScreen',
      params: {activeTab: 0, openVcKey: 'vc-in-wallet'},
    });
    expect(mockMarkAsRead).toHaveBeenCalledWith(
      expect.objectContaining({_vcKey: 'vc-in-wallet'}),
    );
  });

  it('marks a notification as read when it is opened', () => {
    const {getAllByLabelText} = render(<HistoryScreen />);

    fireEvent.press(getAllByLabelText('notificationRow')[1]);

    expect(mockMarkAsRead).toHaveBeenCalledWith(
      expect.objectContaining({type: 'USER_DECLINED_CONSENT'}),
    );
  });

  it('does not leave the screen for other notifications', () => {
    const {getAllByLabelText} = render(<HistoryScreen />);

    fireEvent.press(getAllByLabelText('notificationRow')[1]);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not leave the screen for a downloaded credential no longer in the wallet', () => {
    mockActivities = [
      {
        _vcKey: 'removed-vc',
        type: 'VC_DOWNLOADED',
        timestamp: today,
        flow: VCItemContainerFlowType.VC_SHARE,
        issuer: 'issuer',
      },
    ];
    const {getByLabelText} = render(<HistoryScreen />);

    fireEvent.press(getByLabelText('notificationRow'));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
