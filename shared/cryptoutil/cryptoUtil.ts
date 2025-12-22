import 'react-native-get-random-values';
import {RSA} from 'react-native-rsa-native';
import forge from 'node-forge';
import {
  BIOMETRIC_CANCELLED,
  DEBUG_MODE_ENABLED,
  SUPPORTED_KEY_TYPES,
  isAndroid,
  isIOS,
} from '../constants';
import {NativeModules} from 'react-native';
import {BiometricCancellationError} from '../error/BiometricCancellationError';
import {EncryptedOutput} from './encryptedOutput';
import {Buffer} from 'buffer';
import base64url from 'base64url';
import {hmac} from '@noble/hashes/hmac';
import {sha256} from '@noble/hashes/sha256';
import {sha512} from '@noble/hashes/sha512';
import * as secp from '@noble/secp256k1';
import {p256} from '@noble/curves/p256';
import * as ed from '@noble/ed25519';
import base64 from 'react-native-base64';
import {KeyTypes} from './KeyTypes';
import convertDerToRsFormat from './signFormatConverter';
import {hasKeyPair} from '../openId4VCI/Utils';
import {TelemetryConstants} from '../telemetry/TelemetryConstants';
import {
  sendImpressionEvent,
  getImpressionEventData,
} from '../telemetry/TelemetryUtils';

//polyfills setup
secp.etc.hmacSha256Sync = (k, ...m) =>
  hmac(sha256, k, secp.etc.concatBytes(...m));
secp.etc.hmacSha256Async = (k, ...m) =>
  Promise.resolve(secp.etc.hmacSha256Sync(k, ...m));
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) => Promise.resolve(ed.etc.sha512Sync(...m));
const {RNSecureKeystoreModule} = NativeModules;
// 5min
export const AUTH_TIMEOUT = 5 * 60;
export const ENCRYPTION_ID = 'c7c22a6c-9759-4605-ac88-46f4041d863k';
export const HMAC_ALIAS = '860cc320-4248-11ee-be56-0242ac120002';
//This key is used to request biometric at app open to reset auth timeout which is used by encryption key
export const DUMMY_KEY_FOR_BIOMETRIC_ALIAS =
  '9a6cfc0e-4248-11ee-be56-0242ac120002';

export async function generateKeyPairRSA() {
  if (isAndroid() && isHardwareKeystoreExists) {
    const isBiometricsEnabled =
      await RNSecureKeystoreModule.hasBiometricsEnabled();
    return {
      publicKey: await RNSecureKeystoreModule.generateKeyPair(
        KeyTypes.RS256,
        KeyTypes.RS256,
        isBiometricsEnabled,
        0,
      ),
      privateKey: '',
    };
  }
  const keyPair = await Promise.resolve(RSA.generateKeys(2048));
  return {
    publicKey: keyPair.public,
    privateKey: keyPair.private,
  };
}

export function generateKeyPairECK1() {
  const privKey = secp.utils.randomPrivateKey();
  const pubKey = secp.getPublicKey(privKey, false);
  return {
    publicKey: Buffer.from(pubKey).toString('base64'),
    privateKey: Buffer.from(privKey).toString('base64'),
  };
}

export async function generateKeyPairECR1() {
  if (isAndroid()) {
    const isBiometricsEnabled =
      await RNSecureKeystoreModule.hasBiometricsEnabled();
    return {
      publicKey: await RNSecureKeystoreModule.generateKeyPair(
        KeyTypes.ES256,
        KeyTypes.ES256,
        isBiometricsEnabled,
        0,
      ),
      privateKey: '',
    };
  }
  const privKey = p256.utils.randomPrivateKey();
  const pubKey = p256.getPublicKey(privKey, false);
  return {
    publicKey: Buffer.from(pubKey).toString('base64'),
    privateKey: Buffer.from(privKey).toString('base64'),
  };
}

export async function generateKeyPairED() {
  const privKey = ed.utils.randomPrivateKey();
  const pubKey = ed.getPublicKey(privKey);

  return {
    publicKey: Buffer.from(pubKey).toString('base64'),
    privateKey: Buffer.from(privKey).toString('base64'),
  };
}

export async function generateKeyPair(keyType: any): Promise<any> {
  switch (keyType) {
    case KeyTypes.RS256:
      return generateKeyPairRSA();
    case KeyTypes.ES256:
      return generateKeyPairECR1();
    case KeyTypes.ES256K:
      return generateKeyPairECK1();
    case KeyTypes.ED25519:
      return generateKeyPairED();
    default:
      break;
  }
}

export async function checkAllKeyPairs() {
  const RSAKey = await hasKeyPair(KeyTypes.RS256);
  const ECR1Key = await hasKeyPair(KeyTypes.ES256);
  const ECK1Key = await hasKeyPair(KeyTypes.ES256K);
  const EDKey = await hasKeyPair(KeyTypes.ED25519);
  if (!(RSAKey && ECR1Key && ECK1Key && EDKey)) throw Error('Keys not present');
}

export async function generateKeyPairsAndStoreOrder() {
  const {RNSecureKeystoreModule} = NativeModules;
  const RSAKeyPair = await generateKeyPair(KeyTypes.RS256);
  const ECR1KeyPair = await generateKeyPair(KeyTypes.ES256);
  const ECK1KeyPair = await generateKeyPair(KeyTypes.ES256K);
  const EDKeyPair = await generateKeyPair(KeyTypes.ED25519);
  const keys = Object.entries(SUPPORTED_KEY_TYPES).map(([label, value]) => ({
    label,
    value,
  }));
  const keyOrderMap = convertToKeyValue(keys);
  await RNSecureKeystoreModule.storeData(
    'keyPreference',
    JSON.stringify(keyOrderMap),
  );
  await RNSecureKeystoreModule.storeGenericKey(
    ECK1KeyPair.publicKey,
    ECK1KeyPair.privateKey,
    KeyTypes.ES256K,
  );
  await RNSecureKeystoreModule.storeGenericKey(
    EDKeyPair.publicKey,
    EDKeyPair.privateKey,
    KeyTypes.ED25519,
  );

  if (isIOS()) {
    await RNSecureKeystoreModule.storeGenericKey(
      RSAKeyPair.publicKey,
      RSAKeyPair.privateKey,
      KeyTypes.RS256,
    );
    await RNSecureKeystoreModule.storeGenericKey(
      ECR1KeyPair.publicKey,
      ECR1KeyPair.privateKey,
      KeyTypes.ES256,
    );
  }
  console.warn(TelemetryConstants.FlowType.keyGeneration);
}

/**
 * isCustomKeystore is a cached check of existence of a hardware keystore.
 */

export const isHardwareKeystoreExists = isCustomSecureKeystore();

export async function getJWT(
  header: object,
  payLoad: object,
  alias: string,
  privateKey: any,
  keyType: string,
) {
  try {
    const header64 = encodeB64(JSON.stringify(header));
    const payLoad64 = encodeB64(forge.util.encodeUtf8(JSON.stringify(payLoad)));
    const preHash = header64 + '.' + payLoad64;
    const signature64 = await createSignature(privateKey, preHash, keyType);
    return header64 + '.' + payLoad64 + '.' + signature64;
  } catch (error) {
    console.error('Exception Occurred While Constructing JWT ', error);
    if (error.toString().includes(BIOMETRIC_CANCELLED)) {
      throw new BiometricCancellationError(error.toString());
    }
    throw error;
  }
}

export async function createSignature(privateKey, payload, keyType: string) {
  switch (keyType) {
    case KeyTypes.RS256:
      return createSignatureRSA(privateKey, payload);
    case KeyTypes.ES256:
      return createSignatureECR1(privateKey, payload);
    case KeyTypes.ES256K:
      return createSignatureECK1(privateKey, payload);
    case KeyTypes.ED25519: {
      const payloadBytes = new TextEncoder().encode(payload);
      return createSignatureED(privateKey, payloadBytes);
    }
    default:
      break;
  }
}

export async function createSignatureRSA(privateKey: string, payload: string) {
  let signature64;

  if (!isHardwareKeystoreExists) {
    throw Error;
  } else {
    if (isAndroid())
      signature64 = await RNSecureKeystoreModule.sign(
        KeyTypes.RS256,
        KeyTypes.RS256,
        payload,
      );
    else {
      const key = forge.pki.privateKeyFromPem(privateKey);
      const md = forge.md.sha256.create();
      md.update(payload, 'utf8');

      const signature = key.sign(md);
      signature64 = encodeB64(signature);
    }
  }
  return replaceCharactersInB64(signature64);
}

export async function createSignatureECK1(privateKey, payload) {
  const sha = sha256(payload);
  const sign = await secp.signAsync(sha, privateKey, {lowS: false});
  return base64url(Buffer.from(sign.toCompactRawBytes()));
}

export async function createSignatureED(privateKey, payloadBytes) {
  const privateKeyUint8 = Uint8Array.from(privateKey);
  const sign = await ed.signAsync(payloadBytes, privateKeyUint8);
  return replaceCharactersInB64(Buffer.from(sign).toString('base64'));
}

export async function createSignatureECR1(privateKey, payload) {
  if (!isHardwareKeystoreExists) {
    throw Error;
  } else {
    if (isAndroid()) {
      let signature64 = await RNSecureKeystoreModule.sign(
        KeyTypes.ES256,
        KeyTypes.ES256,
        payload,
      );
      const base64DeodedSignature = base64.decode(
        signature64.replace(/\n/g, ''),
      );
      const derSignature = Uint8Array.from(base64DeodedSignature, char =>
        char.charCodeAt(0),
      );
      signature64 = convertDerToRsFormat(derSignature);
      return replaceCharactersInB64(signature64);
    }
  }
  const sha = sha256(payload);

  const sign = await p256.sign(sha, Buffer.from(privateKey, 'base64'), {
    lowS: false,
  });
  return base64url(Buffer.from(sign.toCompactRawBytes()));
}

export function replaceCharactersInB64(encodedB64: string) {
  return encodedB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function encodeB64(str: string) {
  const encodedB64 = forge.util.encode64(str);
  return replaceCharactersInB64(encodedB64);
}

/**
 * DO NOT USE DIRECTLY and/or REPEATEDLY in application lifeycle.
 *
 * This can make a call to the Android native layer hence taking up more time,
 *  use the isCustomKeystore constant in the app lifeycle instead.
 */
function isCustomSecureKeystore() {
  return isAndroid() ? RNSecureKeystoreModule.deviceSupportsHardware() : true;
}

export async function encryptJson(
  encryptionKey: string,
  data: string,
): Promise<string> {
  try {
    // Disable Encryption in debug mode
    if (DEBUG_MODE_ENABLED && __DEV__) {
      return JSON.stringify(data);
    }

    if (!isHardwareKeystoreExists) {
      return encryptWithForge(data, encryptionKey).toString();
    }
    const base64EncodedString = Buffer.from(data).toString('base64');
    return await RNSecureKeystoreModule.encryptData(
      ENCRYPTION_ID,
      base64EncodedString,
    );
  } catch (error) {
    console.error('error while encrypting:', error);
    if (error.toString().includes(BIOMETRIC_CANCELLED)) {
      throw new BiometricCancellationError(error.toString());
    }
    throw error;
  }
}

export async function decryptJson(
  encryptionKey: string,
  encryptedData: string,
): Promise<string> {
  try {
    if (encryptedData === null || encryptedData === undefined) {
      // to avoid crash in case of null or undefined
      return '';
    }
    // Disable Encryption in debug mode
    if (DEBUG_MODE_ENABLED && __DEV__) {
      return JSON.parse(encryptedData);
    }

    if (!isHardwareKeystoreExists) {
      return decryptWithForge(encryptedData, encryptionKey);
    }
    const decryptedData = await RNSecureKeystoreModule.decryptData(
      ENCRYPTION_ID,
      encryptedData,
    );
    return isIOS() ? base64.decode(decryptedData) : decryptedData;
  } catch (e) {
    console.error('error decryptJson:', e);

    if (e.toString().includes(BIOMETRIC_CANCELLED)) {
      throw new BiometricCancellationError(e.toString());
    }
    throw e;
  }
}

function encryptWithForge(text: string, key: string): EncryptedOutput {
  //iv - initialization vector
  const iv = forge.random.getBytesSync(16);
  const salt = forge.random.getBytesSync(128);
  const encryptionKey = forge.pkcs5.pbkdf2(key, salt, 4, 16);
  const cipher = forge.cipher.createCipher('AES-CBC', encryptionKey);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(text, 'utf8'));
  cipher.finish();
  const cipherText = forge.util.encode64(cipher.output.getBytes());
  const encryptedData = new EncryptedOutput(
    cipherText,
    forge.util.encode64(iv),
    forge.util.encode64(salt),
  );
  return encryptedData;
}

function decryptWithForge(encryptedData: string, key: string): string {
  const encryptedOutput = EncryptedOutput.fromString(encryptedData);
  const salt = forge.util.decode64(encryptedOutput.salt);
  const encryptionKey = forge.pkcs5.pbkdf2(key, salt, 4, 16);
  const decipher = forge.cipher.createDecipher('AES-CBC', encryptionKey);
  decipher.start({iv: forge.util.decode64(encryptedOutput.iv)});
  decipher.update(
    forge.util.createBuffer(forge.util.decode64(encryptedOutput.encryptedData)),
  );
  decipher.finish();
  const decryptedData = decipher.output.toString();
  return decryptedData;
}

export function hmacSHA(encryptionKey: string, data: string) {
  const hmac = forge.hmac.create();
  hmac.start('sha256', encryptionKey);
  hmac.update(data);
  const resultBytes = hmac.digest().getBytes().toString();
  return resultBytes;
}

export async function fetchKeyPair(keyType: any) {
  try {
    const {RNSecureKeystoreModule} = NativeModules;
    if (keyType == KeyTypes.RS256 || keyType == KeyTypes.ES256) {
      if (isAndroid()) {
        const publicKey = await RNSecureKeystoreModule.retrieveKey(keyType);
        return {
          publicKey: publicKey,
          privateKey: '',
        };
      } else {
        const keyPair = await RNSecureKeystoreModule.retrieveGenericKey(
          keyType,
        );
        let publicKey = keyPair[1];
        let privateKey = keyPair[0];
        if (keyType == KeyTypes.ES256) {
          publicKey = Buffer.from(publicKey, 'base64');
          privateKey = Buffer.from(privateKey, 'base64');
        }
        return {
          publicKey: publicKey,
          privateKey: privateKey,
        };
      }
    } else {
      const keyPair = await RNSecureKeystoreModule.retrieveGenericKey(keyType);
      const publicKey = Buffer.from(keyPair[1], 'base64');
      const privateKey = Buffer.from(keyPair[0], 'base64');
      return {
        publicKey: publicKey,
        privateKey: privateKey,
      };
    }
  } catch (error) {
    console.error('error getting key', error);
    if (error.toString().includes(BIOMETRIC_CANCELLED)) {
      throw new BiometricCancellationError(error.toString());
    }
    throw error;
  }
}
const convertToKeyValue = items => {
  const result = {};
  items.forEach((item, index) => {
    result[index] = item.value;
  });
  return result;
};
