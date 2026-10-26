import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {ScaledText} from './ScaledText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  CredentialCardBack,
  CredentialCardFront,
  isInactive,
  ScaledCard,
} from './CredentialCard';
import {
  Action,
  CredentialInformation,
  StatusNotice,
  StatusRow,
} from './CredentialParts';
import {
  ActivityIcon,
  BackIcon,
  FlipIcon,
  PinIcon,
  QrIcon,
  ShareIcon,
  TrashIcon,
} from './Icons';
import {CARD_WIDTH, fonts, motion, radii, shadows} from './tokens';
import {useRevampTheme} from './useRevampTheme';
import {CredentialCardData} from './useCredentialCard';
import {PillButton} from '../ui/PillButton';

export interface CardActions {
  share: () => void;
  showQr: () => void;
  togglePin: () => void;
  activity: () => void;
  remove: () => void;
}

export interface CredentialDetailsHandle {
  close: (then?: () => void) => void;
}

/** Where the card comes from: it flies up from below and a little smaller, then settles. */
const FLY_Y = 40;
const FLY_SCALE = 0.9;
const RISE_DELAYS = [180, 240, 300, 380, 440];

/** One credential on its own page: the card flies up into place and the rest rises in under it. */
export const CredentialDetails = React.forwardRef<
  CredentialDetailsHandle,
  {
    data: CredentialCardData;
    pinned: boolean;
    actions: CardActions;
    onClosed: () => void;
    /** Whether the card's back (with its QR) is showing. */
    onFlipChange?: (flipped: boolean) => void;
  }
>(function CredentialDetails(
  {data, pinned, actions, onClosed, onFlipChange},
  ref,
) {
  const {c, reduceMotion} = useRevampTheme();
  const insets = useSafeAreaInsets();
  const cardWidth = Math.min(CARD_WIDTH, useWindowDimensions().width - 48);
  const [flipped, setFlipped] = useState(false);

  const bg = useRef(new Animated.Value(0)).current;
  const card = useRef(new Animated.Value(0)).current;
  const rise = useRef(RISE_DELAYS.map(() => new Animated.Value(0))).current;
  const flip = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      [bg, card, ...rise].forEach(v => v.setValue(1));
      return;
    }
    Animated.parallel([
      Animated.timing(bg, {toValue: 1, duration: 380, useNativeDriver: true}),
      Animated.timing(card, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.2, 0.9, 0.25, 1.06),
        useNativeDriver: true,
      }),
      ...rise.map((v, i) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 500,
          delay: RISE_DELAYS[i],
          easing: Easing.bezier(0.2, 0.8, 0.2, 1),
          useNativeDriver: true,
        }),
      ),
    ]).start();
  }, []);

  useEffect(() => {
    onFlipChange?.(flipped);
    if (reduceMotion) flip.setValue(flipped ? 1 : 0);
    else
      Animated.timing(flip, {
        toValue: flipped ? 1 : 0,
        ...motion.flip,
        useNativeDriver: true,
      }).start();
  }, [flipped]);

  const close = (then?: () => void) => {
    const done = () => {
      onClosed();
      then?.();
    };
    if (reduceMotion) return done();
    Animated.parallel([
      Animated.timing(bg, {
        toValue: 0,
        duration: 380,
        delay: 60,
        useNativeDriver: true,
      }),
      Animated.timing(card, {
        toValue: 0,
        duration: 440,
        easing: Easing.bezier(0.45, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      ...rise.map(v =>
        Animated.timing(v, {toValue: 0, duration: 220, useNativeDriver: true}),
      ),
    ]).start(done);
  };
  useImperativeHandle(ref, () => ({close}));

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
  }, []);

  const risen = (i: number) => ({
    opacity: rise[i],
    transform: [
      {
        translateY: rise[i].interpolate({
          inputRange: [0, 1],
          outputRange: [26, 0],
        }),
      },
    ],
  });
  const cardStyle = {
    transform: [
      {
        translateY: card.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [FLY_Y, -6, 0],
        }),
      },
      {
        scale: card.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [FLY_SCALE, 1.015, 1],
        }),
      },
    ],
  };
  const inactive = isInactive(data.status);
  const revoked = data.status === 'revoked';

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {backgroundColor: c.canvas, opacity: bg},
        ]}
      />
      <View style={{flex: 1, paddingTop: insets.top}}>
        <Animated.View style={[styles.header, {opacity: bg}]}>
          <Pressable
            onPress={() => close()}
            accessibilityLabel="Back to wallet"
            style={[
              styles.headerBtn,
              shadows.raised,
              {borderColor: c.line, backgroundColor: c.card},
            ]}>
            <BackIcon color={c.ink} />
          </Pressable>
          <ScaledText
            numberOfLines={1}
            style={[styles.headerTitle, {color: c.ink}]}>
            {data.title}
          </ScaledText>
          <Pressable
            onPress={actions.togglePin}
            accessibilityLabel={
              pinned ? `Unpin ${data.title}` : `Pin ${data.title} to top`
            }
            accessibilityState={{selected: pinned}}
            style={[
              styles.headerBtn,
              {
                borderColor: pinned ? c.azureInk : c.line,
                backgroundColor: pinned ? c.tintAzure : 'transparent',
              },
            ]}>
            <PinIcon
              color={pinned ? c.azureInk : c.ink}
              size={20}
              filled={pinned}
            />
          </Pressable>
        </Animated.View>

        <ScrollView
          contentContainerStyle={[
            styles.body,
            // The revoked card's footer already sits above the navigation bar.
            {paddingBottom: 36 + (revoked ? 0 : insets.bottom)},
          ]}
          showsVerticalScrollIndicator={false}>
          <Animated.View style={[{alignSelf: 'center'}, cardStyle]}>
            <Pressable
              onPress={() => setFlipped(f => !f)}
              accessibilityLabel={
                flipped
                  ? 'Card back shown. Tap to show the front'
                  : 'Card front shown. Tap to see the back'
              }
              style={[shadows.card, {borderRadius: radii.card}]}>
              <ScaledCard width={cardWidth}>
                <Animated.View
                  style={[
                    styles.face,
                    {
                      transform: [
                        {perspective: 1200},
                        {
                          rotateY: flip.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <CredentialCardFront data={data} />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.face,
                    styles.back,
                    {
                      transform: [
                        {perspective: 1200},
                        {
                          rotateY: flip.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['180deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <CredentialCardBack data={data} showing={flipped} />
                </Animated.View>
              </ScaledCard>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.hint, risen(0)]}>
            <FlipIcon color={c.inkMuted} />
            <ScaledText style={[styles.hintText, {color: c.inkMuted}]}>
              {flipped
                ? 'Tap the card to see the front'
                : 'Tap the card to see the back'}
            </ScaledText>
          </Animated.View>

          <Animated.View style={[styles.statusGroup, risen(1)]}>
            <StatusRow data={data} />
            <StatusNotice data={data} />
          </Animated.View>

          <Animated.View style={[styles.actions, risen(2)]}>
            <Action
              label="Share"
              primary
              size={56}
              disabled={inactive}
              onPress={actions.share}
              icon={col => <ShareIcon color={col} />}
            />
            <Action
              label="Show QR"
              size={56}
              disabled={inactive}
              onPress={actions.showQr}
              icon={col => <QrIcon color={col} />}
            />
            <Action
              label="Activity"
              size={56}
              onPress={actions.activity}
              icon={col => <ActivityIcon color={col} />}
            />
          </Animated.View>

          <Animated.View style={risen(3)}>
            <CredentialInformation data={data} />
          </Animated.View>

          {revoked ? null : (
            <Animated.View style={risen(4)}>
              <Pressable
                onPress={actions.remove}
                style={styles.remove}
                accessibilityRole="button">
                <TrashIcon color={c.fail} />
                <ScaledText style={[styles.removeText, {color: c.fail}]}>
                  Remove from Wallet
                </ScaledText>
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>

        {revoked ? (
          <Animated.View
            style={[
              styles.footer,
              {
                borderTopColor: c.line,
                paddingBottom: insets.bottom + 12,
                opacity: bg,
              },
            ]}>
            <PillButton
              title="Remove from Wallet"
              icon={<TrashIcon color={c.onPrimary} />}
              onPress={actions.remove}
            />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 24,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 22,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  body: {paddingTop: 12, paddingHorizontal: 24, gap: 18},
  face: {width: CARD_WIDTH, backfaceVisibility: 'hidden'},
  back: {position: 'absolute', left: 0, top: 0},
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  hintText: {fontFamily: fonts.regular, fontSize: 12, lineHeight: 14.4},
  statusGroup: {gap: 18},
  actions: {flexDirection: 'row', justifyContent: 'space-between', gap: 12},
  remove: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  removeText: {fontFamily: fonts.medium, fontSize: 16},
});
