import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Image} from 'react-native';
import type {MdocCandidate} from '../../../shared/mdocPresentation/matching';
import type {VerifiableCredential} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';

const reviewStyles = Theme.ShareNearbyReviewStyles;

export function IssuerLogo({candidate}: {candidate?: MdocCandidate}) {
  const logoUrl = (
    candidate?.vc.verifiableCredential as VerifiableCredential | undefined
  )?.issuerLogo?.url;
  if (!logoUrl) return null;
  return (
    <Image
      testID="issuerLogo"
      source={{uri: logoUrl}}
      style={reviewStyles.issuerLogo}
      resizeMode="contain"
    />
  );
}
