import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {CardSkeleton} from '../revamp/CardSkeleton';
import {
  Page,
  PageButton,
  PageHeader,
  PageHeading,
  toneColours,
} from '../revamp/Page';
import {ScaledText} from '../revamp/ScaledText';
import {fonts, radii} from '../revamp/tokens';
import {useRevampTheme} from '../revamp/useRevampTheme';

/** The end of a download that didn't work: the empty card, what happened, and the way on. */
export const DownloadFailed: React.FC<{
  testID: string;
  title: string;
  message: string;
  kind: 'verification' | 'connection' | 'generic';
  primary: {title: string; onPress: () => void; testID?: string};
  secondary?: {title: string; onPress: () => void; testID?: string};
  onClose?: () => void;
}> = ({testID, title, message, kind, primary, secondary, onClose}) => {
  const {t} = useTranslation('IssuersScreen');
  const {c} = useRevampTheme();
  const fail = toneColours(c, 'fail');
  return (
    <Page
      testID={testID}
      header={onClose ? <PageHeader onClose={onClose} /> : undefined}
      footer={
        <>
          <PageButton
            testID={primary.testID}
            title={primary.title}
            onPress={primary.onPress}
          />
          {secondary ? (
            <PageButton
              testID={secondary.testID}
              variant="mutedLink"
              title={secondary.title}
              onPress={secondary.onPress}
            />
          ) : null}
        </>
      }>
      <View style={[styles.content, !onClose && styles.noHeader]}>
        <View>
          <CardSkeleton reduceMotion />
          <View style={[styles.pill, {backgroundColor: fail.bg}]}>
            <ScaledText style={[styles.pillText, {color: fail.fg}]}>
              {kind === 'verification'
                ? t('verificationFailedPill')
                : t('downloadFailedPill')}
            </ScaledText>
          </View>
        </View>
        <PageHeading
          testID={`${testID}Title`}
          size="medium"
          title={title}
          body={message}
        />
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  content: {flex: 1, alignItems: 'center', paddingTop: 48, gap: 28},
  noHeader: {paddingTop: 72},
  pill: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
  pillText: {fontFamily: fonts.semibold, fontSize: 12, lineHeight: 15},
});
