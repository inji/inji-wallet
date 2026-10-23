import React, {useState} from 'react';
import {
  I18nManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import i18next, {i18n} from 'i18next';
import RNRestart from 'react-native-restart';
import {SUPPORTED_LANGUAGES} from '../i18n';
import {setItem} from '../machines/store';
import {ChoiceList, ChoiceRow, Page, PageHeader} from './revamp/Page';
import {ScaledText} from './revamp/ScaledText';
import {fonts} from './revamp/tokens';
import {useRevampTheme} from './revamp/useRevampTheme';

/** Languages written right to left, whose names align right in the lists. */
export const RTL_LANGUAGES = ['ar'];

/** The trigger opens a page listing the app's languages; choosing one applies it and goes back. */
export const LanguageSelector: React.FC<LanguageSelectorProps> = props => {
  const {i18n} = useTranslation();
  const {t} = useTranslation('SettingScreen');
  const {c} = useRevampTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setIsOpen(true)}>
        {props.triggerComponent}
      </Pressable>
      <Modal
        visible={isOpen}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}>
        <Page
          testID="languages"
          header={
            <PageHeader title={t('language')} onBack={() => setIsOpen(false)} />
          }>
          <ScrollView contentContainerStyle={styles.content}>
            <ChoiceList>
              {Object.entries(SUPPORTED_LANGUAGES).map(([value, label]) => (
                <ChoiceRow
                  key={value}
                  testID={`language-${value}`}
                  label={label}
                  mark="check"
                  rtl={RTL_LANGUAGES.includes(value)}
                  selected={i18n.language === value}
                  onPress={() => {
                    setIsOpen(false);
                    changeLanguage(i18n, value);
                  }}
                />
              ))}
            </ChoiceList>
            <ScaledText style={[styles.hint, {color: c.inkMuted}]}>
              {t('languageHint')}
            </ScaledText>
          </ScrollView>
        </Page>
      </Modal>
    </>
  );
};

export const changeLanguage = async (i18n: i18n, language: string) => {
  if (language !== i18n.language) {
    await i18n.changeLanguage(language).then(async () => {
      await setItem('language', i18n.language, '');
      const isRTL = i18next.dir(language) === 'rtl';
      if (isRTL !== I18nManager.isRTL) {
        try {
          I18nManager.forceRTL(isRTL);
          setTimeout(() => {
            RNRestart.Restart();
          }, 150);
        } catch (e) {
          console.error('error while changing text direction ', e);
        }
      }
    });
  }
};

interface LanguageSelectorProps {
  triggerComponent: React.ReactElement;
}

const styles = StyleSheet.create({
  content: {paddingTop: 12, paddingBottom: 24, gap: 12},
  hint: {fontFamily: fonts.regular, fontSize: 13, paddingHorizontal: 4},
});
