import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {EntryTitle} from './EntryTitle';
import {OfflineCard} from './OfflineCard';
import {CodeOptions} from './CodeOptions';
import {CodeSelectionHelp} from './CodeSelectionHelp';
import {SessionEndedBanner} from './SessionEndedBanner';

const styles = Theme.ShareNearbyStyles;

export function ShareNearbyEntry({
  hasMdocCredential,
  hasEndedWithoutSharing,
  onDismissSessionEnded,
  onPresent,
  onReceive,
  onHelp,
}: {
  hasMdocCredential: boolean;
  hasEndedWithoutSharing: boolean;
  onDismissSessionEnded: () => void;
  onPresent: () => void;
  onReceive: () => void;
  onHelp: () => void;
}) {
  return (
    <View style={styles.content}>
      {hasEndedWithoutSharing && (
        <SessionEndedBanner onDismiss={onDismissSessionEnded} />
      )}
      <EntryTitle />
      <OfflineCard />
      <CodeOptions
        hasMdocCredential={hasMdocCredential}
        onPresent={onPresent}
        onReceive={onReceive}
      />
      <CodeSelectionHelp onHelp={onHelp} />
    </View>
  );
}
