import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {Text} from './Text';
import {Theme} from './styleUtils';
import testIDProps from '../../shared/commonUtil';

const {colors: C, brand: B, elevation: E} = Theme.Tokens;

/** Rounded full-width button of the new screen designs. */
export const PillButton: React.FC<PillButtonProps> = props => {
  const variant = props.variant ?? 'primary';
  const textColor = TEXT_COLORS[variant];
  const isLink = variant === 'link' || variant === 'linkInk';
  return (
    <Pressable
      {...(props.testID ? testIDProps(props.testID) : {})}
      accessibilityRole="button"
      accessibilityLabel={props.title}
      accessibilityState={{disabled: !!props.disabled, busy: !!props.loading}}
      disabled={props.disabled || props.loading}
      onPress={props.onPress}
      style={({pressed}) => [
        styles.button,
        !isLink && styles[variant as 'primary' | 'light'],
        props.disabled && styles.disabled,
        pressed && styles.pressed,
        props.style,
      ]}>
      <View style={styles.content}>
        {props.loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          props.icon
        )}
        {(!props.loading || !!props.loadingTitle) && (
          <Text
            weight="semibold"
            align="center"
            color={textColor}
            style={
              props.loading || props.icon ? styles.iconSpacing : undefined
            }>
            {props.loading ? props.loadingTitle : props.title}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

type PillButtonVariant = 'primary' | 'light' | 'link' | 'linkInk';

const TEXT_COLORS: Record<PillButtonVariant, string> = {
  primary: B.onNavy,
  light: B.navy,
  link: C.azureInk,
  linkInk: C.ink,
};

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: PillButtonVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  // Shown next to the spinner while loading; without it only the spinner shows.
  loadingTitle?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacing: {
    marginLeft: 8,
  },
  primary: {
    backgroundColor: B.navy,
    ...E.btn,
  },
  light: {
    backgroundColor: B.onNavy,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
});
