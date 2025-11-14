import React from 'react';
import {render} from '@testing-library/react-native';
import {CopilotTooltip} from './CopilotTooltip';

// Mock ui components
jest.mock('./ui', () => ({
  Button: jest.fn(() => null),
  Column: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Row: ({children}: {children: React.ReactNode}) => <>{children}</>,
  Text: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

// Mock controller
jest.mock('./CopilotTooltipController', () => ({
  UseCopilotTooltip: jest.fn(() => ({
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
  })),
}));

// Mock settings controller
jest.mock('../screens/Settings/SettingScreenController', () => ({
  useSettingsScreen: jest.fn(() => ({
    BACK: jest.fn(),
  })),
}));

describe('CopilotTooltip Component', () => {
  it('should match snapshot with first step', () => {
    const {toJSON} = render(<CopilotTooltip />);
    expect(toJSON()).toMatchSnapshot();
  });
});
