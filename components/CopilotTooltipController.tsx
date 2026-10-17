import {useCopilot} from 'react-native-copilot';
import {COPILOT_FINAL_STEP, KEY_MANAGEMENT_STEP} from '../shared/constants';
import {useContext} from 'react';
import {GlobalContext} from '../shared/GlobalContext';
import {
  AuthEvents,
  selectIsInitialDownload,
  selectIsOnboarding,
} from '../machines/auth';
import {useSelector} from '@xstate/react';
import {copilotTestID} from '../shared/constants';

export const UseCopilotTooltip = () => {
  const {
    goToNext,
    goToPrev,
    stop,
    currentStep,
    currentStepNumber,
    isFirstStep,
    isLastStep,
    totalStepsNumber,
    copilotEvents,
  } = useCopilot();

  const {appService} = useContext(GlobalContext);
  const authService = appService.children.get('auth');
  const ONBOARDING_DONE = () => authService?.send(AuthEvents.ONBOARDING_DONE());
  const INITIAL_DOWNLOAD_DONE = () =>
    authService?.send(AuthEvents.INITIAL_DOWNLOAD_DONE());
  const SET_TOUR_GUIDE = set =>
    authService?.send(AuthEvents.SET_TOUR_GUIDE(set));
  const isOnboarding = useSelector(authService, selectIsOnboarding);
  const isInitialDownloading = useSelector(
    authService,
    selectIsInitialDownload,
  );

  const CURRENT_STEP = currentStep?.order;
  const currentStepTitle = currentStep?.name;
  const currentStepDescription = currentStep?.text;
  const titleTestID = `${copilotTestID[CURRENT_STEP?.toString()]}Title`;
  const descriptionTestID = `${
    copilotTestID[CURRENT_STEP?.toString()]
  }Description`;

  // A step shown on its own rather than as part of the tour.
  const isStandalone =
    (CURRENT_STEP === COPILOT_FINAL_STEP && isInitialDownloading) ||
    CURRENT_STEP === KEY_MANAGEMENT_STEP;

  // The step's position among the steps on screen, not its `order`: orders can have
  // gaps (a step whose element isn't rendered), which made the counter skip numbers
  // and run past the total. The library can report no step between steps, hence `?? 1`.
  const stepNumber = isStandalone ? 1 : currentStepNumber ?? 1;
  const stepTotal = isStandalone ? 1 : totalStepsNumber ?? 1;
  const stepCount = stepNumber + ' of ' + stepTotal;

  const isFinalStep = CURRENT_STEP === COPILOT_FINAL_STEP;

  // A standalone step has nothing to go back to.
  const showPrevious = !(isFirstStep || isStandalone);
  // The step whose primary button ends the tour ("Done") instead of moving on ("Next").
  const isDoneStep = isLastStep || CURRENT_STEP === KEY_MANAGEMENT_STEP;

  return {
    goToNext,
    goToPrev,
    stop,
    CURRENT_STEP,
    currentStepNumber,
    currentStepTitle,
    currentStepDescription,
    isFirstStep,
    isLastStep,
    isFinalStep,
    totalStepsNumber,
    copilotEvents,
    stepCount,
    stepNumber,
    stepTotal,
    isStandalone,
    showPrevious,
    isDoneStep,
    isOnboarding,
    isInitialDownloading,
    titleTestID,
    descriptionTestID,
    INITIAL_DOWNLOAD_DONE,
    ONBOARDING_DONE,
    SET_TOUR_GUIDE,
  };
};
