import React from 'react';
import {Pressable, Text} from 'react-native';
import {render, fireEvent} from '@testing-library/react-native';
import {Header} from './Header';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 44, bottom: 34, left: 0, right: 0}),
  SafeAreaView: 'RCTSafeAreaView',
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

  it('keeps the standard back button when a right action is provided', () => {
    const goBack = jest.fn();
    const {getByLabelText} = render(
      <Header
        title="My Title"
        goBack={goBack}
        testID="header"
        headerRight={<Text>Help</Text>}
      />,
    );

    fireEvent.press(getByLabelText('goBack'));
    expect(goBack).toHaveBeenCalled();
  });
  it('renders optional header actions and routes their presses independently', () => {
    const onBack = jest.fn();
    const onHelp = jest.fn();
    const screen = render(
      <Header
        safeArea={false}
        elevation={0}
        title="Review request"
        headerLeft={
          <Pressable accessibilityLabel="Back" onPress={onBack}>
            <Text>Back</Text>
          </Pressable>
        }
        headerRight={
          <Pressable accessibilityLabel="Help" onPress={onHelp}>
            <Text>Help</Text>
          </Pressable>
        }
      />,
    );
    expect(screen.getByText('Review request')).toBeOnTheScreen();
    fireEvent.press(screen.getByLabelText('Help'));
    expect(onHelp).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
