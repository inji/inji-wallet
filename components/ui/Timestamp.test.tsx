import React from 'react';
import {render} from '@testing-library/react-native';
import {Timestamp} from './Timestamp';

describe('Timestamp', () => {
  it('should render formatted date and time', () => {
    // March 15, 2024 at 14:30:00
    const timestamp = new Date(2024, 2, 15, 14, 30, 0).getTime();
    const {getByText} = render(<Timestamp time={timestamp} testId="test" />);

    const formatted = getByText(/15 March 2024/);
    expect(formatted).toBeTruthy();
    expect(formatted.props.children).toContain('PM');
  });

  it('should format AM time correctly', () => {
    // March 15, 2024 at 09:15:00
    const timestamp = new Date(2024, 2, 15, 9, 15, 0).getTime();
    const {getByText} = render(<Timestamp time={timestamp} testId="morning" />);

    const formatted = getByText(/09:15 AM/);
    expect(formatted).toBeTruthy();
  });

  it('should format PM time correctly', () => {
    // June 20, 2024 at 18:45:00
    const timestamp = new Date(2024, 5, 20, 18, 45, 0).getTime();
    const {getByText} = render(<Timestamp time={timestamp} testId="evening" />);

    const formatted = getByText(/06:45 PM/);
    expect(formatted).toBeTruthy();
  });

  it('should handle midnight correctly', () => {
    // January 1, 2024 at 00:00:00
    const timestamp = new Date(2024, 0, 1, 0, 0, 0).getTime();
    const {getByText} = render(
      <Timestamp time={timestamp} testId="midnight" />,
    );

    const formatted = getByText(/12:00 AM/);
    expect(formatted).toBeTruthy();
  });

  it('should handle noon correctly', () => {
    // December 25, 2023 at 12:00:00
    const timestamp = new Date(2023, 11, 25, 12, 0, 0).getTime();
    const {getByText} = render(<Timestamp time={timestamp} testId="noon" />);

    const formatted = getByText(/12:00 PM/);
    expect(formatted).toBeTruthy();
  });

  it('should pad single digit minutes with zero', () => {
    // April 10, 2024 at 15:05:00
    const timestamp = new Date(2024, 3, 10, 15, 5, 0).getTime();
    const {getByText} = render(<Timestamp time={timestamp} testId="padded" />);

    const formatted = getByText(/03:05 PM/);
    expect(formatted).toBeTruthy();
  });

  it('should render with testID prop', () => {
    const timestamp = new Date(2024, 0, 1, 0, 0, 0).getTime();
    const {toJSON} = render(<Timestamp time={timestamp} testId="myTest" />);

    expect(toJSON()).toBeTruthy();
  });

  it('should display different months correctly', () => {
    const months = [
      {month: 0, name: 'January'},
      {month: 1, name: 'February'},
      {month: 2, name: 'March'},
      {month: 6, name: 'July'},
      {month: 11, name: 'December'},
    ];

    months.forEach(({month, name}) => {
      const timestamp = new Date(2024, month, 15, 12, 0, 0).getTime();
      const {getByText} = render(
        <Timestamp time={timestamp} testId="month-test" />,
      );
      expect(getByText(new RegExp(name))).toBeTruthy();
    });
  });
});
