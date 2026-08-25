import {Linking, NativeModules} from 'react-native';
import {isIOS} from './constants';

export async function openURL(url: string): Promise<void> {
  await Linking.openURL(url);
}

export async function openURLInSelectedBrowser(url: string): Promise<void> {
  if (isIOS()) {
    await openURL(url);
    return;
  }

  const openedInChosenBrowser =
    await NativeModules.InjiOpenID4VP?.openRedirectUriInBrowser(url);

  if (!openedInChosenBrowser) {
    await openURL(url);
  }
}
