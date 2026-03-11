import React from 'react';
import {render} from '@testing-library/react-native';
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
});
