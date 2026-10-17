import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {AddToWalletSheet} from './AddToWalletSheet';

jest.mock('expo-localization', () => ({
  getLocales: () => [{languageTag: 'en-US', languageCode: 'en'}],
}));
jest.mock('react-i18next', () => ({
  initReactI18next: {type: '3rdParty', init: jest.fn()},
  useTranslation: () => ({t: (key: string) => key}),
}));
// The shared react-native mock breaks Animated, so the sheet's frame is stood in for here.
const mockBottomSheet = jest.fn();
jest.mock('../ui/BottomSheet', () => ({
  BottomSheet: (props: {isVisible: boolean; children: React.ReactNode}) => {
    mockBottomSheet(props);
    return props.isVisible ? props.children : null;
  },
}));

// testIDProps puts automation ids in accessibilityLabel on Android, which tests run as.
describe('AddToWalletSheet', () => {
  const renderSheet = (props = {}) => {
    const callbacks = {
      onScanToAdd: jest.fn(),
      onCancel: jest.fn(),
      onClosed: jest.fn(),
    };
    const utils = render(
      <AddToWalletSheet isVisible={true} {...callbacks} {...props} />,
    );
    return {...utils, ...callbacks};
  };

  beforeEach(() => mockBottomSheet.mockClear());

  it('offers Scan to Add as the only option', () => {
    const {getByLabelText, getByText, queryByText} = renderSheet();

    expect(getByLabelText('scanToAddOption')).toBeTruthy();
    expect(getByText('scanToAdd.title')).toBeTruthy();
    expect(queryByText('findCredential.title')).toBeNull();
  });

  it('starts scanning when Scan to Add is tapped', () => {
    const {getByLabelText, onScanToAdd} = renderSheet();

    fireEvent.press(getByLabelText('scanToAddOption'));

    expect(onScanToAdd).toHaveBeenCalledTimes(1);
  });

  it('closes when Cancel is tapped', () => {
    const {getByLabelText, onCancel} = renderSheet();

    fireEvent.press(getByLabelText('addToWalletCancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('closes on back or a backdrop tap, and reports when it has closed', () => {
    const {onCancel, onClosed} = renderSheet();
    const sheetProps = mockBottomSheet.mock.calls[0][0];

    expect(sheetProps.onRequestClose).toBe(onCancel);
    expect(sheetProps.dismissOnBackdropPress).not.toBe(false);
    expect(sheetProps.onClosed).toBe(onClosed);
  });

  it('shows nothing while hidden', () => {
    const {queryByLabelText} = renderSheet({isVisible: false});

    expect(queryByLabelText('scanToAddOption')).toBeNull();
  });
});
