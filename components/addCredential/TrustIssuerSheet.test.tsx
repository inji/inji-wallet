import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {TrustIssuerSheet} from './TrustIssuerSheet';

const mockInfoPoints = {value: ['Point one', 'Point two'] as unknown};

jest.mock('expo-localization', () => ({
  getLocales: () => [{languageTag: 'en-US', languageCode: 'en'}],
}));
jest.mock('react-i18next', () => ({
  initReactI18next: {type: '3rdParty', init: jest.fn()},
  useTranslation: () => ({
    t: (key: string, options?: {name?: string}) => {
      if (key === 'infoPoints') {
        return mockInfoPoints.value;
      }
      return options?.name ? `${key}:${options.name}` : key;
    },
  }),
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
describe('TrustIssuerSheet', () => {
  const renderSheet = (props = {}) => {
    const callbacks = {onConfirm: jest.fn(), onCancel: jest.fn()};
    const utils = render(
      <TrustIssuerSheet
        isVisible={true}
        name="Ministry of Transport"
        credentialTypes={['Driving Licence']}
        consentStatus="idle"
        {...callbacks}
        {...props}
      />,
    );
    return {...utils, ...callbacks};
  };

  beforeEach(() => {
    mockBottomSheet.mockClear();
    mockInfoPoints.value = ['Point one', 'Point two'];
  });

  it('shows the issuer, what it is offering and what trusting it means', () => {
    const {getByLabelText, getByText} = renderSheet();

    expect(getByLabelText('trustIssuerName')).toHaveTextContent(
      'Ministry of Transport',
    );
    expect(getByLabelText('trustIssuerOffering')).toHaveTextContent(
      'Driving Licence',
    );
    expect(getByText('description:Ministry of Transport')).toBeTruthy();
    expect(getByText('Point one')).toBeTruthy();
    expect(getByText('Point two')).toBeTruthy();
  });

  it('hides the Offering row when the offered types are unknown', () => {
    const {queryByLabelText} = renderSheet({credentialTypes: []});

    expect(queryByLabelText('trustIssuerOffering')).toBeNull();
  });

  it('names the issuer as unknown when it has no display name', () => {
    const {getByLabelText} = renderSheet({name: ''});

    expect(getByLabelText('trustIssuerName')).toHaveTextContent(
      'unknownIssuer',
    );
  });

  it('still renders when a language is missing the info points', () => {
    mockInfoPoints.value = 'infoPoints';

    const {getByLabelText, queryByText} = renderSheet();

    expect(getByLabelText('trustIssuerConfirm')).toBeTruthy();
    expect(queryByText('Point one')).toBeNull();
  });

  it('confirms or goes back from the two buttons', () => {
    const {getByLabelText, onConfirm, onCancel} = renderSheet();

    fireEvent.press(getByLabelText('trustIssuerConfirm'));
    fireEvent.press(getByLabelText('trustIssuerCancel'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('keeps the sheet open on a backdrop tap and goes back on the back button', () => {
    const {onCancel} = renderSheet();
    const sheetProps = mockBottomSheet.mock.calls[0][0];

    expect(sheetProps.dismissOnBackdropPress).toBe(false);
    sheetProps.onRequestClose();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('cannot be dismissed while trusting is in progress', () => {
    const {getByLabelText, onConfirm, onCancel} = renderSheet({
      consentStatus: 'loading',
    });

    fireEvent.press(getByLabelText('trustIssuerConfirm'));
    fireEvent.press(getByLabelText('trustIssuerCancel'));
    mockBottomSheet.mock.calls[0][0].onRequestClose();

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('shows the trusted state once the issuer is trusted', () => {
    const {getByLabelText, queryByLabelText} = renderSheet({
      consentStatus: 'success',
    });

    expect(getByLabelText('issuerTrusted')).toBeTruthy();
    expect(queryByLabelText('trustIssuerConfirm')).toBeNull();
  });
});
