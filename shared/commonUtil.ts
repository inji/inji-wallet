import argon2 from 'react-native-argon2';
import {AnyState} from 'xstate';
import {getDeviceNameSync} from 'react-native-device-info';
import {
  GOOGLE_DRIVE_NAME,
  ICLOUD_DRIVE_NAME,
  isAndroid,
  GMAIL,
  APPLE,
  FACE_SDK_MODEL_PATH,
  FACE_SDK_MODEL_CHECKSUM,
} from './constants';
import {generateSecureRandom} from 'react-native-securerandom';
import forge from 'node-forge';
import {CredentialSubject} from '../machines/VerifiableCredential/VCMetaMachine/vc';

export const hashData = async (
  data: string,
  salt: string,
  config: Argon2iConfig,
): Promise<string> => {
  const result = await argon2(data, salt, config);
  return result.rawHash as string;
};

export const generateRandomString = async () => {
  const randomBytes = await generateSecureRandom(64);
  const randomString = randomBytes.reduce(
    (acc, byte) => acc + byte.toString(16).padStart(2, '0'),
    '',
  );
  return randomString;
};
export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const generateBackupEncryptionKey = (
  password: string,
  salt: string,
  iterations: number,
  length: number,
) => forge.pkcs5.pbkdf2(password, salt, iterations, length);

export interface Argon2iConfig {
  iterations: number;
  memory: number;
  parallelism: number;
  hashLength: number;
  mode: string;
}

export default function testIDProps(id: string) {
  return isAndroid()
    ? {accessible: true, accessibilityLabel: id}
    : {testID: id};
}

export const removeWhiteSpace = (str: string) => {
  return str ? str.replace(/\s/g, '') : str;
};

export function logState(state: AnyState) {
  if (__DEV__) {
    const data = JSON.stringify(
      state.event,
      (key, value) => {
        if (key === 'type') return undefined;
        if (typeof value === 'string' && value.length >= 100) {
          return value.slice(0, 100) + '...';
        }
        return value;
      },
      2,
    );
    console.log(
      `[${getDeviceNameSync()}] ${state.machine?.id}: ${
        state.event.type
      } -> ${state.toStrings().pop()}\n${
        data.length > 300 ? data.slice(0, 300) + '...' : data
      }
      `,
    );
  }
}

export const getMaskedText = (id: string): string => {
  return '*'.repeat(id.length - 4) + id.slice(-4);
};

export const faceMatchConfig = () => {
  return {
    withFace: {
      encoder: {
        tfModel: {
          path: FACE_SDK_MODEL_PATH,
          inputWidth: 160,
          inputHeight: 160,
          outputLength: 512,
          modelChecksum: FACE_SDK_MODEL_CHECKSUM,
        },
      },
      matcher: {
        threshold: 1,
      },
    },
  };
};

export const getBackupFileName = () => {
  return `backup_${Date.now()}`;
};

export const BYTES_IN_MEGABYTE = 1000 * 1000;

export const bytesToMB = (bytes: number): string => {
  if (bytes <= 0) {
    return '0';
  }

  const megabytes = bytes / BYTES_IN_MEGABYTE;
  return Number(megabytes).toFixed(3);
};

export const getAccountType = () => (isAndroid() ? GMAIL : APPLE);

export const getDriveName = () =>
  isAndroid() ? GOOGLE_DRIVE_NAME : ICLOUD_DRIVE_NAME;

export function sleep(timeInMillSeconds = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeInMillSeconds));
}

export const getMosipIdentifier = (credentialSubject: CredentialSubject) => {
  return credentialSubject.UIN ? credentialSubject.UIN : credentialSubject.VID;
};

export const isTranslationKeyFound = (
  translationKey: string,
  t: (key: string) => string,
): boolean => {
  const translation = t(translationKey);
  return translation !== translationKey;
};
