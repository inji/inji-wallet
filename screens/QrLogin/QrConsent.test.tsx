import React from 'react';
import {render} from '@testing-library/react-native';
import {QrConsent} from './QrConsent';

jest.mock('react-native-elements', () => {
  const React = require('react');
  const ListItem = (props: any) =>
    React.createElement('View', props, props.children);
  ListItem.Content = ({children}: any) =>
    React.createElement('View', null, children);
  ListItem.Title = ({children}: any) =>
    React.createElement('View', null, children);
  return {
    Button: (props: any) => React.createElement('View', props, props.title),
    ButtonProps: {},
    ListItem,
    Switch: (props: any) => React.createElement('View', props),
    Icon: (props: any) => React.createElement('View', props),
    Tooltip: (props: any) => React.createElement('View', props, props.children),
    CheckBox: (props: any) => React.createElement('View', props),
    Input: (props: any) => React.createElement('View', props),
    Overlay: (props: any) => React.createElement('View', props, props.children),
  };
});

jest.mock('../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('./QrLoginController', () => ({
  useQrLogin: () => ({
    linkTransactionResponse: {clientName: {eng: 'Test Client'}},
    logoUrl: 'https://example.com/logo.png',
    clientName: {eng: 'Test Client'},
    essentialClaims: ['name', 'email'],
    voluntaryClaims: ['phone'],
    isShare: {phone: false},
    SELECT_CONSENT: jest.fn(),
  }),
}));

jest.mock('../../i18n', () => ({
  getClientNameForCurrentLanguage: (names: any) => names?.eng || 'Client',
}));

describe('QrConsent', () => {
  const defaultProps = {
    isVisible: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    service: {} as any,
  };

  it('should match snapshot when visible', () => {
    const {toJSON} = render(<QrConsent {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(<QrConsent {...defaultProps} isVisible={false} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
