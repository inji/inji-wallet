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
jest.mock('../../machines/Issuers/IssuersMachine', () => ({
  displayType: {},
}));

import {Issuer} from './Issuer';

describe('Issuer', () => {
  it('should render issuer with logo', () => {
    const {getByText} = render(
      React.createElement(Issuer, {
        displayDetails: {
          name: 'Test Issuer',
          title: 'Test Title',
          description: 'Test Description',
          logo: {url: 'test.png'},
        } as any,
        onPress: jest.fn(),
        testID: 'issuer1',
      }),
    );
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('should render default logo when no logo provided', () => {
    const {getByText} = render(
      React.createElement(Issuer, {
        displayDetails: {
          name: 'Fallback Issuer',
          description: 'No Logo',
        } as any,
        onPress: jest.fn(),
        testID: 'issuer2',
      }),
    );
    expect(getByText('Fallback Issuer')).toBeTruthy();
  });

  it('should use title over name when both present', () => {
    const {getByText} = render(
      React.createElement(Issuer, {
        displayDetails: {
          name: 'Name',
          title: 'Title',
          description: 'Desc',
          logo: {url: 'x'},
        } as any,
        onPress: jest.fn(),
        testID: 'issuer3',
      }),
    );
    expect(getByText('Title')).toBeTruthy();
  });
});
