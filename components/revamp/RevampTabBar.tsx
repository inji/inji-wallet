import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {ScaledText} from './ScaledText';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Copilot} from '../ui/Copilot';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {COPILOT_SCAN_STEP} from '../../shared/constants';
import {ActivityIcon, HomeIcon, ScanIcon, SettingsIcon} from './Icons';
import {fonts, radii, shadows, SLOT_LABEL_MAX_SCALE} from './tokens';
import {useRevampTheme} from './useRevampTheme';

const BAR_HEIGHT = 104;
/** Space a screen leaves at its bottom so its last content can scroll clear of the bar. */
export const TAB_BAR_SPACE = BAR_HEIGHT;
const NAV_TOP = 30;
const NAV_HEIGHT = 56;
const NAV_PAD = 3;
const TAB_HEIGHT = 48;
const CLOSED_TAB = 48;
const SCAN_SIZE = 56;
const SCAN_GAP = 12;
const DESIGN_NAV_WIDTH = 234;
const MIN_SIDE_MARGIN = 12;
const SLIDE = {duration: 500, easing: Easing.bezier(0.22, 1, 0.36, 1)};

/** Screens inside a tab that hide the bar, as the issuer list always has. */
const FULL_SCREEN_ROUTES = ['IssuersScreen'];

interface Tab {
  route: string;
  label: string;
  icon: (colour: string, on: boolean) => React.ReactNode;
  copilot?: string;
}

const TABS: Tab[] = [
  {
    route: BOTTOM_TAB_ROUTES.home,
    label: 'Home',
    icon: (col, on) => (
      <HomeIcon color={col} filled={on} strokeWidth={on ? 2.5 : 2.2} />
    ),
  },
  {
    route: BOTTOM_TAB_ROUTES.history,
    label: 'Activity',
    icon: (col, on) => (
      <ActivityIcon color={col} strokeWidth={on ? 2.5 : 2.2} />
    ),
    copilot: 'history',
  },
  {
    route: BOTTOM_TAB_ROUTES.settings,
    label: 'Settings',
    icon: (col, on) => (
      <SettingsIcon color={col} strokeWidth={on ? 2.5 : 2.2} />
    ),
    copilot: 'settings',
  },
];

/**
 * The app's bottom bar: a pill of Home, Activity and Settings where the current tab opens up to
 * show its label under a sliding highlight, with Scan as its own button on the right. Plugged
 * into the tab navigator through its `tabBar` prop, so the screens and routes stay as they are.
 */
export const RevampTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const {c, reduceMotion} = useRevampTheme();
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

  // The pill keeps the design's width where it fits, and narrows on small phones.
  const navWidth = Math.min(
    DESIGN_NAV_WIDTH,
    width - 2 * MIN_SIDE_MARGIN - SCAN_GAP - SCAN_SIZE,
  );
  // Inside the border and padding: two closed tabs, the open one, and a gap between each.
  const openTab = navWidth - 2 - 2 * NAV_PAD - 2 * CLOSED_TAB - 2 * NAV_PAD;
  const left = (width - navWidth - SCAN_GAP - SCAN_SIZE) / 2;

  const focused = state.routes[state.index];
  const tabIndex = TABS.findIndex(tab => tab.route === focused.name);
  const activeIndex = Math.max(0, tabIndex);

  const tabBarStyle = StyleSheet.flatten(
    descriptors[focused.key]?.options.tabBarStyle,
  ) as {display?: string} | undefined;
  const nested = getFocusedRouteNameFromRoute(focused);
  const hidden =
    keyboard ||
    tabBarStyle?.display === 'none' ||
    // The share flow (scanner, choosing what to share, sending) is full screen, with its
    // own close buttons and bottom actions that the floating bar would cover.
    focused.name === BOTTOM_TAB_ROUTES.share ||
    (!!nested && FULL_SCREEN_ROUTES.includes(nested));

  const slide = useRef(new Animated.Value(activeIndex)).current;
  // Hiding the bar unmounts its views, which stops a slide part way; the bar would then come
  // back highlighting the tab it left, so while hidden it jumps straight to the current tab.
  useEffect(() => {
    if (reduceMotion || hidden) slide.setValue(activeIndex);
    else
      Animated.timing(slide, {
        toValue: activeIndex,
        ...SLIDE,
        useNativeDriver: false,
      }).start();
  }, [activeIndex, hidden]);

  if (hidden) return null;

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
  const copilotOrder = (name: string) =>
    1 + state.routes.findIndex(r => r.name === name);

  const renderTab = (tab: Tab, i: number) => {
    const on = i === tabIndex;
    const colour = on ? c.sel : c.inkMuted;
    // 0 while this tab is the open one, 1 while it is a closed icon.
    const closed = slide.interpolate({
      inputRange: [i - 1, i, i + 1],
      outputRange: [1, 0, 1],
      extrapolate: 'clamp',
    });
    const button = (
      <Pressable
        key={tab.route}
        onPress={() => go(tab.route)}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{selected: on}}
        testID={tab.route}>
        <Animated.View
          style={[
            styles.tab,
            {
              width: closed.interpolate({
                inputRange: [0, 1],
                outputRange: [openTab, CLOSED_TAB],
              }),
            },
          ]}>
          {tab.icon(colour, on)}
          <Animated.View
            style={{
              overflow: 'hidden',
              maxWidth: closed.interpolate({
                inputRange: [0, 1],
                outputRange: [openTab - 22 - 2 * 13 - 7, 0],
              }),
              marginLeft: closed.interpolate({
                inputRange: [0, 1],
                outputRange: [7, 0],
              }),
              opacity: closed.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [1, 0, 0],
              }),
            }}>
            <ScaledText
              numberOfLines={1}
              maxFontSizeMultiplier={SLOT_LABEL_MAX_SCALE}
              style={[styles.label, {color: colour}]}>
              {tab.label}
            </ScaledText>
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
    if (!tab.copilot) return button;
    return (
      <Copilot
        key={tab.route}
        title={t(`copilot:${tab.copilot}Title`)}
        description={t(`copilot:${tab.copilot}Message`)}
        order={copilotOrder(tab.copilot)}>
        {button}
      </Copilot>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, {height: BAR_HEIGHT + insets.bottom}]}>
      <View
        accessibilityRole="tablist"
        style={[
          styles.nav,
          shadows.raised,
          {left, width: navWidth, backgroundColor: c.card, borderColor: c.line},
        ]}>
        {tabIndex >= 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.highlight,
              {
                width: openTab,
                backgroundColor: c.tintAzure,
                transform: [
                  {
                    translateX: slide.interpolate({
                      inputRange: [0, TABS.length - 1],
                      outputRange: [
                        0,
                        (TABS.length - 1) * (CLOSED_TAB + NAV_PAD),
                      ],
                    }),
                  },
                ],
              },
            ]}
          />
        ) : null}
        {TABS.map(renderTab)}
      </View>
      <View style={[styles.scanWrap, {left: left + navWidth + SCAN_GAP}]}>
        <Copilot
          title={t('copilot:scanToShareTitle')}
          description={t('copilot:scanToShareMessage')}
          order={COPILOT_SCAN_STEP}
          targetStyle={{borderRadius: radii.pill}}>
          <Pressable
            // Opens the Share tab's scanner: verifier requests online (OpenID4VP) or over
            // Bluetooth, and QR login.
            onPress={() => go(BOTTOM_TAB_ROUTES.share)}
            accessibilityRole="button"
            accessibilityLabel={t('copilot:scanToShareTitle')}
            testID="scanToShare"
            style={({pressed}) => [
              styles.scan,
              shadows.raised,
              {backgroundColor: c.primary},
              pressed && {transform: [{scale: 0.95}]},
            ]}>
            <ScanIcon color={c.onPrimary} size={25} strokeWidth={2.4} />
          </Pressable>
        </Copilot>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {position: 'absolute', left: 0, right: 0, bottom: 0},
  nav: {
    position: 'absolute',
    top: NAV_TOP,
    height: NAV_HEIGHT,
    borderRadius: radii.pill,
    borderWidth: 1,
    padding: NAV_PAD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  highlight: {
    position: 'absolute',
    left: NAV_PAD,
    top: NAV_PAD,
    height: TAB_HEIGHT,
    borderRadius: radii.pill,
  },
  tab: {
    height: TAB_HEIGHT,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  scanWrap: {
    position: 'absolute',
    top: NAV_TOP,
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
  },
});
