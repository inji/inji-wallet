import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {CopilotTooltip} from './CopilotTooltip';

// Mock ui components
jest.mock('./ui', () => {
  const {TouchableOpacity} = require('react-native');
  return {
    Button: ({testID, onPress}: any) => (
      <TouchableOpacity testID={testID} onPress={onPress} />
    ),
    Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Row: ({children}: {children: React.ReactNode}) => <>{children}</>,
    Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
  };
});

// Mock controller
const defaultCopilotValues = {
  copilotEvents: {
    on: jest.fn(),
  },
  SET_TOUR_GUIDE: jest.fn(),
  ONBOARDING_DONE: jest.fn(),
  INITIAL_DOWNLOAD_DONE: jest.fn(),
  CURRENT_STEP: 1,
  currentStepTitle: 'Step 1 Title',
  currentStepDescription: 'Step 1 Description',
  titleTestID: 'stepTitle',
  descriptionTestID: 'stepDescription',
  stepCount: '1/5',
  isFirstStep: true,
  isLastStep: false,
  isFinalStep: false,
  isOnboarding: true,
  isInitialDownloading: false,
  goToPrev: jest.fn(),
  goToNext: jest.fn(),
  stop: jest.fn(),
};

let mockCopilotOverrides: any = {};

jest.mock('./CopilotTooltipController', () => ({
  UseCopilotTooltip: jest.fn(() => ({
    ...defaultCopilotValues,
    ...mockCopilotOverrides,
  })),
}));

// Mock settings controller
jest.mock('../screens/Settings/SettingScreenController', () => ({
  useSettingsScreen: jest.fn(() => ({
    BACK: jest.fn(),
  })),
}));

describe('CopilotTooltip Component', () => {
  beforeEach(() => {
    mockCopilotOverrides = {};
    jest.clearAllMocks();
  });

  it('should match snapshot with first step', () => {
    const {toJSON} = render(<CopilotTooltip />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render middle step with previous button', () => {
    mockCopilotOverrides = {
      CURRENT_STEP: 3,
      isFirstStep: false,
      isLastStep: false,
      stepCount: '3/5',
      currentStepTitle: 'Step 3 Title',
      currentStepDescription: 'Step 3 Description',
    };
    const {toJSON} = render(<CopilotTooltip />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render last step with Done button', () => {
    mockCopilotOverrides = {
      CURRENT_STEP: 5,
      isFirstStep: false,
      isLastStep: true,
      stepCount: '5/5',
      currentStepTitle: 'Last Step',
      currentStepDescription: 'Done!',
    };
    const {toJSON} = render(<CopilotTooltip />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render final step with initial downloading', () => {
    mockCopilotOverrides = {
      CURRENT_STEP: 5,
      isFinalStep: true,
      isInitialDownloading: true,
      isFirstStep: false,
      isLastStep: false,
      stepCount: '1 of 1',
    };
    const {toJSON} = render(<CopilotTooltip />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should call goToNext when next button is pressed', () => {
    const {getByTestId} = render(<CopilotTooltip />);
    fireEvent.press(getByTestId('copilot-next-action'));
    expect(defaultCopilotValues.goToNext).toHaveBeenCalled();
  });

  it('should call stop when done button is pressed on last step', () => {
    mockCopilotOverrides = {isLastStep: true, isFirstStep: false};
    const {getByTestId} = render(<CopilotTooltip />);
    fireEvent.press(getByTestId('copilot-next-action'));
    expect(defaultCopilotValues.stop).toHaveBeenCalled();
  });

  it('should call goToPrev when previous button is pressed', () => {
    mockCopilotOverrides = {isFirstStep: false, CURRENT_STEP: 3};
    const {getByTestId} = render(<CopilotTooltip />);
    fireEvent.press(getByTestId('copilot-prev-action'));
    expect(defaultCopilotValues.goToPrev).toHaveBeenCalled();
  });
});
