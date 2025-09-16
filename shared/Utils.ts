import {sha256} from '@noble/hashes/sha256';
import {VCMetadata} from './VCMetadata';
import {CACHE_TTL, NETWORK_REQUEST_FAILED} from './constants';
import {groupBy} from './javascript';
import {Issuers} from './openId4VCI/Utils';
import {v4 as uuid} from 'uuid';
import {utf8ToBytes} from '@noble/hashes/utils';
import {Buffer} from 'buffer';
import base64url from 'base64url';
import jsonld from 'jsonld';

export const getVCsOrderedByPinStatus = (vcMetadatas: VCMetadata[]) => {
  const [pinned, unpinned] = groupBy(
    vcMetadatas,
    (vcMetadata: VCMetadata) => vcMetadata.isPinned,
  );
  return pinned.concat(unpinned);
};

export enum VCShareFlowType {
  SIMPLE_SHARE = 'simple share',
  MINI_VIEW_SHARE = 'mini view share',
  MINI_VIEW_SHARE_WITH_SELFIE = 'mini view share with selfie',
  MINI_VIEW_QR_LOGIN = 'mini view qr login',
  OPENID4VP = 'OpenID4VP',
  MINI_VIEW_SHARE_OPENID4VP = 'OpenID4VP share from mini view',
  MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP = 'OpenID4VP share with selfie from mini view',
}

export enum VCItemContainerFlowType {
  QR_LOGIN = 'qr login',
  VC_SHARE = 'vc share',
  VP_SHARE = 'vp share',
}

export enum CameraPosition {
  FRONT = 'front',
  BACK = 'back',
}

export interface CommunicationDetails {
  phoneNumber: string;
  emailId: string;
}

export const isMosipVC = (issuer: string) => {
  return issuer === Issuers.Mosip || issuer === Issuers.MosipOtp;
};

export const parseJSON = (input: any) => {
  let result = null;
  try {
    result = JSON.parse(input);
  } catch (e) {
    console.warn('Error occurred while parsing JSON ', e);
    result = JSON.parse(JSON.stringify(input));
  }
  return result;
};

export const isNetworkError = (error: string) => {
  return error.includes(NETWORK_REQUEST_FAILED);
};

export class UUID {
  public static generate(): string {
    return uuid();
  }
}

export const formatTextWithGivenLimit = (value: string, limit: number = 15) => {
  if (value.length > limit) {
    return value.substring(0, limit) + '...';
  }
  return value;
};

export enum DEEPLINK_FLOWS {
  QR_LOGIN = 'qrLoginFlow',
  OVP = 'ovpFlow',
}

export function base64ToByteArray(base64String) {
  try {
    let cleanBase64 = base64String.trim();
    cleanBase64 = cleanBase64.replace(/-/g, '+').replace(/_/g, '/');
    while (cleanBase64.length % 4) {
      cleanBase64 += '=';
    }
    const binaryString = atob(cleanBase64);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return byteArray;
  } catch (error) {
    throw new Error('Invalid Base64 string: ' + error.message);
  }
}

export async function canonicalize(unsignedVp: any) {
  try {
    const jsonldProof = {...unsignedVp['proof']};
    jsonldProof['@context'] = unsignedVp['@context'];
    const jsonldObjectClone = {...unsignedVp};
    if ('proof' in jsonldObjectClone) {
      delete jsonldObjectClone.proof;
    }
    const expandedJsonldObject = await jsonld.expand(jsonldObjectClone);
    let normalizedJsonldObject = await jsonld.canonize(expandedJsonldObject, {
      algorithm: 'URDNA2015',
    });

    const expandedJsonldProof = await jsonld.expand(jsonldProof);
    let normalizedJsonldProof = await jsonld.canonize(expandedJsonldProof, {
      algorithm: 'URDNA2015',
    });

    const canonicalizationResult = Buffer.alloc(64);
    Buffer.concat([
      //noble sha256 deprecated need to use alternative library
      sha256(utf8ToBytes(normalizedJsonldProof)),
      sha256(utf8ToBytes(normalizedJsonldObject)),
    ]).copy(canonicalizationResult, 0);
    return base64url(canonicalizationResult);
  } catch (err) {
    console.error('Canonization failed:', err);
  }
}

export const createCacheObject = (response: any) => {
  const currentTime = Date.now();
  return {
    response,
    cachedTime: currentTime,
  };
};

export const isCacheExpired = (timestamp: number) => {
  return Date.now() - timestamp >= CACHE_TTL;
};
