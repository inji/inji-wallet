import React from 'react';
import {Pressable, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Theme} from '../../../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import Scan from '../../../assets/shareNearby/scan.svg';
import Nearby from '../../../assets/shareNearby/nearby.svg';
import type {ShareTab} from './types';

const shareStyles = Theme.ShareNearbyShareStyles;

export function ShareTabs({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: ShareTab;
  onSelectTab: (tab: ShareTab) => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <View style={shareStyles.tabs} accessibilityRole="tablist">
      {(['scan', 'nearby'] as const).map(value => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{selected: selectedTab === value}}
          key={value}
          onPress={() => onSelectTab(value)}
          style={shareStyles.tab}>
          {value === 'scan' ? <Scan /> : <Nearby />}
          <Text
            weight={selectedTab === value ? 'semibold' : 'regular'}
            style={[
              shareStyles.tabText,
              selectedTab === value && shareStyles.activeText,
            ]}>
            {t(value)}
          </Text>
          {selectedTab === value && (
            <LinearGradient
              colors={Theme.Colors.GradientColors}
              start={Theme.LinearGradientDirection.start}
              end={Theme.LinearGradientDirection.end}
              style={shareStyles.activeIndicator}
            />
          )}
        </Pressable>
      ))}
    </View>
  );
}
