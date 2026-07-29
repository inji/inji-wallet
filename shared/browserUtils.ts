import {Linking} from 'react-native';

export async function openURL(url: string): Promise<void> {
  await Linking.openURL(url);
}
