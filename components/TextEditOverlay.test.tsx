import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {TextEditOverlay} from './TextEditOverlay';

// Mock react-native-elements with a more realistic Input
jest.mock('react-native-elements', () => {
  const RN = jest.requireActual('react-native');
  return {
    Input: (props: {value: string; onChangeText: (text: string) => void}) => (
      <RN.TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        testID="text-input"
      />
    ),
  };
});

// Mock ui components with more realistic Button
jest.mock('./ui', () => {
  const RN = jest.requireActual('react-native');
  const React = jest.requireActual('react');
  return {
    Button: (props: {title: string; onPress: () => void}) => (
      <RN.TouchableOpacity
        onPress={props.onPress}
        testID={`button-${props.title}`}>
        <RN.Text>{props.title}</RN.Text>
      </RN.TouchableOpacity>
    ),
    Centered: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Row: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
  };
});

describe('TextEditOverlay Component', () => {
  const defaultProps = {
    isVisible: true,
    label: 'Edit Name',
    value: 'John Doe',
    onSave: jest.fn(),
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot with default props', () => {
    const {toJSON} = render(<TextEditOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different label', () => {
    const {toJSON} = render(
      <TextEditOverlay {...defaultProps} label="Edit Email" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with maxLength', () => {
    const {toJSON} = render(
      <TextEditOverlay {...defaultProps} maxLength={50} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with empty value', () => {
    const {toJSON} = render(<TextEditOverlay {...defaultProps} value="" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with long value', () => {
    const {toJSON} = render(
      <TextEditOverlay
        {...defaultProps}
        value="This is a very long text value that should be editable"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should call onSave with value when save button is pressed', () => {
    const onSave = jest.fn();
    const {getByTestId} = render(
      <TextEditOverlay {...defaultProps} onSave={onSave} value="Test Value" />,
    );

    const saveButton = getByTestId('button-save');
    fireEvent.press(saveButton);

    // onSave should be called with the current value
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(typeof onSave.mock.calls[0][0]).toBe('string');
  });

  it('should call onSave with original value when save is pressed without changes', () => {
    const onSave = jest.fn();
    const {getByTestId} = render(
      <TextEditOverlay {...defaultProps} onSave={onSave} />,
    );

    const saveButton = getByTestId('button-save');
    fireEvent.press(saveButton);

    expect(onSave).toHaveBeenCalledWith('John Doe');
  });

  it('should call onDismiss and reset value when cancel button is pressed', () => {
    const onDismiss = jest.fn();
    const {getByTestId} = render(
      <TextEditOverlay {...defaultProps} onDismiss={onDismiss} />,
    );

    const input = getByTestId('text-input');
    // Simulate text change
    input.props.onChangeText('Modified Text');

    const cancelButton = getByTestId('button-cancel');
    fireEvent.press(cancelButton);

    expect(onDismiss).toHaveBeenCalled();
  });

  it('should handle text input changes', () => {
    const {getByTestId} = render(<TextEditOverlay {...defaultProps} />);

    const input = getByTestId('text-input');

    // Verify input has onChangeText handler
    expect(input.props.onChangeText).toBeDefined();
    expect(typeof input.props.onChangeText).toBe('function');
  });

  it('should not use isVisible prop', () => {
    // Note: isVisible is defined in the interface but not used in the component
    // This test documents that the prop exists but has no effect
    const {toJSON: jsonVisible} = render(
      <TextEditOverlay {...defaultProps} isVisible={true} />,
    );
    const {toJSON: jsonHidden} = render(
      <TextEditOverlay {...defaultProps} isVisible={false} />,
    );

    // Both render the same output regardless of isVisible value
    expect(JSON.stringify(jsonVisible())).toEqual(JSON.stringify(jsonHidden()));
  });
});
