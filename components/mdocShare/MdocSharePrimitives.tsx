import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {Icon} from 'react-native-elements';
import Svg, {Path} from 'react-native-svg';
import {useTranslation} from 'react-i18next';
import {Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import testIDProps from '../../shared/commonUtil';
import {formatElementLabel} from './mdocShareUtils';

const {colors: C, brand: B, elevation: E} = Theme.Tokens;

/** Friendly name for an ISO 18013-5 element identifier, falling back to `Age over 18` style. */
export function useElementLabel(): (element: string) => string {
  const {t} = useTranslation('VcDetails');
  return element =>
    t(`mdocShare.elementLabels.${element}`, {
      defaultValue: formatElementLabel(element),
    });
}

/**
 * Text sized to its own content (chips, tags, badges). On Android, rounding the measured width
 * to the pixel grid at fractional densities can leave it a fraction short, wrapping the last
 * word onto a line the box never grows to show. Keeping it to one clipped line avoids that.
 */
export const ShrinkWrappedText: React.FC<
  Omit<React.ComponentProps<typeof Text>, 'numLines' | 'ellipsizeMode'>
> = props => <Text {...props} numLines={1} ellipsizeMode="clip" />;

/** Small rounded label, e.g. "Required" or "Will be stored". */
export const MdocTag: React.FC<{
  label: string;
  tone: 'warning' | 'neutral';
  /** MaterialCommunityIcons name shown before the label. */
  icon?: string;
  testID?: string;
}> = ({label, tone, icon, testID}) => {
  const color = tone === 'warning' ? C.warn : C.ink;
  return (
    <View
      testID={testID}
      style={[
        styles.tag,
        tone === 'warning' ? styles.tagWarning : styles.tagNeutral,
      ]}>
      {!!icon && (
        <Icon
          name={icon}
          type="material-community"
          size={12}
          color={color}
          containerStyle={styles.tagIcon}
        />
      )}
      <ShrinkWrappedText size="smaller" weight="semibold" color={color}>
        {label}
      </ShrinkWrappedText>
    </View>
  );
};

export const MdocShareHeader: React.FC<MdocShareHeaderProps> = props => {
  const dark = props.variant === 'dark';
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {props.onClose && (
          <Pressable
            {...testIDProps(props.closeTestID ?? 'mdocShareClose')}
            accessibilityRole="button"
            accessibilityLabel={props.closeLabel}
            hitSlop={8}
            onPress={props.onClose}
            style={[
              styles.closeButton,
              dark ? styles.closeButtonDark : styles.closeButtonLight,
            ]}>
            <Icon
              name="close"
              type="material"
              size={20}
              color={dark ? B.onNavy : C.ink}
            />
          </Pressable>
        )}
      </View>
      <Text
        testID={props.titleTestID}
        weight="semibold"
        align="center"
        color={dark ? B.onNavy : C.ink}
        style={styles.headerTitle}>
        {props.title}
      </Text>
      <View style={[styles.headerSide, styles.headerRight]}>{props.right}</View>
    </View>
  );
};

export const MdocShareButton: React.FC<MdocShareButtonProps> = props => {
  const variant = props.variant ?? 'primary';
  const isLink = variant === 'linkOnNavy' || variant === 'linkSubtle';
  const textColor = BUTTON_TEXT_COLORS[variant];
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
        !isLink && styles[variant as 'primary' | 'light' | 'outline'],
        props.disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
        props.style,
      ]}>
      {props.loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text
          weight="semibold"
          align="center"
          size={variant === 'linkSubtle' ? 'small' : undefined}
          color={textColor}
          style={styles.buttonText}>
          {props.title}
        </Text>
      )}
    </Pressable>
  );
};

export const ElementChip: React.FC<{label: string; testID?: string}> = ({
  label,
  testID,
}) => (
  <View testID={testID} style={styles.chip}>
    <ShrinkWrappedText size="smaller" color={C.ink} weight="semibold">
      {label}
    </ShrinkWrappedText>
  </View>
);

/**
 * Outlined shield with a plus or a cross (Lucide `shield-plus` / `shield-x`); the icon fonts
 * only have filled or heavier variants.
 */
export const ShieldIcon: React.FC<{
  mark: 'plus' | 'x';
  size: number;
  color: string;
  strokeWidth?: number;
}> = ({mark, size, color, strokeWidth = 2}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    {mark === 'plus' ? (
      <>
        <Path d="M9 12h6" />
        <Path d="M12 9v6" />
      </>
    ) : (
      <>
        <Path d="m14.5 9.5-5 5" />
        <Path d="m9.5 9.5 5 5" />
      </>
    )}
  </Svg>
);

/** Small uppercase section heading used on the light screens. */
export const SectionLabel: React.FC<{children: React.ReactNode}> = ({
  children,
}) => (
  <Text size="smaller" weight="bold" color={C.inkMuted} style={styles.section}>
    {children}
  </Text>
);

interface MdocShareHeaderProps {
  title: string;
  variant: 'dark' | 'light';
  onClose?: () => void;
  closeLabel?: string;
  closeTestID?: string;
  titleTestID?: string;
  right?: React.ReactNode;
}

type MdocShareButtonVariant =
  | 'primary'
  | 'light'
  | 'outline'
  | 'linkOnNavy'
  | 'linkSubtle';

const BUTTON_TEXT_COLORS: Record<MdocShareButtonVariant, string> = {
  primary: B.onNavy,
  light: B.navy,
  outline: C.ink,
  linkOnNavy: B.onNavy,
  linkSubtle: C.azureInk,
};

interface MdocShareButtonProps {
  title: string;
  onPress: () => void;
  variant?: MdocShareButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerSide: {
    width: 44,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonDark: {
    backgroundColor: B.navyFill,
  },
  closeButtonLight: {
    borderWidth: 1,
    borderColor: C.line,
  },
  button: {
    minHeight: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: B.navy,
    ...E.btn,
  },
  light: {
    backgroundColor: B.onNavy,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: C.sel,
    backgroundColor: C.card,
    ...E.ghost,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  chip: {
    backgroundColor: C.sand,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  section: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagIcon: {
    marginRight: 4,
  },
  tagWarning: {
    backgroundColor: C.tintWarn,
  },
  tagNeutral: {
    backgroundColor: C.sand,
  },
});
