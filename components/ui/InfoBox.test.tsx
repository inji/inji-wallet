import React from 'react';
import {render} from '@testing-library/react-native';
import {InfoBox} from './InfoBox';

const defaultProps = {
  testID: "test",
  backgroundColor: "yellow",
  borderColor: "black",
  textColor: "red"
}

describe('InfoBox', () => {
  it('renders the provided message', () => {
    const {getByText} = render(
      <InfoBox {...defaultProps} message={'One card is selected. Tap "Show more" to see additional options.'} />,
    );

    expect(
      getByText('One card is selected. Tap "Show more" to see additional options.'),
    ).toBeTruthy();
  });

  it('exposes predictable test ids for container and message', () => {
    const {getByLabelText} = render(
      <InfoBox {...defaultProps} testID="requested-cards-info" message="Info message" />,
    );

    expect(getByLabelText('requested-cards-info')).toBeTruthy();
    expect(getByLabelText('requested-cards-info-message')).toBeTruthy();
  });

  it('accepts backgroundColor prop', () => {
    const {getByLabelText} = render(
      <InfoBox
        {...defaultProps}
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
        {...defaultProps}
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
        {...defaultProps}
        testID="custom-colors"
        message="Info message"
        backgroundColor="#FF5300"
        borderColor="#5B03AD"
      />,
    );

    expect(getByLabelText('custom-colors')).toBeTruthy();
  });
});



