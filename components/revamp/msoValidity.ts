import {
  asArray,
  asMap,
  decodeCbor,
  DecodedTag,
} from '../../shared/mdoc/presentment/cbor';
import {parseCoseSign1} from '../../shared/mdoc/presentment/cose';
import {decodeIssuerSignedCompact} from '../../shared/mdoc/presentment/issuerSigned';

export interface MsoValidity {
  signed?: string;
  validFrom?: string;
  validUntil?: string;
}

const tdate = (v: unknown) => {
  const inner = v instanceof DecodedTag ? v.value : v;
  return typeof inner === 'string' ? inner : undefined;
};

/**
 * The issue and expiry dates an mdoc's issuer signed into its MSO (`validityInfo`), which is
 * where an mdoc keeps them when they are not also data elements. Undefined if unreadable.
 */
export function msoValidity(compact: unknown): MsoValidity | undefined {
  if (typeof compact !== 'string') return undefined;
  try {
    const root = asMap(decodeCbor(decodeIssuerSignedCompact(compact)), 'mdoc');
    let issuerSigned = root;
    if (root.get('issuerAuth') === undefined) {
      const nested =
        root.get('issuerSigned') ??
        asMap(asArray(root.get('documents'), 'documents')[0], 'document').get(
          'issuerSigned',
        );
      issuerSigned = asMap(nested, 'issuerSigned');
    }
    const payload = parseCoseSign1(issuerSigned.get('issuerAuth')).payload;
    if (!payload) return undefined;
    const item = decodeCbor(payload);
    const mso = asMap(
      decodeCbor(item instanceof DecodedTag ? item.embeddedCbor : payload),
      'MSO',
    );
    const info = asMap(mso.get('validityInfo'), 'validityInfo');
    return {
      signed: tdate(info.get('signed')),
      validFrom: tdate(info.get('validFrom')),
      validUntil: tdate(info.get('validUntil')),
    };
  } catch {
    return undefined;
  }
}
