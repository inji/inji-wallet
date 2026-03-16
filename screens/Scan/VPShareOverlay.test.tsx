import React from 'react';
import {render} from '@testing-library/react-native';
import {VPShareOverlay} from './VPShareOverlay';

describe('VPShareOverlay', () => {
  const defaultProps = {
    isVisible: true,
    title: 'Share Credential',
    titleTestID: 'shareTitle',
    message: 'Do you want to share this credential?',
    messageTestID: 'shareMessage',
    primaryButtonTestID: 'primaryBtn',
    primaryButtonText: 'Share',
    primaryButtonEvent: jest.fn(),
    secondaryButtonTestID: 'secondaryBtn',
    secondaryButtonText: 'Cancel',
    secondaryButtonEvent: jest.fn(),
    onCancel: jest.fn(),
  };

  it('should match snapshot when visible', () => {
    const {toJSON} = render(<VPShareOverlay {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const {toJSON} = render(
      <VPShareOverlay {...defaultProps} isVisible={false} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different text', () => {
    const {toJSON} = render(
      <VPShareOverlay
        {...defaultProps}
        title="VP Share"
        message="Share your verifiable presentation"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
