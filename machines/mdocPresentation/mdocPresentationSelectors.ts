import type {StateFrom} from 'xstate';
import type {createMdocPresentationMachine} from './mdocPresentationMachine';
import {hasCompleteSelection} from './mdocPresentationGuards';

type State = StateFrom<ReturnType<typeof createMdocPresentationMachine>>;
export const selectMdocQrText = (state: State) => state.context.qrText;
export const selectMdocCodeExpiresAt = (state: State) =>
  state.context.codeExpiresAt;
export const selectMdocRequest = (state: State) => state.context.request;
export const selectMdocMatches = (state: State) => state.context.matches;
export const selectMdocSelection = (state: State) => state.context.selection;
export const selectMdocOutcome = (state: State) => state.context.outcome;
export const selectMdocError = (state: State) => state.context.error;
export const selectCanShareMdoc = (state: State) =>
  state.matches('presenting.reviewingRequest') &&
  hasCompleteSelection(state.context);
