import type {useCountdown} from '../useCountdown';

export type EngagementStage =
  | 'showingCode'
  | 'connecting'
  | 'waitingForRequest';
export type EngagementCountdown = ReturnType<typeof useCountdown>;
