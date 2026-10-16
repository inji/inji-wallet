import {useEffect, useMemo, useState} from 'react';
import {VCMetadata} from '../../shared/VCMetadata';
import {useVcItemController} from '../VC/VCItemController';
import {VCProcessor} from '../VC/common/VCProcessor';
import {
  CARD_VIEW_DEFAULT_FIELDS,
  getCredentialType,
  isVCLoaded,
} from '../VC/common/VCUtils';
import {
  getCredentialIssuersWellKnownConfig,
  getDisplayObjectForCurrentLanguage,
} from '../../shared/openId4VCI/Utils';
import {RevocationStatus} from '../../shared/vcVerifier/VcVerifier';
import {documentNumber, flatClaims, holderName} from './credentialClaims';
import {msoValidity} from './msoValidity';
import {claimLabels} from './cardFields';
import {VCFormat} from '../../shared/VCFormat';

export type CardStatus = 'verified' | 'pending' | 'expired' | 'revoked';

export interface CredentialCardData {
  title: string;
  /** The issuer's own name from its metadata, else its address. */
  issuerName?: string;
  holderName?: string;
  number?: {key?: string; label: string; value: string};
  face?: string;
  issuerLogoUrl?: string;
  /** The issuer's colours for this credential type, from its metadata; undefined if it sets none. */
  background?: string;
  text?: string;
  status: CardStatus;
  format: string;
  claims: Record<string, string>;
  /** The issuer's display name for each claim, by claim name. */
  labels?: Record<string, string>;
  vcMetadata?: VCMetadata;
  /** The stored credential, for building its QR. */
  credential: any;
}

/**
 * Everything one credential card shows, loaded the way the wallet's existing card loads it: the
 * stored credential, processed for display, and the issuer's well-known metadata for its type.
 */
export function useCredentialCard(
  vcMetadata: VCMetadata,
  isDownloading = false,
) {
  const controller = useVcItemController(vcMetadata);
  const verifiableCredentialData = controller.verifiableCredentialData;
  const [vc, setVc] = useState<any>(null);
  const [wellknown, setWellknown] = useState<any>(null);
  const [issuerDisplay, setIssuerDisplay] = useState<any>(null);
  const loaded = isVCLoaded(controller.credential as any);
  const configurationId = verifiableCredentialData?.credentialConfigurationId;

  useEffect(() => {
    controller.UPDATE_VC_METADATA(vcMetadata);
  }, [vcMetadata]);

  useEffect(() => {
    if (isDownloading || !controller.credential) return;
    let cancelled = false;
    VCProcessor.processForRendering(
      controller.credential,
      verifiableCredentialData.format,
    ).then(processed => {
      if (!cancelled) setVc(processed);
    });
    return () => {
      cancelled = true;
    };
  }, [isDownloading, controller.credential]);

  // Waits for the stored credential: until it loads, its configuration id is unknown and the
  // lookup would settle on the issuer's default look, then change when the real type arrives.
  useEffect(() => {
    if (!loaded || !vcMetadata.issuerHost) return;
    getCredentialIssuersWellKnownConfig(
      vcMetadata.issuerHost,
      CARD_VIEW_DEFAULT_FIELDS,
      configurationId,
      vcMetadata.format,
      vcMetadata.issuerHost,
    )
      .then(response => {
        setWellknown(
          response?.matchingCredentialIssuerMetadata ?? {fallback: 'true'},
        );
        const issuer = response?.wellknownResponse?.display;
        setIssuerDisplay(
          issuer ? getDisplayObjectForCurrentLanguage(issuer) : null,
        );
        controller.STORE_INCOMING_VC_WELLKNOWN_CONFIG(
          vcMetadata.issuerHost,
          response.wellknownResponse,
        );
      })
      .catch(() => setWellknown({fallback: 'true'}));
  }, [loaded, configurationId]);

  const ready = loaded && !!vc && !!wellknown;

  const data = useMemo<CredentialCardData | null>(() => {
    if (!ready) return null;
    const format = vcMetadata.format;
    const claims = flatClaims(vc, format);
    if (format === VCFormat.mso_mdoc) {
      const validity = msoValidity(controller.credential?.credential);
      claims.issue_date ??= validity?.validFrom ?? validity?.signed ?? '';
      claims.expiry_date ??= validity?.validUntil ?? '';
    }
    if (!claims.address && claims.address_line1) {
      claims.address = [claims.address_line1, claims.address_line2]
        .filter(Boolean)
        .join(', ');
    }
    const display = wellknown?.display
      ? getDisplayObjectForCurrentLanguage(wellknown.display)
      : undefined;
    const status: CardStatus =
      vcMetadata.isRevoked === RevocationStatus.TRUE
        ? 'revoked'
        : vcMetadata.isExpired
        ? 'expired'
        : vcMetadata.isVerified
        ? 'verified'
        : 'pending';
    return {
      title: getCredentialType(wellknown),
      issuerName: issuerDisplay?.name ?? verifiableCredentialData?.issuer,
      holderName: holderName(claims),
      number: documentNumber(claims),
      face: verifiableCredentialData?.face,
      issuerLogoUrl: verifiableCredentialData?.issuerLogo?.url,
      background: display?.background_color,
      text: display?.text_color,
      status,
      format,
      claims,
      labels: claimLabels(wellknown),
      vcMetadata,
      credential: controller.credential,
    };
  }, [
    ready,
    vc,
    wellknown,
    issuerDisplay,
    vcMetadata,
    verifiableCredentialData,
    controller.credential,
  ]);

  return {data, controller, service: controller.VCItemService};
}
