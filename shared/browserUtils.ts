import {Linking, NativeModules, Share} from 'react-native';
import {isIOS} from './constants';

export async function openURL(url: string): Promise<void> {
  await Linking.openURL(url);
}

export async function openURLInSelectedBrowser(url: string): Promise<void> {
  if (isIOS()) {
    try {
      await Share.share({url, message: url});
    } catch (error) {
      console.warn('Error while showing the browser choice sheet:', error);
      await openURL(url);
    }
    return;
  }

  const openedInChosenBrowser =
    await NativeModules.InjiOpenID4VP?.openRedirectUriInBrowser?.(url);

  if (!openedInChosenBrowser) {
    await openURL(url);
  }
}
