import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Modal} from '../../../components/ui/UpdatedModal';
import {useTranslation} from 'react-i18next';
import type {RequestHelp} from './RequestHelpController';
import {VerifierDetails} from './VerifierDetails';
import {IdentityHelp} from './IdentityHelp';
import {RetentionHelp} from './RetentionHelp';
import {PrivacyHelp} from './PrivacyHelp';
import Close from '../../../assets/shareNearby/close.svg';

const helpStyles = Theme.ShareNearbyHelpStyles;

export function RequestHelpSheets({
  activeHelpSheet,
  onClose,
  onOpenIdentityHelp,
  onOpenRetentionHelp,
}: {
  activeHelpSheet?: RequestHelp;
  onClose: () => void;
  onOpenIdentityHelp: () => void;
  onOpenRetentionHelp: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  const title =
    activeHelpSheet?.kind === 'verifier'
      ? t(`request.trust.${activeHelpSheet.readerTrust.status}`)
      : activeHelpSheet?.kind === 'retention'
      ? t('request.retentionHelp')
      : activeHelpSheet?.kind === 'identity'
      ? t('request.verifierTitle')
      : t('helpContent.privacyTitle');
  // Switch content in one Modal so linked sheets do not compete for presentation.
  return (
    <Modal
      presentation="bottomSheet"
      isVisible={!!activeHelpSheet}
      headerTitle={title}
      titleStyle={helpStyles.sheetTitle}
      contentContainerStyle={helpStyles.sheetContent}
      backdropStyle={helpStyles.backdrop}
      showHandle
      closeIcon={<Close />}
      closeAccessibilityLabel={t('close')}
      closeButtonType="gradient"
      onDismiss={onClose}
      // Verifier and privacy sheets put a link under their main button, so they draw their own.
      closeLabel={
        activeHelpSheet?.kind === 'verifier' ||
        activeHelpSheet?.kind === 'privacy'
          ? undefined
          : t('requestHelp.gotIt')
      }>
      {activeHelpSheet?.kind === 'verifier' && (
        <VerifierDetails
          readerTrust={activeHelpSheet.readerTrust}
          onClose={onClose}
          onLearnMore={onOpenIdentityHelp}
        />
      )}
      {activeHelpSheet?.kind === 'identity' && <IdentityHelp />}
      {activeHelpSheet?.kind === 'retention' && <RetentionHelp />}
      {activeHelpSheet?.kind === 'privacy' && (
        <PrivacyHelp
          onClose={onClose}
          onOpenRetentionHelp={onOpenRetentionHelp}
        />
      )}
    </Modal>
  );
}
