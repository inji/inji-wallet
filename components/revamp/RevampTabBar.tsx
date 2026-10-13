import React, {useEffect, useState} from 'react';
import {
  DeviceEventEmitter,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import Svg, {Defs, Path, RadialGradient, Stop} from 'react-native-svg';
import {Copilot} from '../ui/Copilot';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {
  ActivityIcon,
  HomeIcon,
  IssuersIcon,
  ScanIcon,
  SettingsIcon,
} from './Icons';
import {fonts, radii} from './tokens';
import {useRevampTheme} from './useRevampTheme';

const BAR_HEIGHT = 104;
const SCAN_SIZE = 58;
const HALO_SIZE = 128;
const RAYS = 40;

/** Asks the home screen to open the issuer list, as its add button does. */
export const OPEN_ISSUERS_EVENT = 'revamp.openIssuers';

/** Screens inside a tab that hide the bar, as the issuer list always has. */
const FULL_SCREEN_ROUTES = ['IssuersScreen'];

/** The bar's outline: a pill with a round notch cut in the top for the scan button. */
function outline(w: number) {
  const cx = w / 2;
  return [
    `M50 32H${cx - 42.25}`,
    `A8 8 0 0 1 ${cx - 34.39} 38.51`,
    `A35 35 0 0 0 ${cx + 34.39} 38.51`,
    `A8 8 0 0 1 ${cx + 42.25} 32`,
    `H${w - 50}A30 30 0 0 1 ${w - 50} 92H50A30 30 0 0 1 50 32Z`,
  ].join('');
}

/** Thin rays fanning out from behind the scan button, fading towards the edge. */
const Halo: React.FC<{colour: string}> = ({colour}) => {
  const r = HALO_SIZE / 2;
  const ray = (i: number) => {
    const a0 = (i * 360) / RAYS;
    const a1 = a0 + 2.5;
    const p = (deg: number) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      return `${r + r * Math.cos(rad)} ${r + r * Math.sin(rad)}`;
    };
    return `M${r} ${r}L${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}Z`;
  };
  const rays = Array.from({length: RAYS}, (_, i) => ray(i)).join('');
  // A gradient fill rather than a mask: Android composites a mask offscreen on every frame.
  return (
    <Svg width={HALO_SIZE} height={HALO_SIZE}>
      <Defs>
        <RadialGradient
          id="fade"
          cx={r}
          cy={r}
          r={r}
          gradientUnits="userSpaceOnUse">
          <Stop offset="0.3" stopColor={colour} stopOpacity={0.09} />
          <Stop offset="0.68" stopColor={colour} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path d={rays} fill="url(#fade)" />
    </Svg>
  );
};

interface Tab {
  key: string;
  label: string;
  icon: (colour: string, on: boolean) => React.ReactNode;
  onPress: () => void;
  on: boolean;
  copilot?: string;
}

/**
 * The app's bottom bar: Home and Activity, a raised Scan button in a notch, then Issuers and
 * Settings. Plugged into the tab navigator through its `tabBar` prop, so the screens and routes
 * stay as they are.
 */
export const RevampTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const {c} = useRevampTheme();
  const {t} = useTranslation('MainLayout');
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboard(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboard(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const focused = state.routes[state.index];
  const tabBarStyle = StyleSheet.flatten(
    descriptors[focused.key]?.options.tabBarStyle,
  ) as {display?: string} | undefined;
  const nested = getFocusedRouteNameFromRoute(focused);
  if (
    keyboard ||
    tabBarStyle?.display === 'none' ||
    (nested && FULL_SCREEN_ROUTES.includes(nested))
  ) {
    return null;
  }

  const go = (name: string) => {
    const route = state.routes.find(r => r.name === name);
    if (!route) return;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (focused.name !== name && !event.defaultPrevented)
      navigation.navigate(name);
  };

  const tab = (
    name: string,
    label: string,
    icon: Tab['icon'],
    copilot?: string,
  ): Tab => ({
    key: name,
    label,
    icon,
    on: focused.name === name,
    onPress: () => go(name),
    copilot,
  });
  const left: Tab[] = [
    tab(BOTTOM_TAB_ROUTES.home, 'Home', (col, on) => (
      <HomeIcon color={col} filled={on} strokeWidth={on ? 2 : 1.6} />
    )),
    tab(
      BOTTOM_TAB_ROUTES.history,
      'Activity',
      (col, on) => <ActivityIcon color={col} strokeWidth={on ? 2 : 1.6} />,
      'history',
    ),
  ];
  const right: Tab[] = [
    {
      key: 'issuers',
      label: 'Issuers',
      icon: (col, on) => <IssuersIcon color={col} strokeWidth={on ? 2 : 1.6} />,
      on: false,
      onPress: () => {
        go(BOTTOM_TAB_ROUTES.home);
        DeviceEventEmitter.emit(OPEN_ISSUERS_EVENT);
      },
    },
    tab(
      BOTTOM_TAB_ROUTES.settings,
      'Settings',
      (col, on) => <SettingsIcon color={col} strokeWidth={on ? 2 : 1.6} />,
      'settings',
    ),
  ];
  const copilotIndex = (name: string) =>
    state.routes.findIndex(r => r.name === name);

  const renderTab = (item: Tab) => {
    const colour = item.on ? c.sel : c.inkMuted;
    const button = (
      <Pressable
        key={item.key}
        onPress={item.onPress}
        accessibilityRole="tab"
        accessibilityLabel={item.label}
        accessibilityState={{selected: item.on}}
        testID={item.key}
        style={styles.tab}>
        {item.icon(colour, item.on)}
        <Text
          style={[
            styles.label,
            {
              color: colour,
              fontFamily: item.on ? fonts.semibold : fonts.regular,
            },
          ]}>
          {item.label}
        </Text>
      </Pressable>
    );
    if (!item.copilot) return button;
    return (
      <Copilot
        key={item.key}
        title={t(`copilot:${item.copilot}Title`)}
        description={t(`copilot:${item.copilot}Message`)}
        order={1 + copilotIndex(item.copilot)}
        targetStyle={{flex: 1}}>
        {button}
      </Copilot>
    );
  };

  return (
    <View
      style={{height: BAR_HEIGHT + insets.bottom, backgroundColor: c.canvas}}>
      <View
        style={[styles.halo, {left: width / 2 - HALO_SIZE / 2}]}
        pointerEvents="none">
        <Halo colour={c.ink} />
      </View>
      <View style={styles.shape} pointerEvents="none">
        <Svg width={width} height={BAR_HEIGHT}>
          <Path
            d={outline(width)}
            fill={c.card}
            stroke={c.line}
            strokeWidth={1}
          />
        </Svg>
      </View>
      <View style={styles.nav} accessibilityRole="tablist">
        <View style={styles.half}>{left.map(renderTab)}</View>
        <View style={{width: 88}} />
        <View style={styles.half}>{right.map(renderTab)}</View>
      </View>
      <Copilot
        title={t(`copilot:${BOTTOM_TAB_ROUTES.share}Title`)}
        description={t(`copilot:${BOTTOM_TAB_ROUTES.share}Message`)}
        order={1 + copilotIndex(BOTTOM_TAB_ROUTES.share)}
        targetStyle={[styles.scanWrap, {left: width / 2 - SCAN_SIZE / 2}]}>
        <Pressable
          onPress={() => go(BOTTOM_TAB_ROUTES.share)}
          accessibilityRole="button"
          accessibilityLabel="Scan"
          testID={BOTTOM_TAB_ROUTES.share}
          style={({pressed}) => [
            styles.scan,
            {backgroundColor: c.primary},
            pressed && {transform: [{scale: 0.95}]},
          ]}>
          <ScanIcon color={c.onPrimary} />
        </Pressable>
      </Copilot>
    </View>
  );
};

const styles = StyleSheet.create({
  halo: {position: 'absolute', top: -32, width: HALO_SIZE, height: HALO_SIZE},
  shape: {
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#0a3970',
    shadowOpacity: 0.22,
    shadowRadius: 11,
    shadowOffset: {width: 0, height: 14},
  },
  nav: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 32,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  half: {flex: 1, flexDirection: 'row'},
  tab: {
    flex: 1,
    minHeight: 48,
    marginHorizontal: 2,
    paddingTop: 5,
    paddingBottom: 4,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {fontSize: 12, lineHeight: 14},
  scanWrap: {
    position: 'absolute',
    top: 3,
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: radii.pill,
  },
  scan: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0a3970',
    shadowOpacity: 0.5,
    shadowRadius: 13,
    shadowOffset: {width: 0, height: 10},
    elevation: 8,
  },
});
