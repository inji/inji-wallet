import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {ScaledText} from './ScaledText';
import {fonts, radii} from './tokens';
import {useRevampTheme} from './useRevampTheme';

/** A titled group of rows on one card, as in the Settings design. */
export const SettingsSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({title, children}) => {
  const {c} = useRevampTheme();
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.section}>
      <ScaledText
        accessibilityRole="header"
        style={[styles.sectionTitle, {color: c.inkMuted}]}>
        {title}
      </ScaledText>
      <View
        style={[styles.card, {backgroundColor: c.card, borderColor: c.line}]}>
        {rows.map((row, i) => (
          <View
            key={i}
            style={
              i < rows.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: c.line,
              }
            }>
            {row}
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * One settings row: icon in a circle, label, and on the right either a value with a chevron
 * (when `onPress` is set) or whatever `trailing` holds, such as a switch. Without `onPress` it is
 * drawn as a plain view, for rows a wrapping component makes tappable; `chevron` still shows the
 * arrow then.
 */
export const SettingsRow: React.FC<{
  icon: (colour: string) => React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  chevron?: boolean;
  disabled?: boolean;
  testID?: string;
  accessibilityRole?: 'button' | 'switch';
  accessibilityState?: {checked?: boolean; disabled?: boolean};
}> = ({
  icon,
  label,
  value,
  onPress,
  trailing,
  chevron,
  disabled,
  testID,
  accessibilityRole = 'button',
  accessibilityState,
}) => {
  const {c} = useRevampTheme();
  const content = (
    <>
      <View style={[styles.iconCircle, {backgroundColor: c.sand}]}>
        {icon(c.ink)}
      </View>
      <ScaledText style={[styles.label, {color: c.ink}]}>{label}</ScaledText>
      {value ? (
        <ScaledText style={[styles.value, {color: c.inkMuted}]}>
          {value}
        </ScaledText>
      ) : null}
      {trailing ?? (onPress || chevron ? <Chevron colour={c.ink} /> : null)}
    </>
  );
  if (!onPress) {
    return (
      <View testID={testID} style={[styles.row, disabled && {opacity: 0.45}]}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityState={{disabled, ...accessibilityState}}
      style={({pressed}) => [
        styles.row,
        pressed && {backgroundColor: c.sand},
        disabled && {opacity: 0.45},
      ]}>
      {content}
    </Pressable>
  );
};

/** The design's on/off switch: a navy track when on, with the knob sliding across. */
export const SettingsSwitch: React.FC<{value: boolean}> = ({value}) => {
  const {c, reduceMotion} = useRevampTheme();
  const knob = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion) knob.setValue(value ? 1 : 0);
    else
      Animated.timing(knob, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
  }, [value]);
  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: value ? c.sel : c.sand,
          borderColor: value ? c.sel : c.lineStrong,
        },
      ]}>
      <Animated.View
        style={[
          styles.knob,
          {
            backgroundColor: value ? c.onPrimary : c.lineStrong,
            transform: [
              {
                translateX: knob.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 18],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const Chevron: React.FC<{colour: string}> = ({colour}) => (
  <SettingsIcon colour={colour} size={18}>
    <Path d="m9 18 6-6-6-6" />
  </SettingsIcon>
);

const SettingsIcon: React.FC<{
  colour: string;
  size?: number;
  children: React.ReactNode;
}> = ({colour, size = 20, children}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={colour}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round">
    {children}
  </Svg>
);

/** Row icons, from the design where it has one and in the same style where it doesn't. */
export const settingsIcons = {
  biometrics: (col: string) => (
    <SettingsIcon colour={col}>
      <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <Path d="M9 9h.01M15 9h.01M9 15c1.5 1.3 4.5 1.3 6 0" />
    </SettingsIcon>
  ),
  key: (col: string) => (
    <SettingsIcon colour={col}>
      <Circle cx={7.5} cy={15.5} r={4.5} />
      <Path d="m10.7 12.3 9.3-9.3M16 7l3 3M14 9l2 2" />
    </SettingsIcon>
  ),
  history: (col: string) => (
    <SettingsIcon colour={col}>
      <Circle cx={18} cy={5} r={3} />
      <Circle cx={6} cy={12} r={3} />
      <Circle cx={18} cy={19} r={3} />
      <Path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </SettingsIcon>
  ),
  receive: (col: string) => (
    <SettingsIcon colour={col}>
      <Path d="M12 3v12M7 10l5 5 5-5" />
      <Path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </SettingsIcon>
  ),
  received: (col: string) => (
    <SettingsIcon colour={col}>
      <Rect x={3} y={7} width={18} height={13} rx={2} />
      <Path d="M7 4h10M7 12h5M7 16h8" />
    </SettingsIcon>
  ),
  language: (col: string) => (
    <SettingsIcon colour={col}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </SettingsIcon>
  ),
  about: (col: string) => (
    <SettingsIcon colour={col}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 16v-4M12 8h.01" />
    </SettingsIcon>
  ),
  tour: (col: string) => (
    <SettingsIcon colour={col}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
    </SettingsIcon>
  ),
};

const styles = StyleSheet.create({
  section: {gap: 8},
  sectionTitle: {fontFamily: fonts.medium, fontSize: 12, lineHeight: 14.4},
  card: {borderRadius: radii.surface, borderWidth: 1, overflow: 'hidden'},
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {flex: 1, fontFamily: fonts.regular, fontSize: 16, lineHeight: 19.2},
  value: {fontFamily: fonts.regular, fontSize: 14},
  track: {
    width: 46,
    height: 28,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    padding: 2,
    justifyContent: 'center',
  },
  knob: {
    width: 21,
    height: 21,
    borderRadius: radii.pill,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 1,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
  },
});
