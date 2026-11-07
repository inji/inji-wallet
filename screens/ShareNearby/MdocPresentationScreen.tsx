import {Theme} from '../../components/ui/styleUtils';
import React from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Modal} from '../../components/ui/UpdatedModal';
import {MdocPresentationEvents as presentationEvents} from '../../machines/mdocPresentation/mdocPresentationModel';
import {Text, Button} from '../../components/ui';
import {VerifyIdentityOverlay} from '../VerifyIdentityOverlay';
import {LIVENESS_CHECK} from '../../shared/constants';
import type {VerifiableCredential} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {MdocEngagement} from './engagement/MdocEngagement';
import {EngagementSteps} from './engagement/EngagementSteps';
import {ScanHelpSheet} from './engagement/ScanHelpSheet';
import {MdocSendingStatus} from './sending/MdocSendingStatus';
import {countApprovedElements} from '../../machines/mdocPresentation/mdocPresentationGuards';
import {MdocRequestReview} from './request/MdocRequestReview';
import {MdocOutcomeView} from './outcome/MdocOutcomeView';
import {RequestHelpSheets} from './request/RequestHelpSheets';
import Close from '../../assets/shareNearby/close.svg';

import type {MdocPresentationController} from './MdocPresentationScreenController';

const helpStyles = Theme.ShareNearbyHelpStyles;
const colors = Theme.ShareNearbyColors;
const styles = Theme.ShareNearbyStyles;

export function MdocPresentationScreen({
  presentationController,
}: {
  presentationController: MdocPresentationController;
}) {
  const {t} = useTranslation('ShareNearby');
  const {
    presentationState,
    presentationContext,
    canShareSelectedCards,
    canShareWithSelfieVerification,
    isSendingResponse,
    isStoppingPresentation,
    isShowingOutcome,
    isShowingEngagement,
    isReviewingRequest,
    engagementStage,
    selectedCards,
    selectedCardFaces,
    handleBackOrCancel,
    isScanHelpVisible,
    requestHelpController,
    isStopConfirmationVisible,
    sendPresentationEvent,
  } = presentationController;
  return (
    <>
      {/* The design shows the stepper while connecting, not on review, sending or outcomes. */}
      {(isShowingEngagement ||
        (isShowingOutcome &&
          presentationContext.outcome === 'codeExpired')) && (
        <EngagementSteps stage={engagementStage ?? 'showingCode'} />
      )}
      {isShowingEngagement && engagementStage && (
        <MdocEngagement
          qrText={presentationContext.qrText}
          expiresAt={presentationContext.codeExpiresAt}
          sessionExpiresAt={presentationContext.requestExpiresAt}
          stage={engagementStage}
          onCancel={handleBackOrCancel}
          onHelp={presentationController.OPEN_SCAN_HELP}
        />
      )}
      {isReviewingRequest && (
        <MdocRequestReview
          onOpenVerifierDetails={requestHelpController.OPEN_VERIFIER_DETAILS}
          onOpenRetentionHelp={requestHelpController.OPEN_RETENTION_HELP}
          onOpenIdentityHelp={requestHelpController.OPEN_IDENTITY_HELP}
          matches={presentationContext.matches}
          selection={presentationContext.selection}
          checkedFields={presentationContext.checkedFields}
          requestNumber={presentationContext.request?.requestNumber}
          canShareSelectedCards={canShareSelectedCards}
          canShareWithSelfieVerification={canShareWithSelfieVerification}
          expiresAt={presentationContext.requestExpiresAt}
          hasPreparationFailed={presentationState.matches(
            'presenting.preparationFailed',
          )}
          onSelectCard={(docType, credentialId) =>
            sendPresentationEvent(
              presentationEvents.SELECT_CARD(docType, credentialId),
            )
          }
          onToggleRequestedField={(docType, namespace, elementIdentifier) =>
            sendPresentationEvent(
              presentationEvents.TOGGLE_FIELD(
                docType,
                namespace,
                elementIdentifier,
              ),
            )
          }
          onShareSelectedCards={() =>
            sendPresentationEvent(presentationEvents.SHARE())
          }
          onVerifyAndShare={() =>
            sendPresentationEvent(presentationEvents.VERIFY_AND_SHARE())
          }
          onDeclineRequest={() =>
            sendPresentationEvent(presentationEvents.DECLINE())
          }
          onRetryPreparation={() =>
            sendPresentationEvent(presentationEvents.RETRY())
          }
          onAddCard={presentationController.ADD_CARD}
          onSelectAllFields={docType =>
            sendPresentationEvent(presentationEvents.SELECT_ALL_FIELDS(docType))
          }
          onClearAllFields={docType =>
            sendPresentationEvent(presentationEvents.CLEAR_ALL_FIELDS(docType))
          }
        />
      )}
      {isShowingOutcome && presentationContext.outcome && (
        <MdocOutcomeView
          outcome={presentationContext.outcome}
          matches={presentationContext.matches}
          selection={presentationContext.selection}
          checkedFields={presentationContext.checkedFields}
          onDone={presentationController.DONE}
          onBackToEntry={presentationController.BACK_TO_ENTRY}
          onViewHistory={presentationController.VIEW_HISTORY}
          onTurnOnBluetooth={presentationController.TURN_ON_BLUETOOTH}
          onNewCode={() => sendPresentationEvent(presentationEvents.NEW_CODE())}
        />
      )}
      {!isShowingEngagement && !isReviewingRequest && !isShowingOutcome && (
        <>
          {isSendingResponse ? (
            <MdocSendingStatus
              detailCount={countApprovedElements(
                presentationContext.matches,
                presentationContext.selection,
                presentationContext.checkedFields,
              )}
            />
          ) : (
            <View style={[styles.center, styles.flexible]}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text weight="bold" style={[styles.title, styles.centeredText]}>
                {t(
                  isStoppingPresentation
                    ? 'sending.stopping'
                    : presentationState.matches('presenting.preparing')
                    ? 'sending.preparing'
                    : presentationState.matches('presenting.declining')
                    ? 'sending.declining'
                    : 'sending.title',
                )}
              </Text>
            </View>
          )}
          {presentationController.isNativeSendingResponse && (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={presentationController.OPEN_STOP_CONFIRMATION}
                testID="stopMdoc"
                style={({pressed}) => [
                  styles.linkButton,
                  pressed && styles.pressed,
                ]}>
                <Text weight="semibold" style={styles.link}>
                  {t('cancel')}
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
      <ScanHelpSheet
        visible={isScanHelpVisible}
        onClose={presentationController.CLOSE_SCAN_HELP}
        onScanInstead={presentationController.SCAN_INSTEAD}
      />
      <RequestHelpSheets
        activeHelpSheet={requestHelpController.activeHelpSheet}
        onClose={requestHelpController.CLOSE_HELP}
        onOpenIdentityHelp={requestHelpController.OPEN_IDENTITY_HELP}
        onOpenRetentionHelp={requestHelpController.OPEN_RETENTION_HELP}
      />
      <Modal
        presentation="bottomSheet"
        isVisible={isStopConfirmationVisible}
        headerTitle={t('sending.stopTitle')}
        titleStyle={helpStyles.sheetTitle}
        contentContainerStyle={helpStyles.sheetContent}
        backdropStyle={helpStyles.backdrop}
        showHandle
        closeIcon={<Close />}
        closeAccessibilityLabel={t('close')}
        onDismiss={presentationController.CLOSE_STOP_CONFIRMATION}>
        <Text style={styles.body}>{t('sending.stopDescription')}</Text>
        <Button
          styles={styles.buttonContainer}
          type="gradient"
          title={t('sending.keepSending')}
          onPress={presentationController.CLOSE_STOP_CONFIRMATION}
        />
        <Pressable
          accessibilityRole="button"
          testID="confirmStopMdoc"
          onPress={presentationController.CONFIRM_STOP}
          style={({pressed}) => [styles.linkButton, pressed && styles.pressed]}>
          <Text weight="semibold" style={[styles.link, styles.sendingStop]}>
            {t('sending.stop')}
          </Text>
        </Pressable>
      </Modal>
      <Modal
        presentation="bottomSheet"
        isVisible={presentationState.matches(
          'presenting.faceVerificationConsent',
        )}
        headerTitle={t('selfie.title')}
        onDismiss={() => sendPresentationEvent(presentationEvents.DECLINE())}
        closeLabel={t('decline')}>
        <Text style={styles.body}>{t('selfie.description')}</Text>
        <Button
          styles={styles.buttonContainer}
          type="gradient"
          title={t('selfie.continue')}
          onPress={() =>
            sendPresentationEvent(
              presentationEvents.FACE_VERIFICATION_CONSENT(),
            )
          }
        />
      </Modal>
      {(presentationState.matches('presenting.verifyingIdentity') ||
        presentationState.matches('presenting.invalidIdentity')) && (
        <VerifyIdentityOverlay
          credential={selectedCards.map(
            vc => (vc.verifiableCredential as VerifiableCredential).credential,
          )}
          verifiableCredentialData={selectedCardFaces}
          isVerifyingIdentity={presentationState.matches(
            'presenting.verifyingIdentity',
          )}
          isInvalidIdentity={presentationState.matches(
            'presenting.invalidIdentity',
          )}
          onCancel={() => sendPresentationEvent(presentationEvents.CANCEL())}
          onFaceValid={() =>
            sendPresentationEvent(presentationEvents.FACE_VALID())
          }
          onFaceInvalid={() =>
            sendPresentationEvent(presentationEvents.FACE_INVALID())
          }
          onRetryVerification={() =>
            sendPresentationEvent(presentationEvents.RETRY_VERIFICATION())
          }
          onNavigateHome={presentationController.DISMISS}
          isLivenessEnabled={LIVENESS_CHECK}
        />
      )}
    </>
  );
}
