import React from 'react';
import '@testing-library/jest-native/extend-expect';
import {Animated, AppState, Platform, View} from 'react-native';
import {interpret} from 'xstate';
import {
  act,
  fireEvent,
  render,
  renderHook,
  within,
} from '@testing-library/react-native';
import {ShareNearbyEntry} from './entry/ShareNearbyEntry';
import {MdocEngagement} from './engagement/MdocEngagement';
import {MdocRequestReview} from './request/MdocRequestReview';
import {MdocOutcomeView} from './outcome/MdocOutcomeView';
import {useMdocOutcome} from './outcome/MdocOutcomeController';
import {matchRequest} from '../../shared/mdocPresentation/matching';
import type {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import type {MdocRequest} from '../../shared/mdocPresentation/types';
import type {MdocPresentationRef} from '../../machines/mdocPresentation/mdocPresentationMachine';
import type {
  MdocPresentationHandlers,
  MdocResult,
} from '../../shared/mdocPresentation/types';
import {createMdocPresentationMachine} from '../../machines/mdocPresentation/mdocPresentationMachine';
import {ShareScreen} from './ShareScreen';
import {useShareScreen} from './ShareScreenController';
import {useMdocPresentationScreen} from './MdocPresentationScreenController';

// Native animation frames need a mounted native view; countdown behavior uses JS timers.
beforeEach(() => {
  jest.spyOn(Animated, 'timing').mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  });
});
afterAll(() => jest.restoreAllMocks());

jest.mock('./ShareScreenController', () => ({useShareScreen: jest.fn()}));
jest.mock('../Scan/ScanScreen', () => ({
  ScanScreen: () => <View testID="scanner" />,
}));

jest.mock('../../shared/mdocPresentation/MdocPresentation', () => ({
  MdocPresentation: {present: jest.fn(), cancel: jest.fn()},
}));
jest.mock('../VerifyIdentityOverlay', () => ({
  VerifyIdentityOverlay: () => null,
}));
jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    SuccessLogo: () => <View testID="successIcon" />,
    ErrorLogo: () => <View testID="errorIcon" />,
    questionIcon: () => <View testID="helpIcon" />,
    selectedCheckBox: () => <View testID="selectedCheckboxIcon" />,
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: jest.requireActual('react-native').View,
  SafeAreaProvider: jest.requireActual('react-native').View,
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));
jest.mock(
  'react-native-qrcode-svg',
  () =>
    function MockQrCode({value, size}: {value: string; size: number}) {
      return (
        <View
          testID="generatedQr"
          accessibilityLabel={value}
          style={{width: size, height: size}}
        />
      );
    },
);
jest.mock('../../assets/shareNearby/offline.svg', () => 'Offline');
jest.mock('../../assets/shareNearby/qr.svg', () => 'Qr');
jest.mock('../../assets/shareNearby/id-badge.svg', () => 'IdBadge');
jest.mock(
  '../../assets/shareNearby/bluetooth-badge.svg',
  () => 'BluetoothBadge',
);
jest.mock('../../assets/shareNearby/chevron.svg', () => 'Chevron');
jest.mock('../../assets/shareNearby/back.svg', () => 'Back');
jest.mock('../../assets/shareNearby/question.svg', () => 'Question');
jest.mock('../../assets/shareNearby/clock.svg', () => 'Clock');
jest.mock('../../assets/shareNearby/bluetooth.svg', () => 'Bluetooth');
jest.mock('../../assets/shareNearby/lock.svg', () => 'Lock');
jest.mock('../../assets/shareNearby/check.svg', () => 'Check');
jest.mock('../../assets/shareNearby/copy.svg', () => 'Copy');
jest.mock('../../assets/shareNearby/verified.svg', () => 'Verified');

const namespace = 'org.iso.18013.5.1';
const docType = `${namespace}.mDL`;
const request: MdocRequest = {
  requestNumber: 1,
  documents: [
    {
      docType,
      nameSpaces: {[namespace]: {given_name: true}},
      readerTrust: {status: 'unverified', readerName: 'Reader'},
    },
  ],
};
function credential(id: string, expired = false): VC {
  return {
    vcMetadata: {
      id,
      format: 'mso_mdoc',
      isExpired: expired,
      isRevoked: 'FALSE',
      credentialType: `Card ${id}`,
    },
    verifiableCredential: {
      credential: 'entire-mdoc',
      processedCredential: {
        issuerAuth: [{}, {}, {docType}],
        nameSpaces: {
          [namespace]: [
            {elementIdentifier: 'given_name', elementValue: 'Kiran'},
          ],
        },
      },
    },
  } as VC;
}

beforeEach(() => {
  jest
    .spyOn(React, 'useState')
    .mockImplementation(jest.requireActual('react').useState);
  jest
    .spyOn(React, 'useEffect')
    .mockImplementation(jest.requireActual('react').useEffect);
});

describe('Share nearby entry', () => {
  it('starts only when the holder chooses the mobile ID option', () => {
    const onPresent = jest.fn();
    const screen = render(
      <ShareNearbyEntry
        hasEndedWithoutSharing={false}
        onDismissSessionEnded={jest.fn()}
        hasMdocCredential
        onPresent={onPresent}
        onReceive={jest.fn()}
        onHelp={jest.fn()}
      />,
    );
    expect(onPresent).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('presentMdoc'));
    expect(onPresent).toHaveBeenCalledTimes(1);
  });

  it('does not start a session without an mdoc', () => {
    const onPresent = jest.fn();
    const screen = render(
      <ShareNearbyEntry
        hasEndedWithoutSharing={false}
        onDismissSessionEnded={jest.fn()}
        hasMdocCredential={false}
        onPresent={onPresent}
        onReceive={jest.fn()}
        onHelp={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByTestId('presentMdoc'));
    expect(onPresent).not.toHaveBeenCalled();
    expect(screen.getByText('entry.noMdoc')).toBeOnTheScreen();
  });

  const renderEntryOn = (
    platform: 'ios' | 'android',
    onReceive = jest.fn(),
  ) => {
    const original = Platform.OS;
    Platform.OS = platform;
    const screen = render(
      <ShareNearbyEntry
        hasEndedWithoutSharing={false}
        onDismissSessionEnded={jest.fn()}
        hasMdocCredential
        onPresent={jest.fn()}
        onReceive={onReceive}
        onHelp={jest.fn()}
      />,
    );
    Platform.OS = original;
    return screen;
  };

  it('shows the Bluetooth QR code option greyed out on iOS, where it is not available yet', () => {
    const onReceive = jest.fn();
    const screen = renderEntryOn('ios', onReceive);

    fireEvent.press(screen.getByTestId('receiveBluetooth'));

    expect(screen.getByTestId('receiveBluetooth')).toHaveAccessibilityState({
      disabled: true,
    });
    expect(screen.getByText('entry.bleUnavailable')).toBeOnTheScreen();
    expect(onReceive).not.toHaveBeenCalled();
  });

  it('lets the holder use the Bluetooth QR code option on Android', () => {
    const onReceive = jest.fn();
    const screen = renderEntryOn('android', onReceive);

    fireEvent.press(screen.getByTestId('receiveBluetooth'));

    expect(onReceive).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('entry.bleUnavailable')).not.toBeOnTheScreen();
  });

  it('tells the holder nothing was shared when they come back from an ended session and lets them close the notice', () => {
    const onDismissSessionEnded = jest.fn();
    const screen = render(
      <ShareNearbyEntry
        hasEndedWithoutSharing
        onDismissSessionEnded={onDismissSessionEnded}
        hasMdocCredential
        onPresent={jest.fn()}
        onReceive={jest.fn()}
        onHelp={jest.fn()}
      />,
    );

    expect(screen.getByText('entry.sessionEnded')).toBeOnTheScreen();
    fireEvent.press(screen.getByLabelText('close'));

    expect(onDismissSessionEnded).toHaveBeenCalledTimes(1);
  });

  it('opens the code comparison from the inline link after the hint', () => {
    const onHelp = jest.fn();
    const screen = render(
      <ShareNearbyEntry
        hasEndedWithoutSharing={false}
        onDismissSessionEnded={jest.fn()}
        hasMdocCredential
        onPresent={jest.fn()}
        onReceive={jest.fn()}
        onHelp={onHelp}
      />,
    );

    fireEvent.press(screen.getByText('entry.compare'));

    expect(onHelp).toHaveBeenCalledTimes(1);
  });
});

describe('Live mdoc engagement', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1000);
  });
  afterEach(() => jest.useRealTimers());

  it('encodes the native engagement payload and sizes it to a narrow container', () => {
    const screen = render(
      <MdocEngagement
        qrText="mdoc:live-payload"
        expiresAt={301000}
        stage="showingCode"
        onCancel={jest.fn()}
        onHelp={jest.fn()}
      />,
    );
    fireEvent(screen.getByTestId('mdocQrContainer'), 'layout', {
      nativeEvent: {layout: {width: 220}},
    });
    expect(screen.getByTestId('generatedQr')).toHaveProp(
      'accessibilityLabel',
      'mdoc:live-payload',
    );
    expect(screen.getByTestId('generatedQr')).toHaveStyle({
      width: 180,
      height: 180,
    });
  });

  it('hides an expired QR while waiting for native to end the session', () => {
    const screen = render(
      <MdocEngagement
        qrText="mdoc:expired"
        expiresAt={2000}
        stage="showingCode"
        onCancel={jest.fn()}
        onHelp={jest.fn()}
      />,
    );
    fireEvent(screen.getByTestId('mdocQrContainer'), 'layout', {
      nativeEvent: {layout: {width: 335}},
    });
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.queryByTestId('generatedQr')).toBeNull();
    screen.unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});

function shareController(): ReturnType<typeof useShareScreen> {
  return {
    presentationController: undefined,
    mdocPresentationActor: undefined,
    isShowingMdocReadiness: false,
    readinessController: {
      isAnotherShareActive: false,
      readinessIssue: undefined,
      shouldOfferSettings: false,
      shouldRequestLocationConsent: false,
      isCheckingReadiness: true,
      CANCEL: jest.fn(),
      RETRY: jest.fn(),
      CONTINUE: jest.fn(),
      TURN_ON_BLUETOOTH: jest.fn(),
      OPEN_SETTINGS: jest.fn(),
    },
    hasMdocCredential: true,
    hasEndedWithoutSharing: false,
    isShowingBluetoothSheet: false,
    selectedTab: 'scan',
    isHelpVisible: false,
    SELECT_TAB: jest.fn(),
    OPEN_HELP: jest.fn(),
    CLOSE_HELP: jest.fn(),
    DISMISS_SESSION_ENDED: jest.fn(),
    PRESENT_MDOC: jest.fn(),
    RECEIVE_CARD: jest.fn(),
    GOTO_HOME: jest.fn(),
  };
}

describe('Presentation screen and actor', () => {
  const actors: {stop(): unknown}[] = [];
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    actors.splice(0).forEach(actor => actor.stop());
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
  function finishConnectionPhases() {
    act(() => jest.advanceTimersByTime(2000));
    act(() => jest.advanceTimersByTime(2000));
  }
  function start() {
    let callbacks!: MdocPresentationHandlers;
    let finish!: (result: MdocResult) => void;
    const cancel = jest.fn();
    const actor = interpret(
      createMdocPresentationMachine({
        present: (_options, handlers) => {
          callbacks = handlers;
          return new Promise(resolve => {
            finish = resolve;
          });
        },
        cancel,
        getCredentials: () => [credential('one')],
        prepareMdocForSharing: async () => 'filtered',
      }),
    ).start();
    actors.push(actor);
    return {
      actor,
      cancel,
      finish: (result: MdocResult) => finish(result),
      callbacks,
    };
  }

  function renderPresentation(
    flow: ReturnType<typeof start>,
    getActor: () => MdocPresentationRef | undefined = () => flow.actor,
    onScanInstead: () => void = jest.fn(),
    onDone: () => void = jest.fn(),
  ) {
    jest
      .mocked(useShareScreen)
      .mockImplementation(function usePresentationShare() {
        return {
          ...shareController(),
          mdocPresentationActor: getActor(),
          presentationController: useMdocPresentationScreen(
            getActor(),
            onDone,
            onScanInstead,
            jest.fn(),
          ),
        };
      });
    return render(<ShareScreen />);
  }

  it('shows how long the session lasts once the verifier connects', () => {
    const flow = start();
    const screen = renderPresentation(flow);

    act(() => flow.callbacks.onProgress('connected'));
    act(() => jest.advanceTimersByTime(2000));

    expect(screen.getByTestId('mdocSessionCountdown')).toBeOnTheScreen();
  });

  it('lets the holder end the session while waiting for the verifier request', () => {
    const flow = start();
    const screen = renderPresentation(flow);
    act(() => flow.callbacks.onProgress('connected'));
    act(() => jest.advanceTimersByTime(2000));

    fireEvent.press(screen.getByText('engagement.endSession'));

    expect(flow.cancel).toHaveBeenCalledTimes(1);
  });

  it('shows the progress steps while connecting and leaves them off the request review', () => {
    const flow = start();
    const screen = renderPresentation(flow);
    act(() => {
      void flow.callbacks.onRequest(request);
    });
    expect(screen.getByText('engagement.connecting.title')).toBeOnTheScreen();
    expect(screen.queryByTestId('shareMdoc')).toBeNull();
    act(() => jest.advanceTimersByTime(2000));
    expect(
      screen.getByText('engagement.waitingForRequest.title'),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('shareMdoc')).toBeNull();
    act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByTestId('shareMdoc')).toBeOnTheScreen();
    expect(screen.queryByLabelText('engagement.step.sharing')).toBeNull();
    expect(flow.cancel).not.toHaveBeenCalled();
  });

  it('requires stop confirmation and waits for native cleanup before offering another code', async () => {
    const flow = start();
    const screen = renderPresentation(flow);
    act(() => {
      void flow.callbacks.onRequest(request);
    });
    finishConnectionPhases();
    fireEvent.press(screen.getByTestId('shareMdoc'));
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.press(screen.getByLabelText('back'));
    expect(flow.cancel).not.toHaveBeenCalled();
    expect(screen.getByText('sending.stopTitle')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('confirmStopMdoc'));
    expect(flow.cancel).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('newCode')).toBeNull();
    await act(async () => {
      flow.finish({status: 'cancelled'});
      await Promise.resolve();
    });
    expect(screen.getByText('outcome.stopped.title')).toBeOnTheScreen();
    expect(screen.getByText('newCode')).toBeOnTheScreen();
  });

  it('shows an indeterminate transfer bar for at least one second before success', async () => {
    const flow = start();
    const screen = renderPresentation(flow);
    act(() => {
      void flow.callbacks.onRequest(request);
    });
    finishConnectionPhases();
    fireEvent.press(screen.getByTestId('shareMdoc'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole('progressbar')).toHaveProp('accessibilityState', {
      busy: true,
    });
    expect(
      screen.getByRole('progressbar').props.accessibilityValue,
    ).toBeUndefined();
    await act(async () => {
      flow.finish({status: 'completed', confirmedByReader: true});
      await Promise.resolve();
    });
    act(() => jest.advanceTimersByTime(999));
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(screen.queryByText('outcome.shared.title')).toBeNull();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByText('outcome.shared.title')).toBeOnTheScreen();
  });

  it('opens privacy from the top question icon and links to retention help', () => {
    const flow = start();
    const screen = renderPresentation(flow);
    act(() => {
      void flow.callbacks.onRequest(request);
    });
    finishConnectionPhases();
    fireEvent.press(screen.getByLabelText('help'));
    expect(screen.getByText('helpContent.privacyTitle')).toBeOnTheScreen();
    expect(
      screen.getByText('helpContent.privacyDescription'),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByText('request.retentionHelp'));
    expect(screen.getByText('requestHelp.retentionAction')).toBeOnTheScreen();
    expect(screen.queryByText('helpContent.privacyTitle')).toBeNull();
    fireEvent.press(screen.getByLabelText('close'));
    expect(flow.cancel).not.toHaveBeenCalled();
    expect(screen.queryByText('requestHelp.retentionAction')).toBeNull();
    expect(flow.actor.state.matches('presenting.reviewingRequest')).toBe(true);
  });

  it.each(['verified', 'unverified', 'notSigned', 'invalid'] as const)(
    'shows %s verifier details and links to the identity explanation',
    status => {
      const flow = start();
      const screen = renderPresentation(flow);
      act(() => {
        void flow.callbacks.onRequest({
          ...request,
          documents: [
            {
              ...request.documents[0],
              readerTrust: {status, readerName: 'Reader'},
            },
          ],
        });
      });
      finishConnectionPhases();
      // verified readers show a details row; the others show a warning card (frames 28, 29)
      fireEvent.press(
        screen.getByLabelText(
          status === 'verified'
            ? 'request.verifierDetails'
            : `request.trustCard.${
                status === 'invalid' ? 'invalid' : 'unverified'
              }.title`,
        ),
      );
      expect(
        screen.getByText(`request.trustDescription.${status}`),
      ).toBeOnTheScreen();
      // the sheet's link is the last "Learn more"; non-verified cards have one too
      const learnMoreLinks = screen.getAllByText('requestHelp.learnMore');
      fireEvent.press(learnMoreLinks[learnMoreLinks.length - 1]);
      expect(screen.getByText('requestHelp.identityIntro')).toBeOnTheScreen();
      expect(
        screen.getByText('requestHelp.identityDescription.invalid'),
      ).toBeOnTheScreen();
      fireEvent.press(screen.getByText('requestHelp.gotIt'));
      expect(screen.queryByText('requestHelp.identityIntro')).toBeNull();
      expect(flow.actor.state.matches('presenting.reviewingRequest')).toBe(
        true,
      );
    },
  );

  it('titles the code screen as the mobile ID QR code, as in MDQ-01', () => {
    const flow = start();

    const screen = renderPresentation(flow);

    expect(screen.getByText('entry.mdocTitle')).toBeOnTheScreen();
  });

  it('opens the scan help from the header question mark on the code screen', () => {
    const flow = start();
    const screen = renderPresentation(flow);

    fireEvent.press(screen.getByLabelText('help'));

    expect(screen.getByText('helpContent.scanReadableTitle')).toBeOnTheScreen();
  });

  it('opens the scan help from its dedicated link', () => {
    const flow = start();
    const screen = renderPresentation(flow);

    fireEvent.press(screen.getByText('engagement.scanHelp'));

    expect(screen.getByText('helpContent.scanReadableTitle')).toBeOnTheScreen();
  });

  it('ends the session and switches to scanning when the holder chooses to scan the verifier code instead', async () => {
    const flow = start();
    const onScanInstead = jest.fn();
    const screen = renderPresentation(flow, () => flow.actor, onScanInstead);
    fireEvent.press(screen.getByText('engagement.scanHelp'));

    fireEvent.press(screen.getByText('helpContent.scanInstead'));

    expect(flow.cancel).toHaveBeenCalledTimes(1);
    expect(onScanInstead).toHaveBeenCalledTimes(1);
  });

  it('shows an expired placeholder instead of the old code when no reader connected in time', async () => {
    const flow = start();
    const screen = renderPresentation(flow);

    await act(async () => {
      flow.finish({status: 'failed', failure: 'noReaderFound'});
    });

    expect(screen.getByText('outcome.codeExpired.title')).toBeOnTheScreen();
    expect(screen.getByTestId('mdocExpiredQr')).toBeOnTheScreen();
    expect(screen.queryByTestId('mdocQr')).toBeNull();
  });

  it('returns to Share nearby rather than Home when the holder cancels an expired code', async () => {
    const flow = start();
    const goHome = jest.fn();
    const screen = renderPresentation(
      flow,
      () => flow.actor,
      jest.fn(),
      goHome,
    );
    await act(async () => {
      flow.finish({status: 'failed', failure: 'noReaderFound'});
    });

    fireEvent.press(screen.getByText('cancel'));

    expect(flow.actor.getSnapshot().done).toBe(true);
    expect(goHome).not.toHaveBeenCalled();
  });

  it('offers a new code first and says the session has ended when the phones could not connect', async () => {
    const flow = start();
    const screen = renderPresentation(flow);

    await act(async () => {
      flow.finish({status: 'failed', failure: 'connectionFailed'});
    });

    expect(screen.getByText('outcome.sessionHasEnded')).toBeOnTheScreen();
    expect(screen.getByText('newCode')).toBeOnTheScreen();
  });

  it('removes presentation listeners when returning to the entry screen', () => {
    const subscription = jest.spyOn(AppState, 'addEventListener');
    subscription.mockClear();
    const flow = start();
    let activeActor: MdocPresentationRef | undefined = flow.actor;
    const screen = renderPresentation(flow, () => activeActor);
    const remove = jest.spyOn(subscription.mock.results[0].value, 'remove');
    activeActor = undefined;
    screen.rerender(<ShareScreen />);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('scanner')).toBeOnTheScreen();
    expect(screen.queryByLabelText('back')).toBeNull();
  });

  it('cancels when backgrounded and tolerates transient permission prompts', () => {
    const subscription = jest.spyOn(AppState, 'addEventListener');
    subscription.mockClear();
    const flow = start();
    renderPresentation(flow);
    const onChange = subscription.mock.calls[0][1];
    act(() => onChange('inactive'));
    expect(flow.cancel).not.toHaveBeenCalled();
    act(() => onChange('background'));
    expect(flow.cancel).toHaveBeenCalledTimes(1);
  });
});

describe('Shared screen shell', () => {
  it('renders readiness inside the same shell and routes header Back to its controller', () => {
    const controller = shareController();
    controller.isShowingMdocReadiness = true;
    jest.mocked(useShareScreen).mockReturnValue(controller);
    const screen = render(<ShareScreen />);
    expect(screen.queryByTestId('scanner')).toBeNull();
    expect(screen.queryByRole('tablist')).toBeNull();
    fireEvent.press(screen.getByLabelText('back'));
    expect(controller.readinessController.CANCEL).toHaveBeenCalledTimes(1);
  });

  it('explains Bluetooth is off in a sheet over Share nearby and asks Android only when the holder taps', () => {
    const original = Platform.OS;
    Platform.OS = 'android';
    const controller = {
      ...shareController(),
      selectedTab: 'nearby' as const,
      isShowingBluetoothSheet: true,
    };
    jest.mocked(useShareScreen).mockReturnValue(controller);
    const screen = render(<ShareScreen />);

    expect(screen.getByTestId('presentMdoc')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('turnOnBluetooth'));

    expect(
      controller.readinessController.TURN_ON_BLUETOOTH,
    ).toHaveBeenCalledTimes(1);
    Platform.OS = original;
  });

  it('preserves entry tab actions and mounts the scanner only on the Scan QR tab', () => {
    const controller = shareController();
    jest.mocked(useShareScreen).mockReturnValue(controller);
    const screen = render(<ShareScreen />);
    expect(screen.getByTestId('scanner')).toBeOnTheScreen();
    fireEvent.press(screen.getAllByRole('tab')[1]);
    expect(controller.SELECT_TAB).toHaveBeenCalledWith('nearby');
    jest
      .mocked(useShareScreen)
      .mockReturnValue({...controller, selectedTab: 'nearby'});
    screen.rerender(<ShareScreen />);
    expect(screen.queryByTestId('scanner')).toBeNull();
    fireEvent.press(screen.getByTestId('presentMdoc'));
    expect(controller.PRESENT_MDOC).toHaveBeenCalledTimes(1);
  });
});

describe('Complete-request consent', () => {
  const props = {
    selection: {} as Record<string, string>,
    checkedFields: {[docType]: [JSON.stringify([namespace, 'given_name'])]},
    canShareSelectedCards: false,
    canShareWithSelfieVerification: false,
    hasPreparationFailed: false,
    onOpenVerifierDetails: jest.fn(),
    onOpenRetentionHelp: jest.fn(),
    onOpenIdentityHelp: jest.fn(),
    onSelectCard: jest.fn(),
    onToggleRequestedField: jest.fn(),
    onShareSelectedCards: jest.fn(),
    onVerifyAndShare: jest.fn(),
    onDeclineRequest: jest.fn(),
    onRetryPreparation: jest.fn(),
  };
  beforeEach(() => jest.clearAllMocks());

  it('keeps Share disabled and asks the holder to choose a card first', () => {
    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(request, [credential('one'), credential('two')])}
      />,
    );

    fireEvent.press(screen.getByTestId('shareMdoc'));
    fireEvent.press(screen.getAllByRole('radio')[1]);

    expect(props.onShareSelectedCards).not.toHaveBeenCalled();
    expect(screen.getByText('request.chooseCardFirst')).toBeOnTheScreen();
    expect(screen.getByText('request.shareNothing')).toBeOnTheScreen();
    expect(props.onSelectCard).toHaveBeenCalledWith(docType, 'two');
  });

  it("doesn't show any card's details before the holder chooses one", () => {
    // the first card in the list must not stand in for a choice the holder hasn't made
    const withMissingDetail: MdocRequest = {
      ...request,
      documents: [
        {
          ...request.documents[0],
          nameSpaces: {[namespace]: {given_name: true, blood_type: false}},
        },
      ],
    };

    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(withMissingDetail, [
          credential('one'),
          credential('two'),
        ])}
      />,
    );

    expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
    expect(screen.queryByText('request.notOnCard')).not.toBeOnTheScreen();
    expect(screen.queryByText('request.retained')).not.toBeOnTheScreen();
  });

  it('lists requested details missing from the card and offers ticks only for the ones it holds', () => {
    // design frame 31: the reader asks for blood_type, which the card does not hold
    const withMissingDetail: MdocRequest = {
      ...request,
      documents: [
        {
          ...request.documents[0],
          nameSpaces: {[namespace]: {given_name: true, blood_type: false}},
        },
      ],
    };

    const screen = render(
      <MdocRequestReview
        {...props}
        selection={{[docType]: 'one'}}
        matches={matchRequest(withMissingDetail, [credential('one')])}
      />,
    );

    expect(screen.getByText('request.notOnCard')).toBeOnTheScreen();
    expect(screen.getByText('Blood type')).toBeOnTheScreen();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  });

  it('names each card choice by the issuer display name instead of the issuer URL', () => {
    // offer downloads store the credential_issuer URL as the card's issuer
    const fromOffer = (id: string, issuerName: string) => {
      const card = credential(id);
      card.vcMetadata.issuer = 'https://agent.example.org/oid4vci/1234';
      // stored as the parsed issuer metadata object, not a JSON string
      (card.verifiableCredential as any).wellKnown = {
        display: [{name: issuerName}],
      };
      return card;
    };

    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(request, [
          fromOffer('one', 'Demo Transport Office'),
          fromOffer('two', 'City Licensing'),
        ])}
      />,
    );

    expect(screen.getByText('Demo Transport Office')).toBeOnTheScreen();
    expect(screen.getByText('City Licensing')).toBeOnTheScreen();
    expect(
      screen.queryByText('https://agent.example.org/oid4vci/1234'),
    ).not.toBeOnTheScreen();
  });

  it('tints only the selected card choice, as in design frame 26', () => {
    const screen = render(
      <MdocRequestReview
        {...props}
        selection={{[docType]: 'one'}}
        matches={matchRequest(request, [credential('one'), credential('two')])}
      />,
    );

    const [selectedChoice, otherChoice] = screen.getAllByRole('radio');
    expect(selectedChoice).toHaveStyle({backgroundColor: '#FCF0F7'});
    expect(otherChoice).not.toHaveStyle({backgroundColor: '#FCF0F7'});
  });

  it('shows each card choice with its issuer logo', () => {
    const withLogo = (id: string) => {
      const card = credential(id);
      (card.verifiableCredential as any).issuerLogo = {
        url: `https://logos.example.org/${id}.png`,
      };
      return card;
    };

    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(request, [withLogo('one'), withLogo('two')])}
      />,
    );

    const choiceLogos = screen
      .getAllByRole('radio')
      .map(choice => within(choice).queryByTestId('issuerLogo'));
    expect(choiceLogos.every(Boolean)).toBe(true);
  });

  it('names a card choice by its issuer host when the issuer has no display name', () => {
    const withoutName = credential('one');
    withoutName.vcMetadata.issuer = 'https://agent.example.org/oid4vci/1234';

    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(request, [withoutName, credential('two')])}
      />,
    );

    expect(screen.getByText('agent.example.org')).toBeOnTheScreen();
    expect(
      screen.queryByText('https://agent.example.org/oid4vci/1234'),
    ).not.toBeOnTheScreen();
  });

  it('names a card choice by its catalog issuer id when the issuer has no display name', () => {
    const fromCatalog = credential('one');
    fromCatalog.vcMetadata.issuer = 'MockMdl';

    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(request, [fromCatalog, credential('two')])}
      />,
    );

    expect(screen.getByText('MockMdl')).toBeOnTheScreen();
  });

  describe('long lists (frame 32)', () => {
    const sixDetails = [
      'family_name',
      'given_name',
      'birth_date',
      'issue_date',
      'expiry_date',
      'document_number',
    ];
    const longRequest: MdocRequest = {
      ...request,
      documents: [
        {
          ...request.documents[0],
          nameSpaces: {
            [namespace]: Object.fromEntries(sixDetails.map(d => [d, false])),
          },
        },
      ],
    };
    const cardWithSixDetails = () => {
      const card = credential('one');
      (card.verifiableCredential as any).processedCredential.nameSpaces[
        namespace
      ] = sixDetails.map(d => ({elementIdentifier: d, elementValue: 'x'}));
      return card;
    };

    it('lets the holder select or clear every detail of a long list at once', () => {
      const onSelectAllFields = jest.fn();
      const onClearAllFields = jest.fn();
      const screen = render(
        <MdocRequestReview
          {...props}
          selection={{[docType]: 'one'}}
          onSelectAllFields={onSelectAllFields}
          onClearAllFields={onClearAllFields}
          matches={matchRequest(longRequest, [cardWithSixDetails()])}
        />,
      );

      expect(screen.getByText('request.detailsRequested')).toBeOnTheScreen();
      fireEvent.press(screen.getByText('request.selectAll'));
      fireEvent.press(screen.getByText('request.clearAll'));

      expect(onSelectAllFields).toHaveBeenCalledWith(docType);
      expect(onClearAllFields).toHaveBeenCalledWith(docType);
    });

    it('leaves out select all and clear all for a short list', () => {
      const screen = render(
        <MdocRequestReview
          {...props}
          selection={{[docType]: 'one'}}
          onSelectAllFields={jest.fn()}
          onClearAllFields={jest.fn()}
          matches={matchRequest(request, [credential('one')])}
        />,
      );

      expect(screen.queryByText('request.selectAll')).not.toBeOnTheScreen();
    });
  });

  describe('partial and empty selections (frames 33 and 34)', () => {
    const twoDetailRequest: MdocRequest = {
      ...request,
      documents: [
        {
          ...request.documents[0],
          nameSpaces: {[namespace]: {given_name: false, family_name: false}},
        },
      ],
    };
    const cardWithBothDetails = () => {
      const card = credential('one');
      (card.verifiableCredential as any).processedCredential.nameSpaces[
        namespace
      ].push({elementIdentifier: 'family_name', elementValue: 'Rao'});
      return card;
    };
    const field = (element: string) => JSON.stringify([namespace, element]);

    it('marks an unticked detail as not shared and counts the share against everything requested', () => {
      const screen = render(
        <MdocRequestReview
          {...props}
          selection={{[docType]: 'one'}}
          checkedFields={{[docType]: [field('given_name')]}}
          canShareSelectedCards
          matches={matchRequest(twoDetailRequest, [cardWithBothDetails()])}
        />,
      );

      expect(screen.getByText('request.notShared')).toBeOnTheScreen();
      expect(screen.getByText('request.partialShareNote')).toBeOnTheScreen();
      expect(screen.getByText('request.sharePartial')).toBeOnTheScreen();
    });

    it('asks the holder to tick a detail or decline when nothing is selected', () => {
      const screen = render(
        <MdocRequestReview
          {...props}
          selection={{[docType]: 'one'}}
          checkedFields={{[docType]: []}}
          matches={matchRequest(twoDetailRequest, [cardWithBothDetails()])}
        />,
      );

      expect(screen.getByText('request.nothingSelected')).toBeOnTheScreen();
      expect(screen.getByText('request.shareNothing')).toBeOnTheScreen();
      expect(screen.getAllByText('request.notShared')).toHaveLength(2);
    });

    it('keeps the plain share label when every requested detail is ticked', () => {
      const screen = render(
        <MdocRequestReview
          {...props}
          selection={{[docType]: 'one'}}
          checkedFields={{
            [docType]: [field('given_name'), field('family_name')],
          }}
          canShareSelectedCards
          matches={matchRequest(twoDetailRequest, [cardWithBothDetails()])}
        />,
      );

      expect(screen.getByText('request.share')).toBeOnTheScreen();
      expect(screen.queryByText('request.notShared')).not.toBeOnTheScreen();
      expect(
        screen.queryByText('request.partialShareNote'),
      ).not.toBeOnTheScreen();
    });
  });

  it('tells the holder a further request in the same session asks for more details', () => {
    const screen = render(
      <MdocRequestReview
        {...props}
        requestNumber={2}
        matches={matchRequest(request, [credential('one')])}
      />,
    );

    expect(screen.getByText('request.followUpTitle')).toBeOnTheScreen();
    expect(screen.getByText('request.followUpDescription')).toBeOnTheScreen();
    expect(screen.queryByText('request.title')).not.toBeOnTheScreen();
  });

  it('keeps the usual heading for the first request of a session', () => {
    const screen = render(
      <MdocRequestReview
        {...props}
        requestNumber={1}
        matches={matchRequest(request, [credential('one')])}
      />,
    );

    expect(screen.getByText('request.title')).toBeOnTheScreen();
    expect(screen.queryByText('request.followUpTitle')).not.toBeOnTheScreen();
  });

  describe('no card in the wallet for any requested document (frame 36)', () => {
    it('says which card they asked for and that it is not in the wallet', () => {
      const screen = render(
        <MdocRequestReview {...props} matches={matchRequest(request, [])} />,
      );

      expect(screen.getByText('request.noCard.title')).toBeOnTheScreen();
      expect(screen.getByText('request.noCard.askedFor')).toBeOnTheScreen();
      expect(screen.getByText('Mobile Driving Licence')).toBeOnTheScreen();
      expect(screen.getByText('request.noCard.notInWallet')).toBeOnTheScreen();
      expect(screen.queryByText('request.title')).not.toBeOnTheScreen();
    });

    it('ends the session by declining the request', () => {
      const screen = render(
        <MdocRequestReview {...props} matches={matchRequest(request, [])} />,
      );

      fireEvent.press(screen.getByText('engagement.endSession'));

      expect(props.onDeclineRequest).toHaveBeenCalledTimes(1);
    });

    it('sends the holder to add a card', () => {
      const onAddCard = jest.fn();
      const screen = render(
        <MdocRequestReview
          {...props}
          onAddCard={onAddCard}
          matches={matchRequest(request, [])}
        />,
      );

      fireEvent.press(screen.getByText('request.noCard.addCard'));

      expect(onAddCard).toHaveBeenCalledTimes(1);
    });

    it('keeps the request review when at least one requested document has a card', () => {
      const withUnheldDocument: MdocRequest = {
        ...request,
        documents: [
          ...request.documents,
          {...request.documents[0], docType: 'org.iso.7367.1.mVRC'},
        ],
      };

      const screen = render(
        <MdocRequestReview
          {...props}
          matches={matchRequest(withUnheldDocument, [credential('one')])}
        />,
      );

      expect(screen.getByText('request.title')).toBeOnTheScreen();
      expect(screen.queryByText('request.noCard.title')).not.toBeOnTheScreen();
    });
  });

  it('lets the holder pick an expired card', () => {
    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(request, [
          credential('expired', true),
          credential('valid'),
        ])}
      />,
    );

    fireEvent.press(screen.getAllByRole('radio')[0]);

    expect(props.onSelectCard).toHaveBeenCalledWith(docType, 'expired');
  });

  it('warns that the verifier will see an expired card, with the date it expired', () => {
    // design frame 37
    const expired = credential('expired', true);
    (expired.verifiableCredential as any).processedCredential.issuerAuth[2] = {
      docType,
      validityInfo: {validUntil: '2026-10-02T00:00:00Z'},
    };

    const screen = render(
      <MdocRequestReview
        {...props}
        selection={{[docType]: 'expired'}}
        matches={matchRequest(request, [expired])}
      />,
    );

    expect(screen.getByText('request.expiredBadge')).toBeOnTheScreen();
    expect(screen.getByText('request.expiredOn')).toBeOnTheScreen();
  });

  it('still blocks a revoked card', () => {
    const revoked = credential('revoked');
    revoked.vcMetadata.isRevoked = 'TRUE';

    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(request, [revoked, credential('valid')])}
      />,
    );
    fireEvent.press(screen.getAllByRole('radio')[0]);

    expect(props.onSelectCard).not.toHaveBeenCalled();
    expect(screen.getByText('request.revokedCard')).toBeOnTheScreen();
  });

  it('still lets the holder share anyway when the verifier failed its identity check', () => {
    // design frame 29: Decline leads, sharing stays possible
    const withFailedCheck: MdocRequest = {
      ...request,
      documents: [{...request.documents[0], readerTrust: {status: 'invalid'}}],
    };
    const screen = render(
      <MdocRequestReview
        {...props}
        canShareSelectedCards
        selection={{[docType]: 'one'}}
        matches={matchRequest(withFailedCheck, [credential('one')])}
      />,
    );

    fireEvent.press(screen.getByText('request.shareAnyway'));

    expect(props.onShareSelectedCards).toHaveBeenCalledTimes(1);
  });

  it('opens the identity explanation from the warning about an unverified verifier', () => {
    const withUnverifiedReader: MdocRequest = {
      ...request,
      documents: [
        {...request.documents[0], readerTrust: {status: 'unverified'}},
      ],
    };
    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(withUnverifiedReader, [credential('one')])}
      />,
    );

    fireEvent.press(screen.getByText('requestHelp.learnMore'));

    expect(props.onOpenIdentityHelp).toHaveBeenCalledTimes(1);
  });

  // design frame 27: a reader asking for two documents
  const twoDocuments = (
    secondTrust: MdocRequest['documents'][number]['readerTrust'],
  ): MdocRequest => ({
    ...request,
    documents: [
      request.documents[0],
      {
        docType: 'org.iso.7367.1.mVRC',
        nameSpaces: {'org.iso.7367.1': {registration_number: false}},
        readerTrust: secondTrust,
      },
    ],
  });

  it('shows the verifier once for a request that asks for two cards', () => {
    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(twoDocuments({status: 'notSigned'}), [
          credential('one'),
        ])}
      />,
    );

    expect(
      screen.getAllByText('request.trustCard.unverified.title'),
    ).toHaveLength(1);
  });

  it('says how many cards are asked for when the request spans two cards', () => {
    const screen = render(
      <MdocRequestReview
        {...props}
        selection={{[docType]: 'one'}}
        matches={matchRequest(twoDocuments({status: 'notSigned'}), [
          credential('one'),
        ])}
      />,
    );

    expect(screen.getByText('request.cardCount')).toBeOnTheScreen();
    expect(screen.getByText('request.shareFromCards')).toBeOnTheScreen();
  });

  it('warns about the least trusted verifier signature when two document requests differ', () => {
    const screen = render(
      <MdocRequestReview
        {...props}
        matches={matchRequest(twoDocuments({status: 'invalid'}), [
          credential('one'),
        ])}
      />,
    );

    expect(
      screen.getByText('request.trustCard.invalid.title'),
    ).toBeOnTheScreen();
  });

  it('sends approval only after an explicit Share press', () => {
    const screen = render(
      <MdocRequestReview
        {...props}
        canShareSelectedCards
        selection={{[docType]: 'one'}}
        matches={matchRequest(request, [credential('one')])}
      />,
    );
    expect(props.onShareSelectedCards).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('shareMdoc'));
    expect(props.onShareSelectedCards).toHaveBeenCalledTimes(1);
  });
});

describe('Outcome screens', () => {
  const outcomeProps = {
    matches: [],
    selection: {},
    checkedFields: {},
    onDone: jest.fn(),
    onBackToEntry: jest.fn(),
    onNewCode: jest.fn(),
    onViewHistory: jest.fn(),
    onTurnOnBluetooth: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it.each([
    ['verified', true],
    ['unverified', false],
    ['notSigned', false],
    ['invalid', false],
  ] as const)(
    'uses every document trust result in the outcome (%s)',
    (status, expectedVerified) => {
      const matches = matchRequest(
        {
          ...request,
          documents: [
            {
              ...request.documents[0],
              readerTrust: {status: 'verified', readerName: 'Reader'},
            },
            {
              ...request.documents[0],
              docType: 'org.iso.23220.photoid.1',
              readerTrust: {status, readerName: 'Reader'},
            },
          ],
        },
        [],
      );
      const {result} = renderHook(() =>
        useMdocOutcome({...outcomeProps, matches}),
      );

      expect(result.current.isVerifiedVerifier).toBe(expectedVerified);
    },
  );

  it('goes back Home by itself ten seconds after a share', () => {
    render(<MdocOutcomeView {...outcomeProps} outcome="shared" />);

    for (let second = 0; second < 10; second++)
      act(() => jest.advanceTimersByTime(1000));

    expect(outcomeProps.onDone).toHaveBeenCalledTimes(1);
  });

  it('stays on the shared screen when the holder chooses to stay', () => {
    const screen = render(
      <MdocOutcomeView {...outcomeProps} outcome="shared" />,
    );

    fireEvent.press(screen.getByText('outcome.stayHere'));
    for (let second = 0; second < 10; second++)
      act(() => jest.advanceTimersByTime(1000));

    expect(outcomeProps.onDone).not.toHaveBeenCalled();
  });

  it('returns to Share nearby rather than Home when the holder is done after declining', () => {
    const screen = render(
      <MdocOutcomeView {...outcomeProps} outcome="declined" />,
    );

    fireEvent.press(screen.getByText('done'));

    expect(outcomeProps.onBackToEntry).toHaveBeenCalledTimes(1);
    expect(outcomeProps.onDone).not.toHaveBeenCalled();
  });

  it('asks to turn Bluetooth on when it was switched off during the session', () => {
    const screen = render(
      <MdocOutcomeView {...outcomeProps} outcome="bluetoothOff" />,
    );

    fireEvent.press(screen.getByText('outcome.turnOnBluetooth'));

    expect(outcomeProps.onTurnOnBluetooth).toHaveBeenCalledTimes(1);
  });

  it('opens the shared entry in history from the shared screen', () => {
    const screen = render(
      <MdocOutcomeView {...outcomeProps} outcome="shared" />,
    );

    fireEvent.press(screen.getByText('outcome.viewHistory'));

    expect(outcomeProps.onViewHistory).toHaveBeenCalledTimes(1);
  });
});
