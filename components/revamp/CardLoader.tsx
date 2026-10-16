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
}> = ({vcMetadata, onLoaded}) => {
  const {data, service, controller} = useCredentialCard(vcMetadata);
  useEffect(() => {
    if (data) onLoaded(vcMetadata.getVcKey(), {data, service, controller});
  }, [data, controller.credential]);
  return null;
};
