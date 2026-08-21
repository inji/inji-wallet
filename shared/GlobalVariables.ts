import ShortUniqueId from 'short-unique-id';
import {APP_ID_LENGTH, isIOS} from './constants';
import {NativeModules} from 'react-native';

function getTuvaliPackageDetails() {
  return isIOS() ? 'unknown' : NativeModules.VersionModule.getVersion();
}
export class __AppId {
  private static value: string;

  public static getValue(): string {
    return __AppId.value;
  }

  public static setValue(value: string) {
    this.value = value;
  }
}
export class __TuvaliVersion {
  private static packageDetails = getTuvaliPackageDetails();

  public static getpackageVersion(): string {
    return __TuvaliVersion.packageDetails;
  }

  public static getValue(): string {
    return this.getpackageVersion();
  }
}
export class __InjiVersion {
  private static value = "1.0.0-alpha.2";

  public static getValue(): string {
    return __InjiVersion.value;
  }
}
export class __SessionId {
  private static value = generateSessionId();

  public static getValue(): string {
    return __SessionId.value;
  }
}

function generateSessionId() {
  const shortUUID = new ShortUniqueId({
    length: APP_ID_LENGTH,
  });
  return shortUUID.randomUUID() + Date.now();
}
