import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Badge} from '../../../components/ui/badge/Badge';
import type {ReaderTrust} from '../../../shared/mdocPresentation/types';
import VerifiedBadge from '../../../assets/shareNearby/verified.svg';
import FailedCheck from '../../../assets/shareNearby/failed-check.svg';

const helpStyles = Theme.ShareNearbyHelpStyles;

export function VerifierTrustBadge({status}: {status: ReaderTrust['status']}) {
  const {t} = useTranslation('ShareNearby');
  const isVerified = status === 'verified';
  const hasFailedCheck = status === 'invalid';
  return (
    <Badge
      text={t(`requestHelp.trustLabel.${status}`)}
      bgColor={helpStyles.badge.backgroundColor}
      icon={
        isVerified ? (
          <VerifiedBadge />
        ) : hasFailedCheck ? (
          <FailedCheck />
        ) : undefined
      }
      style={[
        helpStyles.badge,
        isVerified && helpStyles.verifiedBadge,
        hasFailedCheck && helpStyles.failedBadge,
      ]}
      textStyle={[
        Theme.TextStyles.semibold,
        helpStyles.badgeText,
        isVerified && helpStyles.verifiedText,
        hasFailedCheck && helpStyles.failedText,
      ]}
    />
  );
}
