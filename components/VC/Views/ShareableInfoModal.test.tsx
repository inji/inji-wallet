import React from 'react';
import {render} from '@testing-library/react-native';

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

  it('should match snapshot when visible with disclosed paths', () => {
    const {toJSON, getByText} = render(
      <ShareableInfoModal {...defaultProps} />,
    );
    expect(toJSON()).toMatchSnapshot();
    expect(getByText('Name')).toBeTruthy();
    expect(getByText('Address')).toBeTruthy();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <ShareableInfoModal {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with empty disclosed paths', () => {
    const {toJSON} = render(
      <ShareableInfoModal {...defaultProps} disclosedPaths={[]} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with nested array paths', () => {
    const {toJSON} = render(
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
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with deeply nested paths', () => {
    const {toJSON} = render(
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
    expect(toJSON()).toMatchSnapshot();
  });
});
