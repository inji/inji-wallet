import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Header} from './Header';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 44, bottom: 34, left: 0, right: 0}),
}));

describe('Header', () => {
  it('should render with title', () => {
    const {toJSON} = render(
      <Header title="Test Title" goBack={jest.fn()} testID="header" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render without title', () => {
    const {toJSON} = render(<Header goBack={jest.fn()} testID="header" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should display title text', () => {
    const {getByText} = render(
      <Header title="My Title" goBack={jest.fn()} testID="header" />,
    );
    expect(getByText('My Title')).toBeTruthy();
  });

  it('should call goBack when back button is pressed', () => {
    const goBack = jest.fn();
    const {getByLabelText} = render(
      <Header title="My Title" goBack={goBack} testID="header" />,
    );

    fireEvent.press(getByLabelText('goBack'));
    expect(goBack).toHaveBeenCalled();
  });
});
