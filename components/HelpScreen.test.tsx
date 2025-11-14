import React from 'react';
import {render} from '@testing-library/react-native';
import {HelpScreen} from './HelpScreen';
import {Text} from 'react-native';

// Mock Modal
jest.mock('./ui/Modal', () => ({
  Modal: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

// Mock BannerNotificationContainer
jest.mock('./BannerNotificationContainer', () => ({
  BannerNotificationContainer: jest.fn(() => null),
}));

// Mock API
jest.mock('../shared/api', () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.resolve({
      aboutInjiUrl: 'https://docs.inji.io',
    }),
  ),
}));

describe('HelpScreen Component', () => {
  const triggerComponent = <Text>Help</Text>;

  it('should match snapshot with Inji source', () => {
    const {toJSON} = render(
      <HelpScreen source="Inji" triggerComponent={triggerComponent} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with BackUp source', () => {
    const {toJSON} = render(
      <HelpScreen source="BackUp" triggerComponent={triggerComponent} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with keyManagement source', () => {
    const {toJSON} = render(
      <HelpScreen source="keyManagement" triggerComponent={triggerComponent} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when disabled', () => {
    const {toJSON} = render(
      <HelpScreen
        source="Inji"
        triggerComponent={triggerComponent}
        isDisabled={true}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
