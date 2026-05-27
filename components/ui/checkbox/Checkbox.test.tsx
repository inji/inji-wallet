import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Checkbox, CheckboxSelectionType} from './Checkbox';

jest.mock('../svg', () => ({
  SvgImage: {selectedCheckBox: jest.fn(() => null)},
}));

// CheckBox from react-native-elements is mocked as a View in __mocks__/react-native-elements.js
// It renders with all props including onPress, accessible, accessibilityLabel (via testIDProps)

describe('Checkbox', () => {
  describe('SINGLE selection type (default)', () => {
    it('applies testId as accessibilityLabel via testIDProps', () => {
      const {getByLabelText} = render(
        <Checkbox testId="my-cb" checked={false} onPress={jest.fn()} />,
      );
      expect(getByLabelText('checkbox-single-my-cb')).toBeTruthy();
    });

    it('calls onPress when pressed and not disabled', () => {
      const onPress = jest.fn();
      const {getByLabelText} = render(
        <Checkbox testId="cb" checked={false} onPress={onPress} />,
      );
      fireEvent.press(getByLabelText('checkbox-single-cb'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onPress when disabled', () => {
      const onPress = jest.fn();
      const {getByLabelText} = render(
        <Checkbox testId="cb" checked={false} onPress={onPress} disabled />,
      );
      fireEvent.press(getByLabelText('checkbox-single-cb'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('MULTIPLE selection type', () => {
    it('applies the multiple testId prefix', () => {
      const {getByLabelText} = render(
        <Checkbox
          testId="multi-cb"
          checked={false}
          onPress={jest.fn()}
          selectionType={CheckboxSelectionType.MULTIPLE}
        />,
      );
      expect(getByLabelText('checkbox-multiple-multi-cb')).toBeTruthy();
    });

    it('calls onPress when pressed and not disabled', () => {
      const onPress = jest.fn();
      const {getByLabelText} = render(
        <Checkbox
          testId="cb"
          checked={false}
          onPress={onPress}
          selectionType={CheckboxSelectionType.MULTIPLE}
        />,
      );
      fireEvent.press(getByLabelText('checkbox-multiple-cb'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onPress when disabled', () => {
      const onPress = jest.fn();
      const {getByLabelText} = render(
        <Checkbox
          testId="cb"
          checked={false}
          onPress={onPress}
          selectionType={CheckboxSelectionType.MULTIPLE}
          disabled
        />,
      );
      fireEvent.press(getByLabelText('checkbox-multiple-cb'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  it('matches snapshot (happy path – single, checked)', () => {
    const {toJSON} = render(
      <Checkbox testId="snap" checked={true} onPress={jest.fn()} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
