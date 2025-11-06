import React from 'react';
import {render} from '@testing-library/react-native';
import {EditableListItem} from './EditableListItem';

// Mock SvgImage
jest.mock('./ui/svg', () => ({
  SvgImage: {
    starIcon: jest.fn(() => null),
  },
}));

// Mock react-native-elements
jest.mock('react-native-elements', () => ({
  Icon: jest.fn(() => null),
  ListItem: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Overlay: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Input: jest.fn(() => null),
}));

// Mock ui components
jest.mock('./ui', () => ({
  Button: jest.fn(() => null),
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Row: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

// Add mock for ListItem.Content and ListItem.Title
const ListItem = require('react-native-elements').ListItem;
ListItem.Content = ({children}: {children: React.ReactNode}) => <>{children}</>;
ListItem.Title = ({children}: {children: React.ReactNode}) => <>{children}</>;

describe('EditableListItem Component', () => {
  const mockItems = [
    {label: 'Email', value: 'test@example.com', testID: 'emailItem'},
    {label: 'Phone', value: '1234567890', testID: 'phoneItem'},
  ];

  const defaultProps = {
    testID: 'editableItem',
    title: 'Contact Information',
    content: 'Edit your details',
    items: mockItems,
    Icon: 'edit',
    onEdit: jest.fn(),
    onCancel: jest.fn(),
    titleColor: '#000000',
  };

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<EditableListItem {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom title color', () => {
    const {toJSON} = render(
      <EditableListItem {...defaultProps} titleColor="#FF0000" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with progress indicator', () => {
    const {toJSON} = render(
      <EditableListItem {...defaultProps} progress={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with error state', () => {
    const {toJSON} = render(
      <EditableListItem
        {...defaultProps}
        response="error"
        errorMessage="Failed to update"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with success response', () => {
    const {toJSON} = render(
      <EditableListItem {...defaultProps} response="success" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with single item', () => {
    const {toJSON} = render(
      <EditableListItem
        {...defaultProps}
        items={[{label: 'Name', value: 'John Doe', testID: 'nameItem'}]}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
