import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Column} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {Text} from '../../ui';
import {VC_STATUS_KEYS} from './VCUtils';

export const StatusTooltipContent = () => {
  const {t} = useTranslation('ViewVcModal');

  return (
    <Column align="center" style={{marginTop: 20}}>
      {VC_STATUS_KEYS.map(key => (
        <View key={key} style={{marginBottom: 20}}>
          <Text weight="semibold">
            {t(`statusToolTipContent.${key}.title`)}
          </Text>
          <Text
            weight="regular"
            style={[Theme.Styles.tooltipContentDescription, {marginTop: 3}]}>
            {t(`statusToolTipContent.${key}.description`)}
          </Text>
        </View>
      ))}
    </Column>
  );
};
