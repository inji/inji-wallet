import {View} from "react-native";

jest.mock('react-native-fast-image', () => 'FastImage');
jest.mock('../Modal', () => ({
  Modal: ({children}) => children,
}));
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const EventEmitter = require('events');
  return EventEmitter;
});
jest.mock('../../../../assets/done-icon.svg', () => 'DoneIcon');
jest.mock(
  '../../../../assets/arrow-circle-broken-right.svg',
  () => 'CircleArrowRight',
);
jest.mock('../Button', () => ({
  Button: ({title, testID}: {title: string; testID?: string}) => (
    <View accessibilityRole="button" accessibilityLabel={title}>{title}</View>
  ),
}));

import React from 'react';
import {render} from '@testing-library/react-native';
import {
  ProcessingModal,
  ProgressIndicator,
  ProcessingScreenProps,
} from './ProcessingModal';
import {Button} from '../Button';

const mockAction = <Button title="Go to Home" type="gradient" />;

describe('ProgressIndicator', () => {
  it('renders label and completed icon with default color', () => {
    const {getByText} = render(
      <ProgressIndicator label="Test Step" completed={true} />,
    );
    expect(getByText('Test Step')).toBeTruthy();
  });

  it('renders with custom color', () => {
    const {getByText} = render(
      <ProgressIndicator label="Colored Step" completed={false} />,
    );
    expect(getByText('Colored Step')).toBeTruthy();
  });
});

describe('ProcessingScreen', () => {
  const progressSteps = [
    <ProgressIndicator key={0} label="Step 1" completed={true} />,
    <ProgressIndicator key={1} label="Step 2" completed={false} />,
  ];
  const props: ProcessingScreenProps = {
    title: 'Processing...',
    subTitle: 'This will only take a moment',
    progressSteps,
    action: mockAction,
    isVisible: true,
  };

  it('renders title, subtitle, and progress steps', () => {
    const {getByText} = render(<ProcessingModal {...props} />);
    expect(getByText('Processing...')).toBeTruthy();
    expect(getByText('This will only take a moment')).toBeTruthy();
    expect(getByText('Step 1')).toBeTruthy();
    expect(getByText('Step 2')).toBeTruthy();
  });

  it('renders the action button', () => {
    const { getByLabelText} = render(<ProcessingModal {...props} />);

    expect(getByLabelText('Go to Home')).toBeTruthy();
  });

  it('renders with no progress steps', () => {
    const {getByText} = render(
      <ProcessingModal {...props} progressSteps={[]} />,
    );
    expect(getByText('Processing...')).toBeTruthy();
    expect(getByText('This will only take a moment')).toBeTruthy();
  });
});
