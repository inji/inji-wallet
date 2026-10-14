import React from 'react';
import {Modal, StatusBar, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Theme} from '../ui/styleUtils';
import type {
  MdocPresentmentConsentElement,
  MdocPresentmentConsentRequest,
} from '../../shared/mdoc/iso18013PresentmentInterop';
import {MdocShowQrStep} from './MdocShowQrStep';
import {MdocConnectingStep} from './MdocConnectingStep';
import {MdocConsentStep} from './MdocConsentStep';
import {MdocSendingStep} from './MdocSendingStep';
import {MdocShareResultStep} from './MdocShareResultStep';
import {
  MdocCredentialTypeMismatch,
  MdocShareStep,
  MdocShareSummary,
  PurposesResponse,
} from './mdocShareUtils';

const {colors: C, brand: B} = Theme.Tokens;

const NAVY_STEPS: MdocShareStep[] = [
  'loading',
  'error',
  'showQr',
  'connecting',
  'sending',
];

/**
 * One full-screen Modal for the whole mDoc proximity share. Steps swap inside it rather than
 * stacking separate Modals, so moving between them never flashes the screen underneath.
 */
export const MdocShareFlow: React.FC<MdocShareFlowProps> = props => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);
  const isNavy = NAVY_STEPS.includes(props.step);

  function handleHardwareBack() {
    switch (props.step) {
      case 'loading':
      case 'error':
      case 'showQr':
      case 'connecting':
        props.onCancel();
        return;
      case 'consent':
        if (!props.consentBusy) {
          props.onDeny();
        }
        return;
      case 'sending':
        // The response may already be in flight; leaving now would hide its outcome.
        return;
      default:
        props.onDone();
    }
  }

  function renderStep() {
    switch (props.step) {
      case 'loading':
      case 'error':
      case 'showQr':
        return (
          <MdocShowQrStep
            title={props.title}
            credentialName={props.credentialName}
            issuerName={props.issuerName}
            issuerLogoUrl={props.issuerLogoUrl}
            holderName={props.holderName}
            qrValue={props.step === 'showQr' ? props.qrValue : ''}
            error={props.step === 'error'}
            bottomInset={bottomInset}
            onCancel={props.onCancel}
            onQRError={props.onQRError}
            onQrRef={props.onQrRef}
          />
        );
      case 'connecting':
        return (
          <MdocConnectingStep title={props.title} onCancel={props.onCancel} />
        );
      case 'consent':
        return props.consentRequest ? (
          <MdocConsentStep
            request={props.consentRequest}
            verifierName={props.verifierName}
            credentialName={props.credentialName}
            isBusy={props.consentBusy}
            bottomInset={bottomInset}
            onAllow={props.onAllow}
            onDeny={props.onDeny}
          />
        ) : null;
      case 'sending':
        return (
          <MdocSendingStep
            count={props.summary.shared.length}
            verifierName={props.verifierName || props.fallbackVerifierName}
          />
        );
      case 'shared':
      case 'declined':
      case 'failed':
        return (
          <MdocShareResultStep
            result={
              props.step === 'shared'
                ? 'success'
                : props.step === 'declined'
                ? 'declined'
                : 'failure'
            }
            verifierName={props.verifierName}
            credentialName={props.credentialName}
            summary={props.summary}
            elementValues={props.elementValues}
            typeMismatch={props.typeMismatch}
            closedAt={props.closedAt ?? new Date()}
            bottomInset={bottomInset}
            onDone={props.onDone}
            onViewActivity={props.onViewActivity}
            onShowQrAgain={props.onShowQrAgain}
          />
        );
    }
  }

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleHardwareBack}>
      <StatusBar barStyle={isNavy ? 'light-content' : 'dark-content'} />
      <View
        testID="mdocShareFlow"
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: isNavy ? B.navy : C.canvas,
          },
        ]}>
        {renderStep()}
      </View>
    </Modal>
  );
};

type QrSvgRef = {toDataURL: (callback: (dataURL: string) => void) => void};

export interface MdocShareFlowProps {
  visible: boolean;
  step: MdocShareStep;
  title: string;
  credentialName: string;
  issuerName?: string;
  issuerLogoUrl?: string;
  holderName?: string;
  qrValue: string;
  consentRequest: MdocPresentmentConsentRequest | null;
  consentBusy: boolean;
  verifierName?: string;
  /** Used where a sentence needs a name and the verifier sent none ("…to the verifier"). */
  fallbackVerifierName: string;
  summary: MdocShareSummary;
  /** The credential's own element values, shown next to each shared detail. */
  elementValues?: Record<string, unknown>;
  typeMismatch?: MdocCredentialTypeMismatch | null;
  closedAt: Date | null;
  onQRError: () => void;
  onQrRef: (ref: QrSvgRef) => void;
  onCancel: () => void;
  onAllow: (
    purposesResponse: PurposesResponse,
    agreedPurposes: string[],
    sharedElements: MdocPresentmentConsentElement[],
  ) => void;
  onDeny: () => void;
  onDone: () => void;
  onViewActivity: () => void;
  onShowQrAgain: () => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
