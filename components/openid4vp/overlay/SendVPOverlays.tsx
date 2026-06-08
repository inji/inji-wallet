import React from 'react';
import {VerifyIdentityOverlay} from '../../../screens/VerifyIdentityOverlay';
import {VPShareOverlay, VPShareOverlayProps} from '../../../screens/Scan/VPShareOverlay';
import {FaceVerificationAlertOverlay} from '../../../screens/Scan/FaceVerificationAlertOverlay';
import {WhyWeNeedDocumentsOverlay} from './WhyWeNeedDocumentsOverlay';
import {Credential} from "../../../machines/VerifiableCredential/VCMetaMachine/vc";

type SendVPOverlaysController = {
  credentials: unknown;
  verifiableCredentialsData: unknown;
  isVerifyingIdentity: boolean;
  CANCEL: () => void;
  FACE_VALID: () => void;
  FACE_INVALID: () => void;
  isInvalidIdentity: boolean;
  GO_TO_HOME: () => void;
  RETRY_VERIFICATION: () => void;
  overlayDetails: Omit<VPShareOverlayProps, 'isVisible'> | null;
  isFaceVerificationConsent: boolean;
  FACE_VERIFICATION_CONSENT: (isDoNotAskAgainChecked: boolean) => void;
  DISMISS_POPUP: () => void;
};

type SendVPOverlaysProps = {
  controller: SendVPOverlaysController;
  isLivenessEnabled: boolean;
  showShareOverlays: boolean;
  primaryButtonEvent: () => void;
  showInfoOverlay: boolean;
  onCloseInfoOverlay: () => void;
};

export const SendVPOverlays: React.FC<SendVPOverlaysProps> = ({
  controller,
  isLivenessEnabled,
  showShareOverlays,
  primaryButtonEvent,
  showInfoOverlay,
  onCloseInfoOverlay,
}) => {
  return (
    <>
      {showShareOverlays && (
        <>
          <VerifyIdentityOverlay
            credential={controller.credentials as Credential[]}
            verifiableCredentialData={controller.verifiableCredentialsData}
            isVerifyingIdentity={controller.isVerifyingIdentity}
            onCancel={controller.CANCEL}
            onFaceValid={controller.FACE_VALID}
            onFaceInvalid={controller.FACE_INVALID}
            isInvalidIdentity={controller.isInvalidIdentity}
            onNavigateHome={controller.GO_TO_HOME}
            onRetryVerification={controller.RETRY_VERIFICATION}
            isLivenessEnabled={isLivenessEnabled}
          />

          {controller.overlayDetails !== null && (
            <VPShareOverlay
              isVisible={true}
              title={controller.overlayDetails.title}
              titleTestID={controller.overlayDetails.titleTestID}
              message={controller.overlayDetails.message}
              messageTestID={controller.overlayDetails.messageTestID}
              primaryButtonTestID={controller.overlayDetails.primaryButtonTestID}
              primaryButtonText={controller.overlayDetails.primaryButtonText}
              primaryButtonEvent={primaryButtonEvent}
              secondaryButtonTestID={controller.overlayDetails.secondaryButtonTestID}
              secondaryButtonText={controller.overlayDetails.secondaryButtonText}
              secondaryButtonEvent={controller.overlayDetails.secondaryButtonEvent}
              onCancel={controller.overlayDetails.onCancel}
            />
          )}

          <FaceVerificationAlertOverlay
            isVisible={controller.isFaceVerificationConsent}
            onConfirm={controller.FACE_VERIFICATION_CONSENT}
            close={controller.DISMISS_POPUP}
          />
        </>
      )}

      <WhyWeNeedDocumentsOverlay
        isVisible={showInfoOverlay}
        onClose={onCloseInfoOverlay}
      />
    </>
  );
};






