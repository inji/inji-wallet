import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {BackButton} from './BackButton';

describe('BackButton', () => {
  describe('default (arrow) type', () => {
    it('renders the arrow-left icon with goBack accessibilityLabel', () => {
      const {getByLabelText} = render(<BackButton onPress={jest.fn()} />);
      // testIDProps('goBack') → { accessible: true, accessibilityLabel: 'goBack' } on Android
      expect(getByLabelText('goBack')).toBeTruthy();
    });

    it('calls onPress when the TouchableOpacity is pressed', () => {
      const onPress = jest.fn();
      const {getByLabelText} = render(<BackButton onPress={onPress} />);
      fireEvent.press(getByLabelText('goBack'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('matches snapshot (happy path)', () => {
      const {toJSON} = render(<BackButton onPress={jest.fn()} />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  describe('chevron type', () => {
    it('renders the closeModal icon', () => {
      const {getByLabelText} = render(
        <BackButton onPress={jest.fn()} type="chevron" />,
      );
      // testIDProps('closeModal') → { accessible: true, accessibilityLabel: 'closeModal' }
      expect(getByLabelText('closeModal')).toBeTruthy();
    });

    it('calls onPress when the chevron icon is pressed', () => {
      const onPress = jest.fn();
      const {getByLabelText} = render(
        <BackButton onPress={onPress} type="chevron" />,
      );
      fireEvent.press(getByLabelText('closeModal'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('shows back text when showBackText is true', () => {
      const {getByText} = render(
        <BackButton onPress={jest.fn()} type="chevron" showBackText />,
      );
      // useTranslation is mocked to return key as value → t('back') === 'back'
      expect(getByText('back')).toBeTruthy();
    });

    it('does not show back text when showBackText is false (default)', () => {
      const {queryByText} = render(
        <BackButton onPress={jest.fn()} type="chevron" />,
      );
      expect(queryByText('back')).toBeNull();
    });
  });
});
