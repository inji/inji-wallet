import React from 'react';
import {render} from '@testing-library/react-native';
import {KebabPopUp} from './KebabPopUp';
import {Text} from 'react-native';

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })),
}));

// Mock controller
jest.mock('./KebabPopUpController', () => ({
  useKebabPopUp: jest.fn(() => ({
    isScanning: false,
  })),
}));

// Mock kebabMenuUtils
jest.mock('./kebabMenuUtils', () => ({
  getKebabMenuOptions: jest.fn(() => [
    {
      testID: 'pinCard',
      label: 'Pin Card',
      onPress: jest.fn(),
      icon: null,
    },
    {
      testID: 'removeFromWallet',
      label: 'Remove',
      onPress: jest.fn(),
      icon: null,
    },
  ]),
}));

// Mock react-native-elements
jest.mock('react-native-elements', () => ({
  Icon: jest.fn(() => null),
  ListItem: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Overlay: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

// Mock FlatList
jest.mock('react-native-gesture-handler', () => ({
  FlatList: ({renderItem, data}: any) => (
    <>{data.map((item: any, index: number) => renderItem({item, index}))}</>
  ),
}));

describe('KebabPopUp Component', () => {
  const mockService = {} as any;
  const mockVcMetadata = {
    id: 'test-vc',
    vcLabel: 'Test VC',
  };

  const defaultProps = {
    iconName: 'ellipsis-vertical',
    vcMetadata: mockVcMetadata as any,
    isVisible: true,
    onDismiss: jest.fn(),
    service: mockService,
    vcHasImage: false,
  };

  it('should match snapshot with default icon', () => {
    const {toJSON} = render(<KebabPopUp {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom icon component', () => {
    const CustomIcon = <Text>Custom</Text>;
    const {toJSON} = render(<KebabPopUp {...defaultProps} icon={CustomIcon} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom icon color', () => {
    const {toJSON} = render(
      <KebabPopUp {...defaultProps} iconColor="#FF0000" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(<KebabPopUp {...defaultProps} isVisible={false} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with VC that has image', () => {
    const {toJSON} = render(<KebabPopUp {...defaultProps} vcHasImage={true} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
