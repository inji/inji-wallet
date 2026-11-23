import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import type {MdocReadinessKind} from './MdocReadinessController';

const colors = Theme.ShareNearbyColors;
const styles = Theme.ShareNearbyStyles;

export function ReadinessStatus({
  readinessIssue,
  isCheckingReadiness,
}: {
  readinessIssue?: MdocReadinessKind;
  isCheckingReadiness: boolean;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={[styles.center, styles.flexible]}>
      {isCheckingReadiness && (
        <ActivityIndicator color={colors.accent} size="large" />
      )}
      <Text weight="bold" style={[styles.title, styles.centeredText]}>
        {t(
          readinessIssue
            ? `readiness.${readinessIssue}Title`
            : 'readiness.title',
        )}
      </Text>
      <Text style={[styles.body, styles.centeredText]}>
        {t(
          readinessIssue
            ? `readiness.${readinessIssue}Description`
            : 'readiness.description',
        )}
      </Text>
    </View>
  );
}
