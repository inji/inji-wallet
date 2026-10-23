import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Glyph, Page, PageButton, PageHeader, PageHeading} from '../revamp/Page';
import {AlertCircleIcon, ShieldXIcon} from '../revamp/Icons';

/** The end of a download that didn't work: what happened, and the way on. */
export const DownloadFailed: React.FC<{
  testID: string;
  title: string;
  message: string;
  kind: 'verification' | 'connection' | 'generic';
  primary: {title: string; onPress: () => void; testID?: string};
  secondary?: {title: string; onPress: () => void; testID?: string};
  onClose?: () => void;
}> = ({testID, title, message, kind, primary, secondary, onClose}) => (
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
            variant="link"
            title={secondary.title}
            onPress={secondary.onPress}
          />
        ) : null}
      </>
    }>
    <View style={[styles.content, !onClose && styles.noHeader]}>
      <Glyph tone={kind === 'connection' ? 'warn' : 'fail'}>
        {colour =>
          kind === 'verification' ? (
            <ShieldXIcon color={colour} size={40} />
          ) : (
            <AlertCircleIcon color={colour} size={40} />
          )
        }
      </Glyph>
      <PageHeading testID={`${testID}Title`} title={title} body={message} />
    </View>
  </Page>
);

const styles = StyleSheet.create({
  content: {flex: 1, alignItems: 'center', paddingTop: 48, gap: 24},
  noHeader: {paddingTop: 108},
});
