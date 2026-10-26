import React, {useEffect} from 'react';
import {VCMetadata} from '../../shared/VCMetadata';
import {CredentialCardData, useCredentialCard} from './useCredentialCard';

export interface LoadedCard {
  data: CredentialCardData;
  service: any;
  controller: any;
}

/** Loads one credential and hands it up; renders nothing itself. */
export const CardLoader: React.FC<{
  vcMetadata: VCMetadata;
  onLoaded: (key: string, card: LoadedCard) => void;
  /** The card's QR is shown (its back, or Show QR), so CredIssuer's QR may be looked up. */
  issuerQrNeeded?: boolean;
}> = ({vcMetadata, onLoaded, issuerQrNeeded = false}) => {
  const {data, service, controller} = useCredentialCard(
    vcMetadata,
    false,
    issuerQrNeeded,
  );
  useEffect(() => {
    if (data) onLoaded(vcMetadata.getVcKey(), {data, service, controller});
  }, [data, controller.credential]);
  return null;
};
