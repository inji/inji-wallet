import {NativeModules} from 'react-native';
import {VerifiableCredential} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import {VCFormat} from '../../../shared/VCFormat';
import {getVerifiableCredential} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors';
import {parseJSON} from '../../../shared/Utils';
import base64url from 'base64url';
import jwtDecode from 'jwt-decode';
import {sha256, sha384, sha512} from '@noble/hashes/sha2';

const {RNPixelpassModule} = NativeModules;

export class VCProcessor {
  static async processForRendering(
    vcData: VerifiableCredential,
    vcFormat: string,
  ): Promise<any> {
    if (vcFormat === VCFormat.mso_mdoc) {
      if (vcData.processedCredential) {
        return vcData.processedCredential;
      }
      const decodedString =
        await RNPixelpassModule.decodeBase64UrlEncodedCBORData(
          vcData.credential.toString(),
        );
      return parseJSON(decodedString);
    }
    if (vcFormat === VCFormat.vc_sd_jwt || vcFormat === VCFormat.dc_sd_jwt) {
      const {
        fullResolvedPayload,
        disclosedKeys,
        publicKeys,
        pathToDisclosures,
      } = reconstructSdJwtFromCompact(vcData.credential.toString());
      return {
        fullResolvedPayload,
        disclosedKeys,
        publicKeys,
        pathToDisclosures,
      };
    }
    return getVerifiableCredential(vcData);
  }
}

/*
Transforms SD-JWT into a fully reconstructable JSON object
Input: full SD-JWT string (with disclosures appended)
Output:
- fullResolvedPayload: resolved JSON with all disclosed claims
- disclosedKeys: Set of keys that were disclosed via disclosures (as full JSON paths)
- publicKeys: Set of keys that were present in JWT payload directly (non-selectively-disclosable)
*/

function hashDigest(alg: string, input: string): Uint8Array {
  switch (alg) {
    case 'sha-256':
      return sha256(input);
    case 'sha-384':
      return sha384(input);
    case 'sha-512':
      return sha512(input);
    default:
      throw new Error(`Unsupported _sd_alg: ${alg}`);
  }
}

export function reconstructSdJwtFromCompact(sdJwtCompact: string): {
  fullResolvedPayload: Record<string, any>;
  disclosedKeys: string[];
  publicKeys: string[];
  pathToDisclosures: Record<string, string[]>; //  Mapof{claimPath -> disclosure strings}
} {
  const sdJwtPublicKeys = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'];
  const disclosedKeys = new Set<string>();
  const publicKeys = new Set<string>();
  const digestToDisclosure: Record<string, any[]> = {};
  const pathToDisclosures: Record<string, string[]> = {};
  const digestToDisclosureB64: Record<string, string> = {};

  // Split SD-JWT into parts: [jwt, disclosure1, disclosure2, ...]
  const parts = sdJwtCompact.trim().split('~');
  const jwt = parts[0];
  const disclosures = parts.slice(1);
  const payload: any = jwtDecode(jwt);

  const sdAlg = payload._sd_alg || 'sha-256';

  // Parse disclosures
  for (const disclosureB64 of disclosures) {
    if (disclosureB64.length > 0) {
      const decodedB64 = disclosureB64.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(
        Buffer.from(decodedB64, 'base64').toString('utf-8'),
      );
      const digestInput = disclosureB64;
      const digest = base64url(Buffer.from(hashDigest(sdAlg, digestInput)));

      digestToDisclosure[digest] = decoded;
      digestToDisclosureB64[digest] = disclosureB64;
    }
  }

  //Parse the JWT payload
  function resolveDisclosures(
    value: any,
    path = '',
    parentDisclosures: string[] = [],
  ): any {
    if (Array.isArray(value)) {
      return value.flatMap((item, index) => {
        const currentPath = `${path}[${index}]`;
        if (
          typeof item === 'object' &&
          item !== null &&
          Object.keys(item).length === 1 &&
          '...' in item
        ) {
          const digest = item['...'];
          const disclosure = digestToDisclosure[digest];
          if (!disclosure || disclosure.length !== 2) {
            return [];
          }
          disclosedKeys.add(currentPath);
          const currentDisclosures = [
            ...parentDisclosures,
            digestToDisclosureB64[digest],
          ];
          pathToDisclosures[currentPath] = currentDisclosures;
          return [
            resolveDisclosures(disclosure[1], currentPath, currentDisclosures),
          ];
        } else {
          return [resolveDisclosures(item, currentPath, parentDisclosures)];
        }
      });
    }

    if (typeof value === 'object' && value !== null) {
      const result: Record<string, any> = {};

      const sdDigests: string[] = value._sd || [];
      for (const digest of sdDigests) {
        const disclosure = digestToDisclosure[digest];
        if (!disclosure || disclosure.length !== 3) {
          continue;
        }
        const [_, claimName, claimValue] = disclosure;
        if (claimName === '_sd' || claimName === '...') continue;
        if (claimName in value) throw new Error('Overwriting existing key');
        const fullPath = path ? `${path}.${claimName}` : claimName;
        disclosedKeys.add(fullPath);
        const currentDisclosures = [
          ...parentDisclosures,
          digestToDisclosureB64[digest],
        ];
        pathToDisclosures[fullPath] = currentDisclosures;
        result[claimName] = resolveDisclosures(
          claimValue,
          fullPath,
          currentDisclosures,
        );
      }

      for (const [k, v] of Object.entries(value)) {
        if (k === '_sd') continue;
        const fullPath = path ? `${path}.${k}` : k;
        result[k] = resolveDisclosures(v, fullPath, parentDisclosures);
      }

      return result;
    }

    return value;
  }

  // Track public (non-selectively-disclosable) claims
  for (const key of Object.keys(payload)) {
    if (key !== '_sd' && key !== '_sd_alg' && sdJwtPublicKeys.includes(key)) {
      publicKeys.add(key);
    }
  }

  const fullResolvedPayload = resolveDisclosures(payload);
  delete fullResolvedPayload['_sd_alg'];

  return {
    fullResolvedPayload,
    disclosedKeys: Array.from(disclosedKeys),
    publicKeys: Array.from(publicKeys),
    pathToDisclosures,
  };
}
