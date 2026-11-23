import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {ScrollView} from 'react-native';
import {ScanScreen} from '../../Scan/ScanScreen';
import {ShareNearbyEntry} from '../entry/ShareNearbyEntry';
import type {ShareTab} from './types';

const styles = Theme.ShareNearbyStyles;

export function ShareContent({
  selectedTab,
  hasMdocCredential,
  hasEndedWithoutSharing,
  onDismissSessionEnded,
  onPresent,
  onReceive,
  onHelp,
}: {
  selectedTab: ShareTab;
  hasMdocCredential: boolean;
  hasEndedWithoutSharing: boolean;
  onDismissSessionEnded: () => void;
  onPresent: () => void;
  onReceive: () => void;
  onHelp: () => void;
}) {
  if (selectedTab === 'scan') return <ScanScreen />;
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <ShareNearbyEntry
        hasMdocCredential={hasMdocCredential}
        hasEndedWithoutSharing={hasEndedWithoutSharing}
        onDismissSessionEnded={onDismissSessionEnded}
        onPresent={onPresent}
        onReceive={onReceive}
        onHelp={onHelp}
      />
    </ScrollView>
  );
}
