import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import Verified from '../../../assets/shareNearby/verified.svg';

const outcomeStyles = Theme.ShareNearbyOutcomeStyles;

function SummaryRow({
  label,
  value,
  isLast,
  leading,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  leading?: React.ReactNode;
}) {
  return (
    <View style={[outcomeStyles.summaryRow, !isLast && outcomeStyles.rowLine]}>
      <Text style={outcomeStyles.summaryLabel}>{label}</Text>
      <View style={outcomeStyles.summaryValueRow}>
        {leading}
        <Text weight="semibold" style={outcomeStyles.summaryValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function OutcomeRequestSummary({
  verifierName,
  isVerifiedVerifier,
  detailsLabel,
  detailsValue,
  time,
}: {
  verifierName: string;
  isVerifiedVerifier: boolean;
  detailsLabel: string;
  detailsValue: string;
  time: string;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={outcomeStyles.summary}>
      <SummaryRow
        label={t('outcome.requestFrom')}
        value={verifierName}
        leading={isVerifiedVerifier ? <Verified /> : undefined}
      />
      <SummaryRow label={detailsLabel} value={detailsValue} />
      <SummaryRow label={t('outcome.time')} value={time} isLast />
    </View>
  );
}
