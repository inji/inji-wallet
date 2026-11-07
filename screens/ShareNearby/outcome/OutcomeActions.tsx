import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Button, Text} from '../../../components/ui';
import type {OutcomeLayout} from './outcomeConfig';
import {AutoHome} from './AutoHome';

const styles = Theme.ShareNearbyStyles;
const outcomeStyles = Theme.ShareNearbyOutcomeStyles;

export const AUTO_HOME_SECONDS = 10;

export function OutcomeActions({
  layout,
  footnote,
  onDone,
  onNewCode,
  onTurnOnBluetooth,
}: {
  layout: OutcomeLayout;
  footnote?: string;
  onDone: () => void;
  onNewCode: () => void;
  onTurnOnBluetooth: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  const isShared = layout.summary === 'shared';
  return (
    <View style={styles.actions}>
      {isShared && <AutoHome onDone={onDone} />}
      {layout.primary === 'done' ? (
        <>
          <Button
            styles={styles.buttonContainer}
            type="gradient"
            title={t('done')}
            onPress={onDone}
          />
          {!isShared && (
            <Button
              styles={styles.buttonContainer}
              type="clear"
              title={t('newCode')}
              onPress={onNewCode}
            />
          )}
        </>
      ) : (
        <>
          <Button
            styles={styles.buttonContainer}
            type="gradient"
            title={t(
              layout.primary === 'turnOnBluetooth'
                ? 'outcome.turnOnBluetooth'
                : 'newCode',
            )}
            onPress={
              layout.primary === 'turnOnBluetooth'
                ? onTurnOnBluetooth
                : onNewCode
            }
          />
          <Button
            styles={styles.buttonContainer}
            type="clear"
            title={t('done')}
            onPress={onDone}
          />
        </>
      )}
      {footnote ? (
        <Text style={[styles.small, outcomeStyles.footnote]}>{footnote}</Text>
      ) : null}
    </View>
  );
}
