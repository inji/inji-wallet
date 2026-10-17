import type {displayType} from '../../machines/Issuers/IssuersMachine';
import {getDisplayObjectForCurrentLanguage} from './Utils';

const OFFER_FETCH_TIMEOUT_MS = 5000;

/**
 * The `credential_configuration_ids` of a scanned credential offer. The offer is either inline
 * (`credential_offer=`) or by reference (`credential_offer_uri=`), which is fetched again here
 * because the VCI library does not pass the ids to the trust callback. Only https links are
 * fetched, with a timeout; an issuer that allows a link to be used once makes this fetch fail.
 */
export async function getOfferedCredentialConfigurationIds(
  offer: string,
): Promise<string[]> {
  const params = parseQueryParams(offer);
  let offerObject: {credential_configuration_ids?: unknown};
  if (params.credential_offer) {
    offerObject = JSON.parse(params.credential_offer);
  } else if (params.credential_offer_uri) {
    if (!params.credential_offer_uri.startsWith('https://')) {
      return [];
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OFFER_FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(params.credential_offer_uri, {
        signal: controller.signal,
      });
      offerObject = await response.json();
    } finally {
      clearTimeout(timer);
    }
  } else {
    return [];
  }
  const ids = offerObject?.credential_configuration_ids;
  return Array.isArray(ids)
    ? ids.filter((id): id is string => typeof id === 'string')
    : [];
}

/**
 * Display names, in the current language, of the given credential configurations from the
 * issuer's metadata. Configurations without a display name are left out.
 */
export function getCredentialConfigurationNames(
  issuerMetadata: {credential_configurations_supported?: object},
  configurationIds: string[],
): string[] {
  const supported = (issuerMetadata?.credential_configurations_supported ??
    {}) as Record<
    string,
    {display?: displayType[]; credential_metadata?: {display?: displayType[]}}
  >;
  return configurationIds
    .map(id => {
      const configuration = supported[id];
      const display =
        configuration?.display ?? configuration?.credential_metadata?.display;
      return display ? getDisplayObjectForCurrentLanguage(display)?.name : '';
    })
    .filter((name): name is string => !!name);
}

function parseQueryParams(url: string): Record<string, string> {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) {
    return {};
  }
  const params: Record<string, string> = {};
  url
    .slice(queryStart + 1)
    .split('&')
    .forEach(pair => {
      const separator = pair.indexOf('=');
      if (separator === -1) {
        return;
      }
      const key = decodeURIComponent(pair.slice(0, separator));
      params[key] = decodeURIComponent(
        pair.slice(separator + 1).replace(/\+/g, ' '),
      );
    });
  return params;
}
