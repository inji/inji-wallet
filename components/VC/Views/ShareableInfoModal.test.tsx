import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';

// We need to import the module to test its utility functions and component
// First, mock the required dependencies
jest.mock('../../ui/svg', () => ({
  SvgImage: {},
}));

// Import the component - internal utility functions are tested through the component
import {ShareableInfoModal} from './ShareableInfoModal';

describe('ShareableInfoModal', () => {
  const defaultProps = {
    isVisible: true,
    onDismiss: jest.fn(),
    disclosedPaths: ['name', 'address.city', 'address.state'],
  };

  it('should render disclosed field labels when visible', () => {
    const {toJSON, getByText} = render(
      <ShareableInfoModal {...defaultProps} />,
    );
    expect(toJSON()).toBeDefined();
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Address')).toBeTruthy();
  });

  it('should not render content when not visible', () => {
    const {toJSON} = render(
      <ShareableInfoModal {...defaultProps} isVisible={false} />,
    );
    const tree: any = toJSON();
    expect(tree).toBeDefined();
    expect(tree.props.isVisible).toBe(false);
  });

  it('should render modal with empty disclosed paths', () => {
    const {toJSON} = render(
      <ShareableInfoModal {...defaultProps} disclosedPaths={[]} />,
    );
    expect(toJSON()).toBeDefined();
  });

  it('should render nested array path labels', () => {
    const {toJSON, getByText} = render(
      <ShareableInfoModal
        {...defaultProps}
        disclosedPaths={[
          'name',
          'addresses[0].city',
          'addresses[0].state',
          'addresses[1].city',
          'phones[0]',
        ]}
      />,
    );
    expect(toJSON()).toBeDefined();
    expect(getByText(/Addresses/)).toBeTruthy();
    expect(getByText(/Phones/)).toBeTruthy();
  });

  it('should render deeply nested path labels', () => {
    const {toJSON, getByText} = render(
      <ShareableInfoModal
        {...defaultProps}
        disclosedPaths={[
          'person.name.firstName',
          'person.name.lastName',
          'person.address.home.street',
          'person.address.home.city',
        ]}
      />,
    );
    expect(toJSON()).toBeDefined();
    expect(getByText(/Person/)).toBeTruthy();
    expect(getByText(/Home/)).toBeTruthy();
  });

  it('should call onDismiss when close icon is pressed', () => {
    const onDismiss = jest.fn();
    const {UNSAFE_getAllByProps} = render(
      <ShareableInfoModal {...defaultProps} onDismiss={onDismiss} />,
    );
    const closers = UNSAFE_getAllByProps({name: 'close'});
    fireEvent.press(closers[0]);
    expect(onDismiss).toHaveBeenCalled();
  });
});
