import {renderHook} from '@testing-library/react-native';

const mockAuthSend = jest.fn();

jest.mock('react-native-copilot', () => ({
  useCopilot: () => ({
    goToNext: jest.fn(),
    goToPrev: jest.fn(),
    stop: jest.fn(),
    currentStep: {order: 1, name: 'Step 1', text: 'Description 1'},
    isFirstStep: true,
    isLastStep: false,
    totalStepsNumber: 5,
    copilotEvents: {on: jest.fn(), off: jest.fn()},
  }),
}));

jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn().mockReturnValue(false),
}));

jest.mock('../machines/auth', () => ({
  AuthEvents: {
    ONBOARDING_DONE: jest.fn(() => ({type: 'ONBOARDING_DONE'})),
    INITIAL_DOWNLOAD_DONE: jest.fn(() => ({type: 'INITIAL_DOWNLOAD_DONE'})),
    SET_TOUR_GUIDE: jest.fn((set: boolean) => ({
      type: 'SET_TOUR_GUIDE',
      data: set,
    })),
  },
  selectIsInitialDownload: jest.fn(),
  selectIsOnboarding: jest.fn(),
}));

jest.mock('../shared/constants', () => ({
  COPILOT_FINAL_STEP: 6,
  KEY_MANAGEMENT_STEP: 7,
  copilotTestID: {'1': 'step1', '2': 'step2'},
  isAndroid: () => true,
}));

const React = require('react');

import {UseCopilotTooltip} from './CopilotTooltipController';

describe('UseCopilotTooltip', () => {
  beforeEach(() => {
    mockAuthSend.mockClear();
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {
        children: {get: () => ({send: mockAuthSend})},
      },
    });
  });

  it('should return properties with correct values', () => {
    const result = UseCopilotTooltip();
    expect(result.CURRENT_STEP).toBe(1);
    expect(result.isFirstStep).toBe(true);
  });

  it('ONBOARDING_DONE should send auth event', () => {
    const result = UseCopilotTooltip();
    result.ONBOARDING_DONE();
    expect(mockAuthSend).toHaveBeenCalled();
  });

  it('SET_TOUR_GUIDE should send tour guide event', () => {
    const result = UseCopilotTooltip();
    result.SET_TOUR_GUIDE(true);
    expect(mockAuthSend).toHaveBeenCalled();
  });

  it('should compute stepCount correctly', () => {
    const result = UseCopilotTooltip();
    expect(result.stepCount).toBe('1 of 5');
  });

  it('should compute titleTestID and descriptionTestID', () => {
    const result = UseCopilotTooltip();
    expect(result.titleTestID).toBe('step1Title');
    expect(result.descriptionTestID).toBe('step1Description');
  });
});
