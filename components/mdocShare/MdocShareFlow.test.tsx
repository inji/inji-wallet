import React from 'react';
import {Animated, View} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import {MdocShareFlow, MdocShareFlowProps} from './MdocShareFlow';
import type {MdocPresentmentConsentRequest} from '../../shared/mdoc/iso18013PresentmentInterop';

jest.mock('react-native-qrcode-svg', () => 'QRCode');
// The RN mock reports Android, where testIDProps emits accessibilityLabel instead of testID.
jest.mock('../../shared/commonUtil', () => ({
  __esModule: true,
  default: (id: string) => ({testID: id}),
}));
// StatusBar batches updates with setImmediate, which the jsdom environment lacks.
const timerGlobals = global as unknown as Record<string, unknown>;
timerGlobals.setImmediate ??= (fn: () => void) => setTimeout(fn, 0);
timerGlobals.clearImmediate ??= (id: ReturnType<typeof setTimeout>) =>
  clearTimeout(id);
// The theme imports i18n.ts, which calls getLocales() at load time.
jest.mock('expo-localization', () => ({
  getLocales: () => [{languageTag: 'en-US', languageCode: 'en'}],
}));

// The RN mock drops NativeAnimatedModule, so native-driver animations can't mount here.
jest
  .spyOn(Animated as unknown as {readonly View: unknown}, 'View', 'get')
  .mockReturnValue(View);
jest.spyOn(Animated, 'loop').mockReturnValue({
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
});

const request: MdocPresentmentConsentRequest = {
  docType: 'org.iso.18013.5.1.mDL',
  purpose: '',
  elements: [
    {
      namespace: 'org.iso.18013.5.1',
      element: 'family_name',
      intentToRetain: false,
      optional: false,
    },
    {
      namespace: 'org.iso.18013.5.1',
      element: 'portrait',
      intentToRetain: true,
      optional: false,
    },
  ],
  requestInfo: {
    verifier_name: 'Metro Traffic Police',
    purposes: [
      {
        id: 'p1',
        name: 'verify',
        is_required: true,
        description: 'Verify your licence',
      },
      {name: 'record', is_required: false, description: 'Keep a record'},
    ],
  },
};

function renderFlow(overrides: Partial<MdocShareFlowProps> = {}) {
  const props: MdocShareFlowProps = {
    visible: true,
    step: 'showQr',
    title: 'Show mDL',
    credentialName: 'Mobile Driving Licence',
    issuerName: 'Road Transport Authority',
    holderName: 'Amara Mensah',
    qrValue: 'mdoc:abc',
    consentRequest: null,
    consentBusy: false,
    verifierName: 'Metro Traffic Police',
    fallbackVerifierName: 'the verifier',
    summary: {shared: request.elements, agreedPurposes: [], withheld: []},
    closedAt: new Date(2026, 9, 13, 18, 40),
    onQRError: jest.fn(),
    onQrRef: jest.fn(),
    onCancel: jest.fn(),
    onAllow: jest.fn(),
    onDeny: jest.fn(),
    onDone: jest.fn(),
    onViewActivity: jest.fn(),
    onShowQrAgain: jest.fn(),
    ...overrides,
  };
  return {props, ...render(<MdocShareFlow {...props} />)};
}

describe('MdocShareFlow', () => {
  it('shows the QR step with credential details and a working Cancel', () => {
    const {getByTestId, getByText, props} = renderFlow();
    expect(getByTestId('mdocShowQrTitle')).toHaveTextContent('Show mDL');
    expect(getByTestId('mdocShowQrCredentialName')).toHaveTextContent(
      'Mobile Driving Licence',
    );
    expect(getByTestId('mdocShowQrHolder')).toHaveTextContent(
      'Amara Mensah · Mobile Driving Licence',
    );
    expect(getByText('mdocShare.waitingForScan')).toBeTruthy();
    fireEvent.press(getByTestId('mdocShowQrCancel'));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });
  it('shows a loader before the QR is ready and an error when it fails', () => {
    const loading = renderFlow({step: 'loading', qrValue: ''});
    expect(loading.getByText('mdocShare.loadingQr')).toBeTruthy();
    expect(loading.queryByTestId('mdocShowQrWaiting')).toBeNull();
    loading.unmount();

    const error = renderFlow({step: 'error', qrValue: ''});
    expect(error.getByTestId('mdocShowQrError')).toBeTruthy();
  });

  it('shows connection progress after the reader attaches', () => {
    const {getByTestId} = renderFlow({step: 'connecting'});
    expect(getByTestId('mdocConnectingTitle')).toBeTruthy();
    expect(getByTestId('mdocConnectingStep-0-done')).toBeTruthy();
    expect(getByTestId('mdocConnectingStep-1-done')).toBeTruthy();
    expect(getByTestId('mdocConnectingStep-2-active')).toBeTruthy();
    expect(getByTestId('mdocConnectingStep-3-pending')).toBeTruthy();
  });

  it('approves with every purpose accepted by default', () => {
    const {getByTestId, queryByTestId, props} = renderFlow({
      step: 'consent',
      consentRequest: request,
    });
    expect(getByTestId('mdocConsentVerifierName')).toHaveTextContent(
      'Metro Traffic Police',
    );
    expect(getByTestId('mdocConsentElement-0')).toBeTruthy();
    expect(getByTestId('mdocConsentElement-1')).toBeTruthy();
    expect(getByTestId('mdocConsentElementStored-1')).toBeTruthy();
    expect(getByTestId('mdocConsentLegal')).toHaveTextContent(
      'mdocShare.notStatedByVerifier',
    );
    expect(queryByTestId('mdocConsentWithheld-0')).toBeNull();
    expect(queryByTestId('mdocConsentNotHeld')).toBeNull();
    fireEvent.press(getByTestId('mdocConsentAllow'));
    expect(props.onAllow).toHaveBeenCalledWith(
      [
        {id: 'p1', name: 'verify', accepted: true},
        {id: 'NA', name: 'record', accepted: true},
      ],
      ['Verify your licence', 'Keep a record'],
      request.elements,
    );
  });

  it('lists only the details being sent, each with its purposes', () => {
    const mapped: MdocPresentmentConsentRequest = {
      ...request,
      elements: [
        ...request.elements,
        {
          namespace: 'org.iso.18013.5.1',
          element: 'birth_date',
          intentToRetain: false,
          optional: false,
        },
      ],
      requestedElements: [
        {
          namespace: 'org.iso.18013.5.1',
          element: 'resident_address',
          intentToRetain: false,
          servable: false,
          servedAs: null,
        },
      ],
      requestInfo: {
        verifier_name: 'Metro Traffic Police',
        legal_basis: 'Road Traffic Act, licence enforcement',
        shared_with: 'No third parties',
        purposes: [
          {
            id: 'p1',
            name: 'verify',
            is_required: true,
            description: 'Verify licence',
            details: 'Check the licence is valid.',
            elements: ['family_name', 'portrait'],
          },
          {
            id: 'p2',
            name: 'stats',
            is_required: false,
            description: 'Road safety statistics',
            retention: 'Anonymised · stored for 1 year',
            elements: ['age_over_18'],
          },
        ],
      },
    };
    const {getByTestId, queryByTestId, props} = renderFlow({
      step: 'consent',
      consentRequest: mapped,
    });
    expect(getByTestId('mdocConsentPurposeRetention-1')).toHaveTextContent(
      'Anonymised · stored for 1 year',
    );
    expect(getByTestId('mdocConsentPurposeChip-1-0')).toBeTruthy();
    expect(getByTestId('mdocConsentElement-0')).toHaveTextContent(
      'mdocShare.usedFor',
    );
    expect(getByTestId('mdocConsentElement-1')).toBeTruthy();
    expect(queryByTestId('mdocConsentElement-2')).toBeNull();
    expect(getByTestId('mdocConsentWithheld-0')).toHaveTextContent(
      'mdocShare.notSharedUnneeded',
    );
    expect(getByTestId('mdocConsentNotHeld')).toHaveTextContent(
      'mdocShare.notHeldReason',
    );
    expect(getByTestId('mdocConsentLegal')).toHaveTextContent(
      'Road Traffic Act, licence enforcement',
    );
    fireEvent.press(getByTestId('mdocConsentAllow'));
    expect(props.onAllow).toHaveBeenCalledWith(
      expect.any(Array),
      ['Verify licence', 'Road safety statistics'],
      request.elements,
    );
  });

  it('locks required purposes and leaves optional ones toggleable', () => {
    const {getByTestId, queryByTestId} = renderFlow({
      step: 'consent',
      consentRequest: request,
    });
    expect(getByTestId('mdocConsentPurposeRequired-0')).toBeTruthy();
    expect(
      getByTestId('mdocConsentPurpose-0').props.accessibilityState,
    ).toMatchObject({checked: true, disabled: true});
    expect(queryByTestId('mdocConsentPurposeRequired-1')).toBeNull();
    expect(
      getByTestId('mdocConsentPurpose-1').props.accessibilityState,
    ).toMatchObject({checked: true, disabled: false});
  });

  it('declines from the consent step', () => {
    const {getByTestId, props} = renderFlow({
      step: 'consent',
      consentRequest: request,
    });
    fireEvent.press(getByTestId('mdocConsentDeny'));
    expect(props.onDeny).toHaveBeenCalledTimes(1);
  });

  it('shows the number of details being sent', () => {
    const {getByTestId} = renderFlow({step: 'sending'});
    expect(getByTestId('mdocSendingTitle')).toHaveTextContent(
      'mdocShare.sendingTitle',
    );
  });

  it('summarises a successful share and links to Activity', () => {
    const {getByTestId, queryByTestId, props} = renderFlow({
      step: 'shared',
      summary: {
        shared: request.elements,
        agreedPurposes: ['Verify your licence', 'Keep a record'],
        withheld: [],
      },
      elementValues: {family_name: 'Mensah', portrait: new Uint8Array([1])},
    });
    expect(getByTestId('mdocResultTitle')).toHaveTextContent(
      'mdocShare.sharedTitle',
    );
    expect(getByTestId('mdocResultShared-0')).toHaveTextContent(
      'mdocShare.elementLabels.family_name',
    );
    expect(getByTestId('mdocResultSharedValue-0')).toHaveTextContent('Mensah');
    expect(getByTestId('mdocResultSharedValue-1')).toHaveTextContent(
      'mdocShare.photoValue',
    );
    expect(getByTestId('mdocResultSharedTag-0')).toHaveTextContent(
      'mdocShare.viewedOnly',
    );
    expect(getByTestId('mdocResultSharedTag-1')).toHaveTextContent(
      'mdocShare.stored',
    );
    expect(getByTestId('mdocResultPurpose-0')).toHaveTextContent(
      'Verify your licence',
    );
    expect(getByTestId('mdocResultPurpose-1')).toHaveTextContent(
      'Keep a record',
    );
    expect(getByTestId('mdocResultSummary')).toBeTruthy();
    expect(queryByTestId('mdocResultWithheld')).toBeNull();
    expect(queryByTestId('mdocResultShowQrAgain')).toBeNull();
    fireEvent.press(getByTestId('mdocResultViewActivity'));
    expect(props.onViewActivity).toHaveBeenCalledTimes(1);
    fireEvent.press(getByTestId('mdocResultDone'));
    expect(props.onDone).toHaveBeenCalledTimes(1);
  });

  it('offers Show QR Again after a decline', () => {
    const {getByTestId, queryByTestId, props} = renderFlow({step: 'declined'});
    expect(getByTestId('mdocResultTitle')).toHaveTextContent(
      'mdocShare.declinedTitle',
    );
    expect(getByTestId('mdocResultConnectionClosed')).toBeTruthy();
    expect(queryByTestId('mdocResultViewActivity')).toBeNull();
    fireEvent.press(getByTestId('mdocResultShowQrAgain'));
    expect(props.onShowQrAgain).toHaveBeenCalledTimes(1);
  });

  it('uses the failure copy when the session ended on its own', () => {
    const {getByTestId, queryByTestId} = renderFlow({step: 'failed'});
    expect(getByTestId('mdocResultTitle')).toHaveTextContent(
      'mdocShare.failedTitle',
    );
    expect(queryByTestId('mdocResultTypeMismatch')).toBeNull();
  });

  it('explains a credential type mismatch instead of a generic failure', () => {
    const {getByTestId, queryByTestId, props} = renderFlow({
      step: 'failed',
      typeMismatch: {
        requestedDocTypes: [
          'org.iso.18013.5.1.mDL',
          'org.iso.18013.5.1.DrivingLicence',
        ],
        walletDocType: 'org.iso.18013.5.1.mDL1',
      },
    });
    expect(getByTestId('mdocResultTitle')).toHaveTextContent(
      'mdocShare.typeMismatchTitle',
    );
    expect(getByTestId('mdocResultRequestedTypes')).toHaveTextContent(
      'org.iso.18013.5.1.mDL org.iso.18013.5.1.DrivingLicence',
    );
    expect(getByTestId('mdocResultWalletType')).toHaveTextContent(
      'org.iso.18013.5.1.mDL1',
    );
    expect(queryByTestId('mdocResultConnectionClosed')).toBeNull();
    fireEvent.press(getByTestId('mdocResultShowQrAgain'));
    expect(props.onShowQrAgain).toHaveBeenCalledTimes(1);
  });

  it('ignores a stale type mismatch on a decline', () => {
    const {getByTestId, queryByTestId} = renderFlow({
      step: 'declined',
      typeMismatch: {
        requestedDocTypes: ['org.iso.18013.5.1.mDL'],
        walletDocType: 'org.iso.18013.5.1.mDL1',
      },
    });
    expect(getByTestId('mdocResultTitle')).toHaveTextContent(
      'mdocShare.declinedTitle',
    );
    expect(queryByTestId('mdocResultTypeMismatch')).toBeNull();
  });
});
