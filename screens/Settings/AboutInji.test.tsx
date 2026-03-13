import React from 'react';
import {render} from '@testing-library/react-native';
import {AboutInji} from './AboutInji';

jest.mock('react-native-elements', () => {
  const React = require('react');
  const ListItem = (props: any) =>
    React.createElement('View', props, props.children);
  ListItem.Content = ({children}: any) =>
    React.createElement('View', null, children);
  ListItem.Title = ({children}: any) =>
    React.createElement('View', null, children);
  return {
    ListItem,
    Icon: (props: any) => React.createElement('View', props),
    Overlay: (props: any) => React.createElement('View', props, props.children),
  };
});

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    abotInjiIcon: () => 'AboutInjiIcon',
    logoIcon: () => 'LogoIcon',
  },
}));

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

jest.mock('../../shared/api', () =>
  jest.fn(() => Promise.resolve({aboutInjiUrl: 'https://example.com'})),
);

jest.mock('../../components/CopyButton', () => ({
  CopyButton: () => 'CopyButton',
}));

jest.mock('../../shared/commonUtil', () => jest.fn(() => ({})));

jest.mock('../../shared/GlobalVariables', () => ({
  __InjiVersion: {getValue: () => '1.0.0'},
}));

jest.mock('../../components/BannerNotificationContainer', () => ({
  BannerNotificationContainer: () => 'BannerNotificationContainer',
}));

describe('AboutInji', () => {
  it('should match snapshot', () => {
    const {toJSON} = render(<AboutInji appId="test-app-id" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot without appId', () => {
    const {toJSON} = render(<AboutInji />);
    expect(toJSON()).toMatchSnapshot();
  });
});
