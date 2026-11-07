import type {MdocOutcome} from '../../../machines/mdocPresentation/mdocPresentationModel';

export type OutcomeIcon =
  | 'success'
  | 'warning'
  | 'timer'
  | 'error'
  | 'bluetoothLost'
  | 'bluetoothOff'
  | 'declined'
  | 'info';

/**
 * How each outcome looks (frames 50–58, MDQ-06, 23): its icon, whether it shows tips or a
 * request summary, and which action leads. Nothing-shared failures lead with a new code.
 */
export interface OutcomeLayout {
  icon: OutcomeIcon;
  primary: 'done' | 'newCode' | 'turnOnBluetooth';
  hasTips?: boolean;
  /** Defaults to "Try this". */
  tipsTitleKey?: string;
  summary?: 'shared' | 'askedFor';
  /** Defaults to "This session has ended."; none after a share. */
  footnoteKey?: string;
}

export const OUTCOME_LAYOUTS: Record<
  Exclude<MdocOutcome, 'codeExpired'>,
  OutcomeLayout
> = {
  shared: {icon: 'success', primary: 'done', summary: 'shared'},
  sentNotConfirmed: {icon: 'warning', primary: 'done'},
  declined: {icon: 'declined', primary: 'done', summary: 'askedFor'},
  stopped: {icon: 'warning', primary: 'done'},
  sessionEnded: {icon: 'info', primary: 'newCode'},
  couldntConnect: {icon: 'bluetoothLost', primary: 'newCode', hasTips: true},
  connectionLost: {
    icon: 'bluetoothLost',
    primary: 'newCode',
    hasTips: true,
    tipsTitleKey: 'outcome.connectionLost.tipsTitle',
    footnoteKey: 'outcome.connectionLost.footnote',
  },
  interrupted: {icon: 'warning', primary: 'newCode'},
  bluetoothOff: {icon: 'bluetoothOff', primary: 'turnOnBluetooth'},
  timedOut: {
    icon: 'timer',
    primary: 'newCode',
    hasTips: true,
    tipsTitleKey: 'outcome.timedOut.tipsTitle',
  },
  verifierError: {icon: 'error', primary: 'done'},
  requestUnreadable: {icon: 'error', primary: 'newCode'},
  readerEnded: {icon: 'info', primary: 'newCode'},
  error: {icon: 'error', primary: 'done'},
};
