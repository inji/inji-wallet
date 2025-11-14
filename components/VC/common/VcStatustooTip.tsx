import React from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {Column, Row} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {Text} from '../../ui';
import {VC_STATUS_KEYS} from './VCUtils';
import ExpiredStatus from '../../../assets/Expired_Status.svg';
import RevokedStatus from '../../../assets/Revoked_Status.svg';
import ValidStatus from '../../../assets/Valid_Status.svg';
import PendingStatus from '../../../assets/Pending_Status.svg';

const statusIcons: Record<string, React.FC<any>> = {
  valid: ValidStatus,
  pending: PendingStatus,
  expired: ExpiredStatus,
  revoked: RevokedStatus,
};

export const StatusTooltipContent = () => {
  const {t} = useTranslation('ViewVcModal');

  return (
    <Column>
      {VC_STATUS_KEYS.map((key, index) => {
        const IconComponent = statusIcons[key];
        const isLast = index === VC_STATUS_KEYS.length - 1;
        return (
          <Row key={key} style={{width: '100%'}}>
            <View style={{marginRight: 6}}>
              <IconComponent width={20} height={20} />
            </View>
            <View
              style={{
                marginBottom: isLast ? 0 : 15,
                marginTop: 1,
                flexShrink: 1,
              }}>
              <Text weight="semibold" style={Theme.Styles.tooltipContentTitle}>
                {t(`statusToolTipContent.${key}.title`)}
              </Text>
              <Text
                weight="regular"
                style={[
                  Theme.Styles.tooltipContentDescription,
                  {marginTop: 3},
                ]}>
                {t(`statusToolTipContent.${key}.description`)}
              </Text>
            </View>
          </Row>
        );
      })}
    </Column>
  );
};
