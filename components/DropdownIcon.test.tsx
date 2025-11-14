import React from 'react';
import {render} from '@testing-library/react-native';
import {DropdownIcon} from './DropdownIcon';

// Mock Popable
jest.mock('react-native-popable', () => ({
  Popable: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('DropdownIcon Component', () => {
  const mockItems = [
    {label: 'Item 1', onPress: jest.fn(), icon: 'account'},
    {label: 'Item 2', onPress: jest.fn(), icon: 'settings'},
    {label: 'Item 3', onPress: jest.fn(), icon: 'delete', idType: 'type1'},
  ];

  const defaultProps = {
    idType: 'type1',
    icon: 'dots-vertical',
    items: mockItems,
  };

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<DropdownIcon {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different icon', () => {
    const {toJSON} = render(<DropdownIcon {...defaultProps} icon="menu" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with empty items', () => {
    const {toJSON} = render(<DropdownIcon {...defaultProps} items={[]} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with multiple items', () => {
    const manyItems = [
      {label: 'Action 1', onPress: jest.fn(), icon: 'edit'},
      {label: 'Action 2', onPress: jest.fn(), icon: 'share'},
      {label: 'Action 3', onPress: jest.fn(), icon: 'download'},
      {label: 'Action 4', onPress: jest.fn(), icon: 'upload'},
    ];
    const {toJSON} = render(
      <DropdownIcon {...defaultProps} items={manyItems} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
