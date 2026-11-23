import forge from 'node-forge';
import getAllConfigurations from '../api';

const PEM_ARMOUR = /-----(BEGIN|END) CERTIFICATE-----/g;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

// Certificate ::= SEQUENCE {tbsCertificate, signatureAlgorithm, signatureValue}; Tuvali parses the
// rest, and forge can only parse RSA certificates while reader roots are usually EC
function hasCertificateShape(der: string): boolean {
  try {
    const certificate = forge.asn1.fromDer(der, {strict: true});
    const parts = certificate.value;
    return (
      certificate.type === forge.asn1.Type.SEQUENCE &&
      Array.isArray(parts) &&
      parts.length === 3 &&
      parts[0].type === forge.asn1.Type.SEQUENCE &&
      parts[1].type === forge.asn1.Type.SEQUENCE &&
      parts[2].type === forge.asn1.Type.BITSTRING
    );
  } catch {
    return false;
  }
}

/** One configured root as single-line base64 DER, or undefined when it is not a certificate. */
export function normalizeTrustedReaderRoot(root: unknown): string | undefined {
  if (typeof root !== 'string') return undefined;
  const base64 = root.replace(PEM_ARMOUR, '').replace(/\s/g, '');
  if (!BASE64.test(base64) || base64.length % 4 !== 0) return undefined;
  return hasCertificateShape(forge.util.decode64(base64)) ? base64 : undefined;
}

function rootList(configured: unknown): unknown[] {
  if (Array.isArray(configured)) return configured;
  if (typeof configured !== 'string') return [];
  try {
    const parsed = JSON.parse(configured);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


export async function getTrustedReaderRoots(): Promise<string[]> {
  let configured: unknown;
  try {
    configured = (await getAllConfigurations())?.mdocTrustedReaderRoots;
  } catch {
    return [];
  }
  const entries = rootList(configured);
  const roots = entries
    .map(normalizeTrustedReaderRoot)
    .filter((root): root is string => root !== undefined);
  if (roots.length < entries.length) {
    console.warn(
      `[MdocPresentation] Left out ${
        entries.length - roots.length
      } trusted reader roots that are not certificates`,
    );
  }
  return roots;
}
