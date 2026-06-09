import React from 'react';
import {render} from '@testing-library/react-native';
import {View} from 'react-native';
import {InfoBox} from './InfoBox';

describe('InfoBox', () => {
  it('renders the provided message', () => {
    const {getByText} = render(
      <InfoBox message={'One card is selected. Tap "Show more" to see additional options.'} />,
    );

    expect(
      getByText('One card is selected. Tap "Show more" to see additional options.'),
    ).toBeTruthy();
  });

  it('exposes predictable test ids for container and message', () => {
    const {getByLabelText} = render(
      <InfoBox testID="requested-cards-info" message="Info message" />,
    );

    expect(getByLabelText('requested-cards-info')).toBeTruthy();
    expect(getByLabelText('requested-cards-info-message')).toBeTruthy();
  });

  it('renders an optional leading icon when provided', () => {
    const {getByLabelText, getByTestId} = render(
      <InfoBox
        testID="requested-cards-info"
        message="Info message"
        icon={<View testID="custom-info-icon" />}
      />,
    );

    expect(getByLabelText('requested-cards-info-icon')).toBeTruthy();
    expect(getByTestId('custom-info-icon')).toBeTruthy();
  });

  it('accepts backgroundColor prop', () => {
    const {getByLabelText} = render(
      <InfoBox
        testID="custom-bg"
        message="Info message"
        backgroundColor="#FF5300"
      />,
    );

    expect(getByLabelText('custom-bg')).toBeTruthy();
  });

  it('accepts borderColor prop', () => {
    const {getByLabelText} = render(
      <InfoBox
        testID="custom-border"
        message="Info message"
        borderColor="#5B03AD"
      />,
    );

    expect(getByLabelText('custom-border')).toBeTruthy();
  });

  it('accepts both backgroundColor and borderColor props', () => {
    const {getByLabelText} = render(
      <InfoBox
        testID="custom-colors"
        message="Info message"
        backgroundColor="#FF5300"
        borderColor="#5B03AD"
      />,
    );

    expect(getByLabelText('custom-colors')).toBeTruthy();
  });
});



