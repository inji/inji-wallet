import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {useMdocRequestReview} from './MdocRequestReviewController';
import {
  MultipleCardsIntro,
  PreparationError,
  RequestHeading,
} from './RequestIntro';
import {VerifierCard} from './VerifierCard';
import {NoMatchingCard} from './NoMatchingCard';
import {leastTrustedReader} from './requestUtils';
import {countApprovedElements} from '../../../machines/mdocPresentation/mdocPresentationGuards';
import {RequestedDocument} from './RequestedDocument';
import {RequestReviewActions} from './RequestReviewActions';
import type {MdocRequestReviewProps} from './types';

const styles = Theme.ShareNearbyStyles;
const reviewStyles = Theme.ShareNearbyReviewStyles;

export function MdocRequestReview({
  matches,
  selection,
  checkedFields,
  requestNumber = 1,
  canShareSelectedCards,
  canShareWithSelfieVerification,
  expiresAt,
  hasPreparationFailed,
  onOpenVerifierDetails,
  onOpenRetentionHelp,
  onOpenIdentityHelp,
  onSelectCard,
  onToggleRequestedField,
  onShareSelectedCards,
  onVerifyAndShare,
  onDeclineRequest,
  onRetryPreparation,
  onAddCard,
  onSelectAllFields,
  onClearAllFields,
}: MdocRequestReviewProps) {
  const requestReviewController = useMdocRequestReview({expiresAt});
  const shareCount = countApprovedElements(matches, selection, checkedFields);
  const availableCount = matches.reduce(
    (total, documentMatch) =>
      total +
      (documentMatch.candidates.find(
        candidate =>
          candidate.vc.vcMetadata.id ===
          selection[documentMatch.requested.docType],
      )?.availableElements.length ?? 0),
    0,
  );
  //each documents has its own reader trust, so we need to find the least trusted one to display in the verifier card
  const readerTrust = leastTrustedReader(matches);
  const hasFailedVerifierCheck = readerTrust?.status === 'invalid';
  const cardCount = matches.length;
  if (cardCount > 0 && matches.every(documentMatch => documentMatch.noMatch)) {
    return (
      <NoMatchingCard
        matches={matches}
        readerTrust={readerTrust}
        onOpenVerifierDetails={onOpenVerifierDetails}
        onOpenIdentityHelp={onOpenIdentityHelp}
        onEndSession={onDeclineRequest}
        onAddCard={onAddCard}
      />
    );
  }
  return (
    <View style={styles.flexible}>
      <ScrollView
        style={styles.flexible}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <RequestHeading
          cardCount={cardCount}
          isFollowUpRequest={requestNumber > 1}
        />
        {readerTrust && (
          <VerifierCard
            readerTrust={readerTrust}
            onPress={() => onOpenVerifierDetails(readerTrust)}
            onLearnMore={onOpenIdentityHelp}
          />
        )}
        {cardCount > 1 && <MultipleCardsIntro cardCount={cardCount} />}
        {hasPreparationFailed && <PreparationError />}
        {matches.map((documentMatch, index) => (
          <RequestedDocument
            key={`${documentMatch.requested.docType}:${index}`}
            documentMatch={documentMatch}
            selectedCredentialId={selection[documentMatch.requested.docType]}
            checkedFields={checkedFields[documentMatch.requested.docType] ?? []}
            onSelectCard={onSelectCard}
            onToggleRequestedField={onToggleRequestedField}
            onOpenRetentionHelp={onOpenRetentionHelp}
            onSelectAllFields={onSelectAllFields}
            onClearAllFields={onClearAllFields}
          />
        ))}
      </ScrollView>
      <View style={reviewStyles.footer}>
        <RequestReviewActions
          expiresAt={expiresAt}
          countdown={requestReviewController.countdown}
          hasRequestExpired={requestReviewController.isExpired}
          shareCount={shareCount}
          availableCount={availableCount}
          cardCount={cardCount}
          hasFailedVerifierCheck={hasFailedVerifierCheck}
          hasPreparationFailed={hasPreparationFailed}
          canShareSelectedCards={canShareSelectedCards}
          canShareWithSelfieVerification={canShareWithSelfieVerification}
          onRetryPreparation={onRetryPreparation}
          onShareSelectedCards={onShareSelectedCards}
          onVerifyAndShare={onVerifyAndShare}
          onDeclineRequest={onDeclineRequest}
        />
      </View>
    </View>
  );
}
