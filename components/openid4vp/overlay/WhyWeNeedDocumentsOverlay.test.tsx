import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {WhyWeNeedDocumentsOverlay} from './WhyWeNeedDocumentsOverlay';
import {Text, TouchableOpacity} from 'react-native';

jest.mock('../../ui/divider/Divider', () => ({
  Divider: ({testId}: any) => {
    const {Text} = require('react-native');
    return <Text testID={`vc-item-${testId}`}>Divider</Text>;
  },
}));

describe('WhyWeNeedDocumentsOverlay', () => {
  it('renders when isVisible is true', () => {
    const {toJSON} = render(
      <WhyWeNeedDocumentsOverlay isVisible onClose={jest.fn()} />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('renders overlay content with title and body text', () => {
    const {getByText} = render(
      <WhyWeNeedDocumentsOverlay isVisible onClose={jest.fn()} />,
    );
    // useTranslation is mocked: t('key') returns the key string
    expect(getByText('infoOverlay.title')).toBeTruthy();
    expect(getByText('infoOverlay.body')).toBeTruthy();
  });

  it('renders required credentials section', () => {
    const {getByText} = render(
      <WhyWeNeedDocumentsOverlay isVisible onClose={jest.fn()} />,
    );
    expect(getByText('infoOverlay.requiredCredentials.title')).toBeTruthy();
    expect(
      getByText('infoOverlay.requiredCredentials.description'),
    ).toBeTruthy();
  });

  it('renders optional credentials section', () => {
    const {getByText} = render(
      <WhyWeNeedDocumentsOverlay isVisible onClose={jest.fn()} />,
    );
    expect(getByText('infoOverlay.optionalCredentials.title')).toBeTruthy();
    expect(
      getByText('infoOverlay.optionalCredentials.description'),
    ).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const {UNSAFE_getAllByType} = render(
      <WhyWeNeedDocumentsOverlay isVisible onClose={onClose} />,
    );
    const {TouchableOpacity} = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    // First TouchableOpacity is the close button in the header
    fireEvent.press(buttons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('matches snapshot (happy path – visible overlay)', () => {
    const {toJSON} = render(
      <WhyWeNeedDocumentsOverlay isVisible onClose={jest.fn()} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
