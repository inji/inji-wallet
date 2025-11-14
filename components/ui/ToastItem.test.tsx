import React from 'react';
import {render} from '@testing-library/react-native';
import {ToastItem} from './ToastItem';

describe('ToastItem', () => {
  it('should render toast message', () => {
    const {getByText} = render(<ToastItem message="Success!" />);
    expect(getByText('Success!')).toBeTruthy();
  });

  it('should render long message', () => {
    const longMessage =
      'This is a very long toast message that should still be displayed properly';
    const {getByText} = render(<ToastItem message={longMessage} />);
    expect(getByText(longMessage)).toBeTruthy();
  });

  it('should render short message', () => {
    const {getByText} = render(<ToastItem message="OK" />);
    expect(getByText('OK')).toBeTruthy();
  });

  it('should render empty message', () => {
    const {toJSON} = render(<ToastItem message="" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render message with special characters', () => {
    const message = 'Error: Operation failed! (Code: 500)';
    const {getByText} = render(<ToastItem message={message} />);
    expect(getByText(message)).toBeTruthy();
  });

  it('should render message with numbers', () => {
    const message = '123 items processed successfully';
    const {getByText} = render(<ToastItem message={message} />);
    expect(getByText(message)).toBeTruthy();
  });

  it('should render message with emojis', () => {
    const message = '✅ Success! 🎉';
    const {getByText} = render(<ToastItem message={message} />);
    expect(getByText(message)).toBeTruthy();
  });

  it('should render multiline message', () => {
    const message = 'Line 1\nLine 2\nLine 3';
    const {getByText} = render(<ToastItem message={message} />);
    expect(getByText(message)).toBeTruthy();
  });

  it('should render different toast messages', () => {
    const messages = [
      'Operation completed',
      'Error occurred',
      'Warning: Low storage',
      'Info: Update available',
    ];

    messages.forEach(message => {
      const {getByText} = render(<ToastItem message={message} />);
      expect(getByText(message)).toBeTruthy();
    });
  });
});
