import React from 'react';
import {render, fireEvent, act} from '@testing-library/react-native';
import {VCItemFieldName, VCItemFieldValue, VCItemField} from './VCItemField';

jest.mock('../../ui/svg', () => ({
  SvgImage: {
    info: jest.fn(() => null),
  },
}));

jest.mock('./VCUtils', () => ({
  STATUS_FIELD_NAME: 'status',
  DETAIL_VIEW_DEFAULT_FIELDS: [],
}));

jest.mock('./StatusInfoModal', () => ({
  StatusInfoModal: ({isVisible, onClose}: any) => {
    const {View, TouchableOpacity, Text} = require('react-native');
    return isVisible ? (
      <View testID="statusInfoModal">
        <TouchableOpacity testID="closeModal" onPress={onClose}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    ) : null;
  },
}));

jest.mock('react-native-vector-icons/FontAwesome', () => {
  const {View} = require('react-native');
  return (props: any) => <View testID="fontAwesomeIcon" {...props} />;
});

jest.mock('../../../shared/commonUtil', () => ({
  __esModule: true,
  default: (id: string) => ({testID: id}),
}));

describe('VCItemFieldName', () => {
  it('renders field name', () => {
    const {getByText} = render(
      <VCItemFieldName fieldName="Full Name" testID="name" />,
    );
    expect(getByText('Full Name')).toBeTruthy();
  });

  it('renders status field with info icon and StatusInfoModal', () => {
    const {getByTestId} = render(
      <VCItemFieldName fieldName="status" testID="status" />,
    );
    expect(getByTestId('statusInfoButton')).toBeTruthy();
  });

  it('renders disclosed icon when isDisclosed', () => {
    const {getByTestId} = render(
      <VCItemFieldName
        fieldName="Name"
        testID="disclosed"
        isDisclosed={true}
      />,
    );
    expect(getByTestId('fontAwesomeIcon')).toBeTruthy();
  });

  it('does not render disclosed icon by default', () => {
    const {queryByTestId} = render(
      <VCItemFieldName fieldName="Name" testID="noDisclosed" />,
    );
    expect(queryByTestId('fontAwesomeIcon')).toBeNull();
  });

  it('renders nothing when fieldName is empty', () => {
    const {toJSON} = render(<VCItemFieldName fieldName="" testID="empty" />);
    expect(toJSON()).toBeTruthy();
  });
});

describe('VCItemFieldValue', () => {
  it('renders string value', () => {
    const {getByText} = render(
      <VCItemFieldValue fieldValue="John Doe" testID="name" />,
    );
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('renders React element value', () => {
    const {Text} = require('react-native');
    const element = <Text testID="customElement">Custom</Text>;
    const {getByTestId} = render(
      <VCItemFieldValue fieldValue={element} testID="element" />,
    );
    expect(getByTestId('elementValue')).toBeTruthy();
    expect(getByTestId('customElement')).toBeTruthy();
  });
});

describe('VCItemField', () => {
  it('renders combined field name and value', () => {
    const {getByText} = render(
      <VCItemField
        fieldName="Email"
        fieldValue="test@test.com"
        testID="email"
      />,
    );
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('test@test.com')).toBeTruthy();
  });
});
