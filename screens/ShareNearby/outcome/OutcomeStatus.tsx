import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {Theme} from '../../../components/ui/styleUtils';
import type {MdocOutcome} from '../../../machines/mdocPresentation/mdocPresentationModel';
import Check from '../../../assets/shareNearby/check.svg';
import Warning from '../../../assets/shareNearby/warning-amber.svg';
import Timer from '../../../assets/shareNearby/timer.svg';
import ErrorRed from '../../../assets/shareNearby/error-red.svg';
import BluetoothOff from '../../../assets/shareNearby/bluetooth-off.svg';
import Ban from '../../../assets/shareNearby/ban-grey.svg';
import Info from '../../../assets/shareNearby/info-grey.svg';
import Tick from '../../../assets/shareNearby/check.svg';
import type {OutcomeIcon} from './outcomeConfig';

const styles = Theme.ShareNearbyStyles;
const outcomeStyles = Theme.ShareNearbyOutcomeStyles;

function OutcomeBadge({icon}: {icon: OutcomeIcon}) {
  if (icon === 'success')
    return (
      <LinearGradient
        colors={Theme.Colors.GradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={outcomeStyles.successBadge}>
        <Check width={34} height={34} />
      </LinearGradient>
    );
  const tint =
    icon === 'warning' || icon === 'timer'
      ? outcomeStyles.amberTint
      : icon === 'error' || icon === 'bluetoothLost'
      ? outcomeStyles.redTint
      : outcomeStyles.greyTint;
  return (
    <View style={[outcomeStyles.iconTile, tint]}>
      {icon === 'warning' && <Warning />}
      {icon === 'timer' && <Timer width={28} height={28} />}
      {icon === 'error' && <ErrorRed />}
      {icon === 'bluetoothLost' && <BluetoothOff />}
      {icon === 'bluetoothOff' && (
        <BluetoothOff color={Theme.ShareNearbyColors.secondary} />
      )}
      {icon === 'declined' && <Ban />}
      {icon === 'info' && <Info />}
    </View>
  );
}

export function OutcomeStatus({
  outcome,
  icon,
  hasTips,
  tipsTitleKey = 'outcome.tipsTitle',
}: {
  outcome: MdocOutcome;
  icon: OutcomeIcon;
  hasTips?: boolean;
  tipsTitleKey?: string;
}) {
  const {t} = useTranslation('ShareNearby');
  const tips = hasTips
    ? (t(`outcome.${outcome}.tips`, {
        returnObjects: true,
        defaultValue: [],
      }) as string[])
    : [];
  return (
    <View style={[styles.center, outcomeStyles.main]}>
      <OutcomeBadge icon={icon} />
      <Text weight="bold" style={[styles.title, styles.centeredText]}>
        {t(`outcome.${outcome}.title`)}
      </Text>
      <Text style={[styles.body, styles.centeredText]}>
        {t(`outcome.${outcome}.description`)}
      </Text>
      {Array.isArray(tips) && tips.length > 0 && (
        <View style={outcomeStyles.tips}>
          <Text weight="semibold" style={outcomeStyles.tipsTitle}>
            {t(tipsTitleKey)}
          </Text>
          {tips.map(tip => (
            <View key={tip} style={outcomeStyles.tipRow}>
              <Tick color={Theme.ShareNearbyColors.detailTick} />
              <Text style={[styles.flexible, outcomeStyles.tipText]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
