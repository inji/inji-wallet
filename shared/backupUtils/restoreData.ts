import { DocumentDirectoryPath } from "react-native-fs";
import { EXPIRED_VC_ERROR_CODE, MY_VCS_STORE_KEY } from "../constants";
import { decryptJson, encryptJson } from "../cryptoutil/cryptoUtil";
import fileStorage from "../fileStorage";
import Storage, { MMKV } from "../storage";
import { TelemetryConstants } from "../telemetry/TelemetryConstants";
import { getErrorEventData, sendErrorEvent } from "../telemetry/TelemetryUtils";
import { VCMetadata } from "../VCMetadata";
import { verifyCredentialData } from "../openId4VCI/Utils";
import { RevocationStatus } from "../vcVerifier/VcVerifier";

export async function loadBackupData(
    data: string,
    encryptionKey: string,
  ): Promise<any> {
    const PREV_BACKUP_STATE_PATH = `${DocumentDirectoryPath}/.prev`;
    try {
      await handlePreviousBackup(PREV_BACKUP_STATE_PATH, encryptionKey);
      const completeBackupData = JSON.parse(data);
      const backupStartState = Date.now().toString();
      await fileStorage.writeFile(PREV_BACKUP_STATE_PATH, backupStartState);
      const dataFromDB = await loadVCs(completeBackupData, encryptionKey);
      await updateWellKnownConfigs(dataFromDB, encryptionKey);
    } catch (error) {
      console.error('Error while loading backup data:', error);
      throw error;
    }
  }

/**
   * Handle cleanup of previous backup state
   * @param prevBackupStatePath Path to previous backup state file
   * @param encryptionKey Encryption key
   * @returns Previous restore timestamp
   */
async function handlePreviousBackup(
    prevBackupStatePath: string,
    encryptionKey: string,
  ) {
    const previousBackupExists = await fileStorage.exists(prevBackupStatePath);
    if (previousBackupExists) {
      const previousRestoreTimestamp = await fileStorage.readFile(
        prevBackupStatePath,
      );
      const timestampNum = parseInt(previousRestoreTimestamp.trim());
      await unloadVCs(encryptionKey, timestampNum);
    }
  }

  /**
   * Unload Verifiable Credentials based on a cutoff timestamp
   * @param encryptionKey Encryption key
   * @param cutOffTimestamp Timestamp to use as cutoff
   */
  async function unloadVCs(
    encryptionKey: string,
    cutOffTimestamp: number,
  ) {
    try {
      await removeOldVCFiles(cutOffTimestamp);
      await removeVCMetadataFromDB(encryptionKey, cutOffTimestamp);
    } catch (error) {
      console.error('Error while unloading VCs:', error);
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.dataRestore,
          TelemetryConstants.ErrorId.failure,
          error.message,
        ),
      );
      throw error;
    }
  }

  /**
   * Remove VC files created after the cutoff timestamp
   * @param cutOffTimestamp Timestamp to use as cutoff
   */
  async function removeOldVCFiles(cutOffTimestamp: number) {
    const vcDirectory = `${DocumentDirectoryPath}/inji/VC/`;
    const files = await fileStorage.getAllFilesInDirectory(vcDirectory);

    const filesToRemove = files.filter(file => {
      const fileName = file.name.split('.')[0];
      const fileTimestamp = parseInt(fileName.split('_')[1]);
      return fileTimestamp >= cutOffTimestamp;
    });

    await Promise.all(
      filesToRemove.map(file => fileStorage.removeItem(file.path)),
    );
  }

  /**
   * Update MMKV store to remove VCs after cutoff timestamp
   * @param encryptionKey Encryption key
   * @param cutOffTimestamp Timestamp to use as cutoff
   */
  async function removeVCMetadataFromDB(
    encryptionKey: any,
    cutOffTimestamp: number,
  ) {
    const myVCsEnc = await MMKV.getItem(MY_VCS_STORE_KEY, encryptionKey);

    if (myVCsEnc === null) return;

    const mmkvVCs = await decryptJson(encryptionKey, myVCsEnc);
    const vcList: VCMetadata[] = JSON.parse(mmkvVCs);
    const newVCList = vcList.filter(
      vc => !vc.timestamp || parseInt(vc.timestamp) < cutOffTimestamp,
    );
    const finalVC = await encryptJson(encryptionKey, JSON.stringify(newVCList));
    await MMKV.setItem(MY_VCS_STORE_KEY, finalVC);
  }

  /**
   * Handle cleanup of previous backup state
   * @param completeBackupData Entire Backup data to be loaded
   * @param encryptionKey Encryption key
   * @returns Previous
   */
  async function loadVCs(
    completeBackupData: Record<string, any>,
    encryptionKey: string,
  ): Promise<Record<string, any> | undefined> {
    try {
      const {VC_Records: allVCs, dataFromDB: dataFromDB} = completeBackupData;

      await processAndStoreVCs(allVCs, dataFromDB, encryptionKey);
      await updateMyVcList(dataFromDB, encryptionKey);
      await fileStorage.removeItemIfExist(`${DocumentDirectoryPath}/.prev`);
      return dataFromDB;
    } catch (error) {
      console.error('Error while loading VCs:', error);
      sendErrorEvent(
        getErrorEventData(
          TelemetryConstants.FlowType.dataBackup,
          TelemetryConstants.ErrorId.failure,
          error.message,
        ),
      );
      throw error;
    }
  }

  /**
   * Process and store individual Verifiable Credentials
   * @param allVCs All Verifiable Credentials from backup
   * @param dataFromDB Database data containing VC metadata
   * @param encryptionKey Encryption key
   */
  async function processAndStoreVCs(
    allVCs: Record<string, any>,
    dataFromDB: Record<string, any>,
    encryptionKey: string,
  ) {
    const vcKeys = Object.keys(allVCs);

    await Promise.all(
      vcKeys.map(async key => {
        const vcData = allVCs[key];
        // Add randomness to timestamp to maintain uniqueness
        const timestamp = Date.now() + Math.random().toString().substring(2, 10);
        const prevUnixTimeStamp = vcData.vcMetadata.timestamp;

      //verify the credential and update the metadata
      const verifiableCredential =
        vcData.verifiableCredential?.credential || vcData.verifiableCredential;
      const verificationResult = await verifyCredentialData(
        verifiableCredential,
        vcData.vcMetadata.format,
      );
      const isVerified = verificationResult.isVerified;
      const isRevoked = verificationResult.isRevoked ?? RevocationStatus.FALSE;
      const isExpired =
        verificationResult.verificationErrorCode === EXPIRED_VC_ERROR_CODE;
      vcData.vcMetadata.timestamp = timestamp;
      vcData.vcMetadata.isVerified = isVerified;

      //update the vcMetadata
      dataFromDB.myVCs.forEach(myVcMetadata => {
        if (
          myVcMetadata.requestId === vcData.vcMetadata.requestId &&
          myVcMetadata.timestamp === prevUnixTimeStamp
        ) {
          myVcMetadata.timestamp = timestamp;
          myVcMetadata.isVerified = isVerified;
          myVcMetadata.isRevoked = isRevoked;
          myVcMetadata.isExpired = isExpired;
          myVcMetadata.lastKnownStatusTimestamp = new Date().toISOString();
        }
      });

        // Encrypt and store the VC
        const updatedVcKey = new VCMetadata(vcData.vcMetadata).getVcKey();
        const encryptedVC = await encryptJson(
          encryptionKey,
          JSON.stringify(vcData),
        );
        await Storage.setItem(updatedVcKey, encryptedVC, encryptionKey);
      }),
    );
  }

  /**
   * Update MMKV store with new VC metadata
   * @param dataFromDB Database data containing VC metadata
   * @param encryptionKey Encryption key
   */
  async function updateMyVcList(
    dataFromDB: Record<string, any>,
    encryptionKey: string,
  ) {
    const dataFromMyVCKey = dataFromDB[MY_VCS_STORE_KEY];
    const encryptedMyVCKeyFromMMKV = await MMKV.getItem(MY_VCS_STORE_KEY);

    let newDataForMyVCKey: VCMetadata[];

    if (encryptedMyVCKeyFromMMKV != null) {
      const myVCKeyFromMMKV = await decryptJson(
        encryptionKey,
        encryptedMyVCKeyFromMMKV,
      );

      newDataForMyVCKey = [...JSON.parse(myVCKeyFromMMKV), ...dataFromMyVCKey];
    } else {
      newDataForMyVCKey = dataFromMyVCKey;
    }
    const encryptedDataForMyVCKey = await encryptJson(
      encryptionKey,
      JSON.stringify(newDataForMyVCKey),
    );

    await Storage.setItem(
      MY_VCS_STORE_KEY,
      encryptedDataForMyVCKey,
      encryptionKey,
    );
  }

  /**
   * Update Well Known configs for cached issuers
   * @param dataFromDB Database data
   * @param encryptionKey Encryption key
   */
  async function updateWellKnownConfigs(
    dataFromDB: Record<string, any>,
    encryptionKey: string,
  ) {
    const cacheKeys = Object.keys(dataFromDB).filter(key =>
      key.includes('CACHE_FETCH_ISSUER_WELLKNOWN_CONFIG_'),
    );

    await Promise.all(
      cacheKeys.map(async key => {
        const value = dataFromDB[key];
        const encryptedValue = await encryptJson(
          encryptionKey,
          JSON.stringify(value),
        );
        await Storage.setItem(key, encryptedValue, encryptionKey);
      }),
    );
}