import {
  ActivityLogType,
  VCActivityLog,
} from '../../components/ActivityLogEvent';
import {VCMetadata} from '../VCMetadata';
import {
  MdocPresentmentConsentElement,
  MdocPresentmentConsentRequest,
} from './iso18013PresentmentInterop';

export type InPersonShareOutcome = Extract<
  ActivityLogType,
  | 'VC_SHARED_IN_PERSON'
  | 'VC_SHARE_IN_PERSON_DECLINED'
  | 'VC_SHARE_IN_PERSON_FAILED'
>;

/**
 * The verifier's name as the consent screen shows it: its own `verifier_name` from the request,
 * else the readerAuth / trust-metadata name.
 */
export function presentmentVerifierName(
  request: MdocPresentmentConsentRequest | null | undefined,
): string {
  return (
    request?.requestInfo?.verifier_name?.trim() ||
    request?.verifierName?.trim() ||
    ''
  );
}

/**
 * History entry for an in-person (ISO 18013-5) presentation of `meta`'s card. Only a
 * successful share records the disclosed elements — `sharedElements` when the user picked
 * a subset, else everything requested; the request may be null when the session failed
 * before the verifier's request arrived.
 */
export function buildInPersonShareLog(
  type: InPersonShareOutcome,
  meta: VCMetadata,
  credentialConfigurationId: string | undefined,
  request: MdocPresentmentConsentRequest | null | undefined,
  sharedElements?: MdocPresentmentConsentElement[] | null,
): VCActivityLog {
  const vcMetadata = VCMetadata.fromVC(meta);
  const disclosed = sharedElements ?? request?.elements ?? [];
  return VCActivityLog.getLogFromObject({
    _vcKey: vcMetadata.getVcKey(),
    type,
    timestamp: Date.now(),
    issuer: vcMetadata.issuerHost ?? '',
    credentialConfigurationId: credentialConfigurationId ?? '',
    deviceName: presentmentVerifierName(request),
    sharedDetails:
      type === 'VC_SHARED_IN_PERSON'
        ? [...new Set(disclosed.map(item => item.element))]
        : [],
    ...VCActivityLog.namesFrom(vcMetadata),
  });
}
