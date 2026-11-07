import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import Copy from '../../../assets/shareNearby/copy.svg';
import Question from '../../../assets/shareNearby/question.svg';
import {IconTip} from '../IconTip';

const styles = Theme.ShareNearbyStyles;

/** Frame 44. */
export function RetentionHelp() {
  const {t} = useTranslation('ShareNearby');
  return (
    <>
      <Text style={styles.body}>{t('request.retentionDescription')}</Text>
      <IconTip
        icon={<Copy />}
        title={t('requestHelp.retentionMeaningTitle')}
        description={t('requestHelp.retentionMeaning')}
      />
      <IconTip
        icon={<Question width={16} height={16} />}
        title={t('requestHelp.retentionActionTitle')}
        description={t('requestHelp.retentionAction')}
      />
    </>
  );
}
