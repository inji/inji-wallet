import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {BottomSheet} from '../ui/BottomSheet';
import {BackIcon, CheckIcon, CloseIcon} from './Icons';
import {ScaledText} from './ScaledText';
import {fonts, radii} from './tokens';
import {useRevampTheme} from './useRevampTheme';
import {Theme} from '../ui/styleUtils';
import testIDProps from '../../shared/commonUtil';

const {elevation: E} = Theme.Tokens;

/** A full screen of the new design: canvas background, content under the status bar, and an
 * optional footer kept clear of the navigation bar. */
export const Page: React.FC<{
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}> = ({header, footer, children, testID, style}) => {
  const {c} = useRevampTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      {...(testID ? testIDProps(testID) : {})}
      style={[
        styles.page,
        {backgroundColor: c.canvas, paddingTop: insets.top},
        style,
      ]}>
      {header}
      <View style={styles.body}>{children}</View>
      {footer ? (
        <View
          style={[
            styles.footer,
            {paddingBottom: Math.max(insets.bottom, 12) + 16},
          ]}>
          {footer}
        </View>
      ) : null}
    </View>
  );
};

/** A Page that slides over the current screen. It measures its own insets: the screen's are
 * zero at the top under a navigator header. */
export const PageModal: React.FC<{
  visible: boolean;
  onRequestClose: () => void;
  onShow?: () => void;
  children: React.ReactNode;
}> = ({visible, onRequestClose, onShow, children}) => (
  <Modal
    visible={visible}
    animationType="slide"
    statusBarTranslucent
    onShow={onShow}
    onRequestClose={onRequestClose}>
    <SafeAreaProvider>{children}</SafeAreaProvider>
  </Modal>
);

/** Where the user is in a multi-step page, as "Step 2 of 2". */
export const StepDots: React.FC<{current: number; count?: number}> = ({
  current,
  count = 2,
}) => {
  const {t} = useTranslation('PasscodeScreen');
  const {c} = useRevampTheme();
  return (
    <ScaledText style={[styles.step, {color: c.inkMuted}]}>
      {t('step', {current: current + 1, total: count})}
    </ScaledText>
  );
};

/** Round back or close button, a centred title, and a slot on the right. */
export const PageHeader: React.FC<{
  title?: string;
  onBack?: () => void;
  onClose?: () => void;
  right?: React.ReactNode;
}> = ({title, onBack, onClose, right}) => {
  const {c} = useRevampTheme();
  const action = onBack ?? onClose;
  return (
    <View style={styles.header}>
      {action ? (
        <RoundButton
          testID={onBack ? 'goBack' : 'close'}
          accessibilityLabel={onBack ? 'Go back' : 'Close'}
          onPress={action}>
          {onBack ? <BackIcon color={c.ink} /> : <CloseIcon color={c.ink} />}
        </RoundButton>
      ) : (
        <View style={styles.headerSlot} />
      )}
      <ScaledText
        accessibilityRole="header"
        numberOfLines={1}
        style={[styles.headerTitle, {color: c.ink}]}>
        {title ?? ''}
      </ScaledText>
      <View style={styles.headerSlot}>{right}</View>
    </View>
  );
};

export const RoundButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
  testID?: string;
  dark?: boolean;
}> = ({onPress, children, accessibilityLabel, testID, dark}) => {
  const {c} = useRevampTheme();
  return (
    <Pressable
      {...(testID ? testIDProps(testID) : {})}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({pressed}) => [
        styles.round,
        dark
          ? styles.roundDark
          : {backgroundColor: c.card, borderColor: c.line},
        pressed && styles.pressed,
      ]}>
      {children}
    </Pressable>
  );
};

type Tone = 'azure' | 'warn' | 'fail' | 'pass';

/** An icon in a tinted circle, at the top of a page or sheet. */
export const Glyph: React.FC<{
  tone?: Tone;
  size?: number;
  children: (colour: string) => React.ReactNode;
}> = ({tone = 'azure', size = 84, children}) => {
  const {c} = useRevampTheme();
  const {bg, fg} = toneColours(c, tone);
  return (
    <View
      style={[styles.glyph, {width: size, height: size, backgroundColor: bg}]}>
      {children(fg)}
    </View>
  );
};

export function toneColours(
  c: ReturnType<typeof useRevampTheme>['c'],
  tone: Tone,
) {
  switch (tone) {
    case 'warn':
      return {bg: c.tintWarn, fg: c.warn};
    case 'fail':
      return {bg: FAIL_TINT, fg: c.fail};
    case 'pass':
      return {bg: c.tintPass, fg: c.pass};
    default:
      return {bg: c.tintAzure, fg: c.ink};
  }
}

const FAIL_TINT = '#fbe9e7';

/** Centred heading with an optional line of text under it. */
export const PageHeading: React.FC<{
  title: string;
  body?: string;
  size?: 'large' | 'medium';
  align?: 'center' | 'left';
  testID?: string;
}> = ({title, body, size = 'large', align = 'center', testID}) => {
  const {c} = useRevampTheme();
  const left = align === 'left';
  return (
    <View style={[styles.heading, left && styles.headingLeft]}>
      <ScaledText
        {...(testID ? testIDProps(testID) : {})}
        accessibilityRole="header"
        style={[
          size === 'large' ? styles.titleLarge : styles.titleMedium,
          {color: c.ink},
          left && styles.textLeft,
        ]}>
        {title}
      </ScaledText>
      {body ? (
        <ScaledText
          style={[styles.lead, {color: c.inkMuted}, left && styles.textLeft]}>
          {body}
        </ScaledText>
      ) : null}
    </View>
  );
};

type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'danger'
  | 'link'
  | 'dangerLink'
  | 'mutedLink';

/** Full-width pill button of the new design, and its text-only link variants. */
export const PageButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: (colour: string) => React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  testID,
}) => {
  const {c} = useRevampTheme();
  const filled = variant === 'primary' || variant === 'danger';
  const textColour =
    variant === 'primary'
      ? c.onPrimary
      : variant === 'danger'
      ? '#ffffff'
      : variant === 'outline'
      ? c.ink
      : variant === 'dangerLink'
      ? c.fail
      : variant === 'mutedLink'
      ? c.inkMuted
      : c.azureInk;
  return (
    <Pressable
      {...(testID ? testIDProps(testID) : {})}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{disabled: !!disabled, busy: !!loading}}
      disabled={disabled || loading}
      onPress={onPress}
      style={({pressed}) => [
        filled || variant === 'outline' ? styles.button : styles.link,
        variant === 'primary' && [{backgroundColor: c.primary}, E.btn],
        variant === 'danger' && [{backgroundColor: c.fail}, E.btn],
        variant === 'outline' && [styles.outline, {borderColor: c.ink}],
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColour} />
      ) : (
        icon?.(textColour)
      )}
      <ScaledText
        maxFontSizeMultiplier={1.4}
        style={[
          filled || variant === 'outline' ? styles.buttonText : styles.linkText,
          {color: textColour},
        ]}>
        {title}
      </ScaledText>
    </Pressable>
  );
};

/** One selectable row: optional icon, label and hint, and a radio or check mark. */
export const ChoiceRow: React.FC<{
  label: string;
  hint?: string;
  icon?: (colour: string) => React.ReactNode;
  selected: boolean;
  mark?: 'radio' | 'check';
  onPress: () => void;
  testID?: string;
  rtl?: boolean;
  /** Draw the row as its own rounded card, tinted when selected; used inside ChoiceCards. */
  card?: boolean;
}> = ({
  label,
  hint,
  icon,
  selected,
  mark = 'radio',
  onPress,
  testID,
  rtl,
  card,
}) => {
  const {c} = useRevampTheme();
  return (
    <Pressable
      {...(testID ? testIDProps(testID) : {})}
      accessibilityRole={mark === 'radio' ? 'radio' : 'button'}
      accessibilityState={{selected, checked: selected}}
      accessibilityLabel={label}
      onPress={onPress}
      style={({pressed}) => [
        styles.choice,
        hint ? styles.choiceTall : null,
        card && [
          styles.choiceCard,
          selected
            ? {backgroundColor: c.tintAzure, borderColor: c.ink}
            : {backgroundColor: c.card, borderColor: c.line},
        ],
        pressed && {backgroundColor: c.sand},
      ]}>
      {icon ? (
        <View
          style={[
            styles.choiceIcon,
            card && styles.choiceIconCard,
            {backgroundColor: card ? c.tintAzure : c.sand},
          ]}>
          {icon(c.ink)}
        </View>
      ) : null}
      <View style={styles.choiceText}>
        <ScaledText
          style={[
            styles.choiceLabel,
            card && styles.choiceLabelCard,
            {color: c.ink, textAlign: rtl ? 'right' : 'left'},
          ]}>
          {label}
        </ScaledText>
        {hint ? (
          <ScaledText style={[styles.choiceHint, {color: c.inkMuted}]}>
            {hint}
          </ScaledText>
        ) : null}
      </View>
      {mark === 'radio' ? (
        <View
          style={[
            styles.radio,
            selected
              ? {borderColor: c.ink, borderWidth: 7}
              : {borderColor: c.lineStrong},
          ]}
        />
      ) : selected ? (
        <CheckIcon color={c.ink} />
      ) : (
        <View style={styles.checkSlot} />
      )}
    </Pressable>
  );
};

/** Rows on one bordered card, divided by hairlines (the Settings list style). */
/** Choices as separate rounded cards with space between them. */
export const ChoiceCards: React.FC<{children: React.ReactNode}> = ({
  children,
}) => <View style={styles.cards}>{children}</View>;

export const ChoiceList: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {c} = useRevampTheme();
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.list, {backgroundColor: c.card, borderColor: c.line}]}>
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
  );
};

/** Red line under the passcode boxes. */
export const FieldError: React.FC<{message?: string; testID?: string}> = ({
  message,
  testID,
}) => {
  const {c} = useRevampTheme();
  return message ? (
    <ScaledText
      {...(testID ? testIDProps(testID) : {})}
      accessibilityLiveRegion="polite"
      style={[styles.error, {color: c.fail}]}>
      {message}
    </ScaledText>
  ) : null;
};

/**
 * A bottom sheet for alerts and questions: a tinted icon beside the title, a short message,
 * then one primary action and one text action. Replaces the old centred popups.
 */
export const AlertSheet: React.FC<{
  isVisible: boolean;
  tone?: Tone;
  icon: (colour: string) => React.ReactNode;
  title: string;
  message?: string;
  primary: {
    title: string;
    onPress: () => void;
    danger?: boolean;
    testID?: string;
  };
  secondary?: {
    title: string;
    onPress: () => void;
    destructive?: boolean;
    testID?: string;
  };
  outline?: {title: string; onPress: () => void; testID?: string};
  onRequestClose: () => void;
  onClosed?: () => void;
  dismissOnBackdropPress?: boolean;
  testID?: string;
  children?: React.ReactNode;
}> = props => {
  const {c} = useRevampTheme();
  const {bg, fg} = toneColours(c, props.tone ?? 'warn');
  return (
    <BottomSheet
      testID={props.testID}
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      onClosed={props.onClosed}
      dismissOnBackdropPress={props.dismissOnBackdropPress}>
      <View style={styles.sheet}>
        <View style={styles.sheetHead}>
          <View style={[styles.sheetGlyph, {backgroundColor: bg}]}>
            {props.icon(fg)}
          </View>
          <ScaledText
            accessibilityRole="header"
            style={[styles.sheetTitle, {color: c.ink}]}>
            {props.title}
          </ScaledText>
        </View>
        {props.children}
        {props.message ? (
          <ScaledText style={[styles.sheetMessage, {color: c.inkMuted}]}>
            {props.message}
          </ScaledText>
        ) : null}
        <View style={styles.sheetActions}>
          <PageButton
            testID={props.primary.testID}
            title={props.primary.title}
            variant={props.primary.danger ? 'danger' : 'primary'}
            onPress={props.primary.onPress}
          />
          {props.outline ? (
            <PageButton
              testID={props.outline.testID}
              title={props.outline.title}
              variant="outline"
              onPress={props.outline.onPress}
            />
          ) : null}
          {props.secondary ? (
            <PageButton
              testID={props.secondary.testID}
              title={props.secondary.title}
              variant={props.secondary.destructive ? 'dangerLink' : 'link'}
              onPress={props.secondary.onPress}
            />
          ) : null}
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  step: {fontFamily: fonts.regular, fontSize: 13, textAlign: 'center'},
  page: {flex: 1},
  body: {flex: 1, paddingHorizontal: 24},
  footer: {paddingHorizontal: 24, paddingTop: 12, gap: 6},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 6,
    minHeight: 60,
  },
  headerSlot: {width: 40, alignItems: 'flex-end'},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 22,
    marginHorizontal: 8,
  },
  round: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  glyph: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  heading: {alignItems: 'center', gap: 8},
  headingLeft: {alignItems: 'flex-start'},
  textLeft: {textAlign: 'left'},
  titleLarge: {
    fontFamily: fonts.semibold,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  titleMedium: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  button: {
    minHeight: 52,
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outline: {borderWidth: 1.5, backgroundColor: 'transparent'},
  buttonText: {fontFamily: fonts.semibold, fontSize: 16, textAlign: 'center'},
  link: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  linkText: {fontFamily: fonts.semibold, fontSize: 16, textAlign: 'center'},
  disabled: {opacity: 0.45},
  pressed: {opacity: 0.8},
  list: {borderRadius: radii.card, borderWidth: 1, overflow: 'hidden'},
  choice: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  choiceTall: {paddingVertical: 14},
  choiceCard: {borderWidth: 1, borderRadius: 14},
  choiceIconCard: {borderRadius: 10, width: 40, height: 40},
  choiceLabelCard: {fontFamily: fonts.semibold},
  cards: {gap: 10},
  choiceIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceText: {flex: 1, gap: 3},
  choiceLabel: {fontFamily: fonts.regular, fontSize: 16, lineHeight: 20},
  choiceHint: {fontFamily: fonts.regular, fontSize: 13, lineHeight: 18},
  radio: {width: 22, height: 22, borderRadius: radii.pill, borderWidth: 1.5},
  checkSlot: {width: 20},
  error: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 16,
  },
  sheet: {gap: 14, paddingHorizontal: 4, paddingBottom: 4},
  sheetHead: {flexDirection: 'row', alignItems: 'center', gap: 14},
  sheetGlyph: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  sheetMessage: {fontFamily: fonts.regular, fontSize: 15, lineHeight: 22},
  sheetActions: {gap: 6, marginTop: 4},
});
