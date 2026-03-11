import React from 'react';
import {render} from '@testing-library/react-native';

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

jest.mock('./IssuerScreenController', () => ({
  useIssuerScreenController: () => ({
    isSelectingCredentialType: true,
    selectedIssuer: {display: [{name: 'Test Issuer', locale: 'en'}]},
    supportedCredentialTypes: [{id: 'type1', display: [{name: 'Type 1'}]}],
    CANCEL: jest.fn(),
    SELECTED_CREDENTIAL_TYPE: jest.fn(),
  }),
}));

jest.mock('../../components/openId4VCI/CredentialType', () => ({
  CredentialType: () => {
    const {View} = require('react-native');
    return <View testID="credentialType" />;
  },
}));

jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
  removeWhiteSpace: (s: string) => s?.replace(/\s/g, ''),
}));

jest.mock('../../shared/openId4VCI/Utils', () => ({
  getDisplayObjectForCurrentLanguage: (display: any) => display?.[0] || {},
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {CredentialTypeSelectionScreen} from './CredentialTypeSelectionScreen';

describe('CredentialTypeSelectionScreen', () => {
  const defaultProps = {
    navigation: {navigate: jest.fn()},
    route: {},
  } as any;

  it('should render credential type selection', () => {
    const {toJSON} = render(
      <CredentialTypeSelectionScreen {...defaultProps} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
