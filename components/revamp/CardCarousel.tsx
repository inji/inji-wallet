import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import {VCMetadata} from '../../shared/VCMetadata';
import {CredentialCardBack, CredentialCardFront} from './CredentialCard';
import {CredentialCardData} from './useCredentialCard';
import {CARD_HEIGHT, CARD_WIDTH, motion, radii} from './tokens';
import {CardSkeleton} from './CardSkeleton';
import {
  carouselScale,
  FRONT_CARD_LIFT,
  FRONT_CARD_SCALE,
  SLOT_TOP,
  slotPosition,
} from './carouselLayout';

export interface CarouselEntry {
  key: string;
  vcMetadata?: VCMetadata;
  /** Undefined until the credential has loaded; a skeleton stands in meanwhile. */
  data?: CredentialCardData;
}

const GAP = 250; // distance between neighbouring cards at scale 1 (200 at the design's 0.8)
const RUBBER = 0.35;

/**
 * Cover-flow carousel from the design: the active card centred, neighbours turned away in 3D.
 * The drag and the settle run on the native driver, so the cards keep up with the finger.
 */
export const CardCarousel: React.FC<{
  entries: CarouselEntry[];
  index: number;
  onIndexChange: (index: number) => void;
  flipped: boolean;
  onFlip: () => void;
  reduceMotion: boolean;
}> = ({entries, index, onIndexChange, flipped, onFlip, reduceMotion}) => {
  const {width} = useWindowDimensions();
  const scale = carouselScale(width);
  const gap = GAP * scale;
  const n = entries.length;

  // The card index under the centre is `base` minus the finger's travel in cards; past either
  // end the travel is damped into a rubber band.
  const base = useRef(new Animated.Value(index)).current;
  const dragX = useRef(new Animated.Value(0)).current;
  const position = useMemo(() => {
    const raw = Animated.subtract(base, Animated.divide(dragX, gap));
    const last = Math.max(0, n - 1);
    return raw.interpolate({
      inputRange: [-1, 0, last, last + 1],
      outputRange: [-RUBBER, 0, last, last + RUBBER],
      extrapolate: 'extend',
    });
  }, [base, dragX, gap, n]);

  const current = useRef(index);
  const settleTo = (k: number, from: number, then?: () => void) => {
    current.current = k;
    base.setValue(from);
    dragX.setValue(0);
    if (reduceMotion) {
      base.setValue(k);
      then?.();
    } else
      Animated.timing(base, {
        toValue: k,
        ...motion.settle,
        useNativeDriver: true,
      }).start(() => then?.());
  };

  useEffect(() => {
    if (index !== current.current) settleTo(index, current.current);
  }, [index]);

  // Which card is nearest the centre right now, so it can be drawn on top while it moves.
  // Native-driven values only report back to JS from a plain Animated.Value, so this follows
  // the finger through the gesture events and the settle through `base`.
  const [front, setFront] = useState(index);
  const showFront = (at: number) => {
    const k = Math.max(0, Math.min(n - 1, Math.round(at)));
    setFront(prev => (prev === k ? prev : k));
  };
  const showFrontRef = useRef(showFront);
  showFrontRef.current = showFront;
  // Set on release: tells the screen below about the new card once the settle is nearly done,
  // so its re-render misses the fast part of the motion.
  const pendingIndex = useRef<number | null>(null);
  const announce = () => {
    const k = pendingIndex.current;
    pendingIndex.current = null;
    if (k !== null && current.current === k) latest.current.onIndexChange(k);
  };
  useEffect(() => {
    const id = base.addListener(({value}) => {
      showFrontRef.current(value);
      const k = pendingIndex.current;
      if (k !== null && Math.abs(value - k) < 0.15) announce();
    });
    return () => base.removeListener(id);
  }, [base]);

  const onGestureEvent = useMemo(
    () =>
      Animated.event([{nativeEvent: {translationX: dragX}}], {
        useNativeDriver: true,
        listener: (e: {nativeEvent: {translationX: number}}) =>
          showFrontRef.current(
            current.current - e.nativeEvent.translationX / gap,
          ),
      }),
    [dragX, gap],
  );

  const onHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => {
    const {state, translationX, velocityX} = e.nativeEvent;
    if (
      state !== State.END &&
      state !== State.CANCELLED &&
      state !== State.FAILED
    )
      return;
    const at = current.current;
    let travel = -translationX / gap;
    if ((at === 0 && travel < 0) || (at === n - 1 && travel > 0))
      travel *= RUBBER;
    let step = 0;
    if (state === State.END) {
      if (Math.abs(travel) > 0.5) step = Math.round(travel);
      else if (Math.abs(translationX) > 36 || Math.abs(velocityX) > 500)
        step = translationX < 0 ? 1 : -1;
    }
    const k = Math.max(0, Math.min(n - 1, at + step));
    pendingIndex.current = k !== at ? k : null;
    settleTo(k, at + travel, announce);
  };

  // Read through a ref so the cards' press handler stays the same object and they skip re-rendering.
  const latest = useRef({index, onFlip, onIndexChange});
  latest.current = {index, onFlip, onIndexChange};
  const onPressCard = useCallback((i: number) => {
    const {index: active, onFlip: flip, onIndexChange: change} = latest.current;
    if (i === active) flip();
    else change(i);
  }, []);

  // Cards behind wait for the one in the centre, so they never fill in ahead of it.
  const activeReady = !!entries[index]?.data;

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-8, 8]}
      failOffsetY={[-14, 14]}>
      <Animated.View
        style={{height: CARD_HEIGHT * scale + 2 * SLOT_TOP, width}}
        accessibilityRole="adjustable"
        accessibilityLabel="Your credentials. Swipe left or right">
        {entries.map((entry, i) => (
          <CarouselCard
            key={entry.key}
            data={activeReady || i === index ? entry.data : undefined}
            i={i}
            position={position}
            gap={gap}
            scale={scale}
            width={width}
            depth={Math.abs(i - front)}
            isActive={i === index}
            flipped={i === index && flipped}
            onPressCard={onPressCard}
            reduceMotion={reduceMotion}
          />
        ))}
      </Animated.View>
    </PanGestureHandler>
  );
};

const CarouselCard = React.memo(function CarouselCard({
  data,
  i,
  position,
  gap,
  scale,
  width,
  depth,
  isActive,
  flipped,
  onPressCard,
  reduceMotion,
}: {
  data?: CredentialCardData;
  i: number;
  position: Animated.AnimatedInterpolation<number>;
  gap: number;
  scale: number;
  width: number;
  /** Cards from the one nearest the centre: 0 is drawn on top. */
  depth: number;
  isActive: boolean;
  flipped: boolean;
  onPressCard: (i: number) => void;
  reduceMotion: boolean;
}) {
  const {translateX, rotateY, cardScale, translateY, opacity, dim} =
    useMemo(() => {
      // e: this card's distance from the centre, in cards (negative = to the left).
      const e = Animated.subtract(i, position);
      const range = [-2, -1, 0, 1, 2];
      return {
        translateX: e.interpolate({
          inputRange: range,
          outputRange: range.map(v => v * gap),
          extrapolate: 'extend',
        }),
        rotateY: e.interpolate({
          inputRange: [-1.6, 0, 1.6],
          outputRange: ['40deg', '0deg', '-40deg'],
          extrapolate: 'clamp',
        }),
        cardScale: Animated.multiply(
          e.interpolate({
            inputRange: range,
            outputRange: [0.76, 0.91, FRONT_CARD_SCALE, 0.91, 0.76],
            extrapolate: 'clamp',
          }),
          scale,
        ),
        translateY: e.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0, -FRONT_CARD_LIFT, 0],
          extrapolate: 'clamp',
        }),
        opacity: e.interpolate({
          inputRange: [-2.6, -1.5, 1.5, 2.6],
          outputRange: [0, 1, 1, 0],
          extrapolate: 'clamp',
        }),
        dim: e.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0.16, 0, 0.16],
          extrapolate: 'clamp',
        }),
      };
    }, [i, gap, scale, position]);

  const flip = useRef(new Animated.Value(0)).current;
  // The back is only mounted while it can be seen: mounting it with every card change was the
  // heaviest part of switching cards.
  const [backMounted, setBackMounted] = useState(flipped);
  useEffect(() => {
    if (flipped) setBackMounted(true);
    if (reduceMotion) {
      flip.setValue(flipped ? 1 : 0);
      if (!flipped) setBackMounted(false);
    } else
      Animated.timing(flip, {
        toValue: flipped ? 1 : 0,
        ...motion.flip,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished && !flipped) setBackMounted(false);
      });
  }, [flipped]);
  const frontY = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backY = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const placement = {
    ...slotPosition(width, scale),
    // Android stacks by elevation before zIndex, so both follow the depth.
    zIndex: 10 - depth,
    elevation: depth === 0 ? 10 : Math.max(0, 2 - depth),
    transform: [
      {perspective: 1100},
      {translateX},
      {translateY},
      {rotateY},
      {scale: cardScale},
    ],
  };
  return (
    <>
      {/* Drawn once into a texture that the transforms then move, instead of redrawing the
          card's artwork every frame. */}
      <Animated.View
        pointerEvents={depth <= 1 ? 'auto' : 'none'}
        renderToHardwareTextureAndroid
        style={[styles.slot, placement, {opacity}]}>
        <Pressable
          onPress={() => onPressCard(i)}
          accessibilityRole="button"
          accessibilityLabel={
            data
              ? isActive
                ? `${data.title}. Tap to flip`
                : `Show ${data.title}`
              : 'Loading credential'
          }>
          {data ? (
            <View>
              <Animated.View
                style={[
                  styles.face,
                  {transform: [{perspective: 1200}, {rotateY: frontY}]},
                ]}>
                <CredentialCardFront data={data} />
              </Animated.View>
              {backMounted ? (
                <Animated.View
                  style={[
                    styles.face,
                    styles.back,
                    {transform: [{perspective: 1200}, {rotateY: backY}]},
                  ]}>
                  <CredentialCardBack data={data} showing={flipped} />
                </Animated.View>
              ) : null}
            </View>
          ) : (
            <CardSkeleton reduceMotion={reduceMotion} />
          )}
        </Pressable>
      </Animated.View>
      {/* Outside the texture, so its fading doesn't make the card redraw. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.slot, styles.dim, placement, {opacity: dim}]}
      />
    </>
  );
});

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.card,
    backgroundColor: 'transparent',
    shadowColor: '#0a3970',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 14},
  },
  face: {backfaceVisibility: 'hidden'},
  back: {position: 'absolute', left: 0, top: 0},
  dim: {backgroundColor: '#000', shadowOpacity: 0},
});
