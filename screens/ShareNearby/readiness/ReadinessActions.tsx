import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Button} from '../../../components/ui';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';

const styles = Theme.ShareNearbyStyles;

export function ReadinessActions({
  shouldOfferSettings,
  shouldRequestLocationConsent,
  isAnotherShareActive,
  onSettings,
  onRetry,
  onContinue,
  onCancel,
}: {
  shouldOfferSettings: boolean;
  shouldRequestLocationConsent: boolean;
  isAnotherShareActive: boolean;
  onSettings: () => void;
  onRetry: () => void;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={styles.actions}>
      {shouldOfferSettings && (
        <>
          <Button
            styles={styles.buttonContainer}
            type="gradient"
            title={t('readiness.settings')}
            testID="mdocOpenSettings"
            onPress={onSettings}
          />
          <Button
            styles={styles.buttonContainer}
            type="outline"
            title={t('retry')}
            testID="mdocReadinessRetry"
            onPress={onRetry}
          />
        </>
      )}
      {shouldRequestLocationConsent && (
        <Button
          styles={styles.buttonContainer}
          type="gradient"
          title={t('readiness.continue')}
          testID="mdocReadinessContinue"
          onPress={onContinue}
        />
      )}
      {isAnotherShareActive && (
        <Button
          styles={styles.buttonContainer}
          type="gradient"
          title={t('retry')}
          testID="mdocReadinessRetry"
          onPress={onRetry}
        />
      )}
      <Button
        styles={styles.buttonContainer}
        type="outline"
        title={t('cancel')}
        testID="mdocReadinessCancel"
        onPress={onCancel}
      />
    </View>
  );
}
