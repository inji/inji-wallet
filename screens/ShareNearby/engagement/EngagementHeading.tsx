import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import type {EngagementStage} from './types';

const styles = Theme.ShareNearbyStyles;
const engagementStyles = Theme.ShareNearbyEngagementStyles;

export function EngagementHeading({stage}: {stage: EngagementStage}) {
  const {t} = useTranslation('ShareNearby');

  return (
    <>
      <Text
        weight="bold"
        style={[engagementStyles.heading, styles.centeredText]}>
        {t(`engagement.${stage}.title`)}
      </Text>
      <Text style={[styles.body, styles.centeredText]}>
        {t(`engagement.${stage}.description`)}
      </Text>
    </>
  );
}
