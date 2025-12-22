import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_200ExtraLight,
  useFonts,
} from '@expo-google-fonts/montserrat';

export function useFont() {
  const [hasFontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_200ExtraLight
  });

  return hasFontsLoaded;
}
