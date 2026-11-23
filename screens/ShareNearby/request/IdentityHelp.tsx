import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {VerifierTrustBadge} from './VerifierTrustBadge';

const styles = Theme.ShareNearbyStyles;
const helpStyles = Theme.ShareNearbyHelpStyles;

export function IdentityHelp() {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={helpStyles.content}>
      <Text style={styles.body}>{t('requestHelp.identityIntro')}</Text>
      {(['verified', 'unverified', 'invalid'] as const).map(status => (
        <View key={status} style={helpStyles.trustExplanation}>
          <VerifierTrustBadge status={status} />
          <Text style={helpStyles.description}>
            {t(`requestHelp.identityDescription.${status}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}
