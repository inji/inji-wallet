import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: (id: string) => ({testID: id}),
}));
jest.mock('../ui/styleUtils', () => ({
  Theme: {
    IssuersScreenStyles: {
      issuerBoxContainer: {},
      issuerBoxContainerPressed: {},
      issuerBoxIconContainer: {},
      issuerBoxContent: {},
      issuerHeading: {},
      issuerDescription: {},
    },
    Styles: {boxShadow: {}},
  },
}));
jest.mock('../ui', () => ({
  Text: ({children, ...props}: any) =>
    React.createElement('Text', props, children),
}));
jest.mock('../ui/svg', () => ({
  SvgImage: {
    IssuerIcon: jest.fn(() =>
      React.createElement('View', {testID: 'issuerIcon'}),
    ),
    defaultIssuerLogo: jest.fn(() =>
      React.createElement('View', {testID: 'defaultLogo'}),
    ),
  },
}));
jest.mock('../../shared/openId4VCI/Utils', () => ({
  getDisplayObjectForCurrentLanguage: jest.fn(display => display?.[0] || {}),
}));
jest.mock('../../machines/Issuers/IssuersMachine', () => ({
  displayType: {},
}));
jest.mock('../VC/common/VCUtils', () => ({
  getCredentialType: jest.fn(() => 'identityCard'),
}));

import {CredentialType} from './CredentialType';
import {getCredentialType} from '../VC/common/VCUtils';

describe('CredentialType', () => {
  it('should render with display name from wellknown', () => {
    const item = {
      display: [{name: 'National ID', locale: 'en', logo: {url: 'logo.png'}}],
    };
    const {getByText} = render(
      React.createElement(CredentialType, {
        item: item as any,
        displayDetails: {} as any,
        onPress: jest.fn(),
        testID: 'test1',
      }),
    );
    expect(getByText('National ID')).toBeTruthy();
  });

  it('should render with display name from credential_metadata', () => {
    const item = {
      format: 'ldp_vc',
      proof_types_supported: {jwt: {}},
      credential_metadata: {
        display: [
          {name: 'MOSIP Credential', locale: 'en', logo: {url: 'logo.png'}},
        ],
      },
    };
    const {getByText} = render(
      React.createElement(CredentialType, {
        item: item as any,
        displayDetails: {} as any,
        onPress: jest.fn(),
        testID: 'test-v1',
      }),
    );
    expect(getByText('MOSIP Credential')).toBeTruthy();
    expect(item).toEqual(
      expect.objectContaining({
        format: 'ldp_vc',
        proof_types_supported: {jwt: {}},
        credential_metadata: expect.any(Object),
      }),
    );
  });

  it('should fallback to getCredentialType when no display', () => {
    const item = {};
    const {getByText} = render(
      React.createElement(CredentialType, {
        item: item as any,
        displayDetails: {} as any,
        onPress: jest.fn(),
        testID: 'test2',
      }),
    );
    expect(getCredentialType).toHaveBeenCalledWith(item);
    expect(getByText('identityCard')).toBeTruthy();
  });
});
