import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import {__InjiVersion} from '../../shared/GlobalVariables';
import {
  ChoiceList,
  Page,
  PageModal,
  PageHeader,
} from '../../components/revamp/Page';
import {CheckIcon, CopyIcon} from '../../components/revamp/Icons';
import {ScaledText} from '../../components/revamp/ScaledText';
import {fonts, radii} from '../../components/revamp/tokens';
import {useRevampTheme} from '../../components/revamp/useRevampTheme';
import testIDProps from '../../shared/commonUtil';
import InjiHomeLogo from '../../assets/InjiHomeLogo.svg';

export const AboutInji: React.FC<AboutInjiProps> = ({appId, renderTrigger}) => {
  const {t} = useTranslation('AboutInji');
  const {c} = useRevampTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAppId = () => {
    Clipboard.setString(appId ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <React.Fragment>
      {renderTrigger?.(() => setIsOpen(true))}
      <PageModal visible={isOpen} onRequestClose={() => setIsOpen(false)}>
        <Page
          testID="aboutInji"
          header={
            <PageHeader title={t('header')} onBack={() => setIsOpen(false)} />
          }
          footer={
            <ScaledText style={[styles.footer, {color: c.inkMuted}]}>
              {t('footer')}
            </ScaledText>
          }>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.brand}>
              <InjiHomeLogo width={72} height={72} />
              <ScaledText style={[styles.name, {color: c.ink}]}>
                {t('appName')}
              </ScaledText>
              <ScaledText
                testID="tuvaliVersion"
                style={[styles.version, {color: c.inkMuted}]}>
                {t('versionLine', {version: __InjiVersion.getValue()})}
              </ScaledText>
            </View>
            <ScaledText
              testID="aboutDetails"
              style={[styles.details, {color: c.inkMuted}]}>
              {t('aboutDetails')}
            </ScaledText>
            <ChoiceList>
              <View style={styles.row} {...testIDProps('appID')}>
                <View style={styles.rowText}>
                  <ScaledText style={[styles.label, {color: c.inkMuted}]}>
                    {t('appID')}
                  </ScaledText>
                  <ScaledText style={[styles.appId, {color: c.ink}]}>
                    {appId}
                  </ScaledText>
                </View>
                <Pressable
                  {...testIDProps('copyAppId')}
                  accessibilityRole="button"
                  accessibilityLabel={t('copy')}
                  onPress={copyAppId}
                  style={[styles.copy, {backgroundColor: c.tintAzure}]}>
                  {copied ? (
                    <CheckIcon color={c.azureInk} size={16} />
                  ) : (
                    <CopyIcon color={c.azureInk} size={16} />
                  )}
                  <ScaledText style={[styles.copyText, {color: c.azureInk}]}>
                    {copied ? t('copied') : t('copy')}
                  </ScaledText>
                </Pressable>
              </View>
            </ChoiceList>
          </ScrollView>
        </Page>
      </PageModal>
    </React.Fragment>
  );
};

interface AboutInjiProps {
  /** Draws the row that opens the About page. */
  renderTrigger?: (open: () => void) => React.ReactNode;
  isVisible?: boolean;
  appId?: string;
}

const styles = StyleSheet.create({
  content: {paddingTop: 24, paddingBottom: 24, gap: 24},
  brand: {alignItems: 'center', gap: 8},
  name: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  version: {fontFamily: fonts.regular, fontSize: 14},
  details: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {flex: 1, gap: 2},
  label: {fontFamily: fonts.regular, fontSize: 12},
  appId: {fontFamily: fonts.mono, fontSize: 15, letterSpacing: 0.5},
  copy: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyText: {fontFamily: fonts.semibold, fontSize: 13},
  footer: {fontFamily: fonts.regular, fontSize: 12, textAlign: 'center'},
});
