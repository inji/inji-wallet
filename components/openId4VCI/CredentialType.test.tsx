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
  getCredentialType: jest.fn(() => 'National ID'),
}));

import {CredentialType} from './CredentialType';

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
    expect(getByText('National ID')).toBeTruthy();
  });
});
