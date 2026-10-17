import {useEffect, useState} from 'react';
import {VCMetadata} from '../../shared/VCMetadata';
import {getCredentialIssuersWellKnownConfig} from '../../shared/openId4VCI/Utils';
import {CARD_VIEW_DEFAULT_FIELDS, isVCLoaded} from './common/VCUtils';
import {VCProcessor} from './common/VCProcessor';
import {useVcItemController} from './VCItemController';

/**
 * Loads what a credential card needs to render: the processed credential, and the issuer's
 * well-known metadata, both for this credential type and for the issuer as a whole.
 */
export function useVcCardData(vcMetadata: VCMetadata, isDownloading = false) {
  const controller = useVcItemController(vcMetadata);
  const verifiableCredentialData = controller.verifiableCredentialData;

  const [wellknown, setWellknown] = useState<any>(null);
  const [issuerWellknown, setIssuerWellknown] = useState<any>(null);
  const [vc, setVc] = useState<any>(null);

  useEffect(() => {
    controller.UPDATE_VC_METADATA(vcMetadata);
  }, [vcMetadata]);

  useEffect(() => {
    async function loadVc() {
      if (!isDownloading && isVCLoaded(controller.credential as any)) {
        const processedData = await VCProcessor.processForRendering(
          controller.credential,
          controller.verifiableCredentialData.format,
        );
        setVc(processedData);
      }
    }
    loadVc();
  }, [isDownloading, controller.credential]);

  useEffect(() => {
    // Until the stored credential loads its configuration id is unknown, and the lookup
    // fails on `undefined` before succeeding on the next run.
    if (
      !verifiableCredentialData ||
      !verifiableCredentialData.vcMetadata ||
      !isVCLoaded(controller.credential as any)
    ) {
      return;
    }
    const {
      credentialConfigurationId,
      vcMetadata: {format},
    } = verifiableCredentialData;

    if (vcMetadata.issuerHost) {
      getCredentialIssuersWellKnownConfig(
        vcMetadata.issuerHost,
        CARD_VIEW_DEFAULT_FIELDS,
        credentialConfigurationId,
        format,
        vcMetadata.issuerHost,
      )
        .then(response => {
          if (response && response.matchingCredentialIssuerMetadata) {
            setWellknown(response.matchingCredentialIssuerMetadata);
          }
          setIssuerWellknown(response.wellknownResponse ?? null);
          controller.STORE_INCOMING_VC_WELLKNOWN_CONFIG(
            verifiableCredentialData?.vcMetadata.issuerHost,
            response.wellknownResponse,
          );
        })
        .catch(error => {
          setWellknown({fallback: 'true'});
          console.error(
            'Error occurred while fetching wellknown for viewing VC ',
            error,
          );
        });
    }
  }, [verifiableCredentialData, controller.credential]);

  return {
    controller,
    vc,
    wellknown,
    issuerWellknown,
    isLoaded: isVCLoaded(controller.credential) && !!wellknown && !!vc,
  };
}
