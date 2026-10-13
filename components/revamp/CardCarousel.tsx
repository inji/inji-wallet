import React, {useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {VCMetadata} from '../../shared/VCMetadata';
import {CredentialCardBack, CredentialCardFront} from './CredentialCard';
import {CredentialCardData} from './useCredentialCard';
import {CARD_HEIGHT, CARD_WIDTH, motion, radii, shadows} from './tokens';
import {VCCardSkeleton} from '../VC/common/VCCardSkeleton';

export interface CarouselEntry {
  key: string;
  vcMetadata?: VCMetadata;
  /** Undefined until the credential has loaded; a skeleton stands in meanwhile. */
  data?: CredentialCardData;
}

const SLOT = 0.8; // card scale relative to its design size, at a 390-wide screen
const GAP_RATIO = 200 / 390; // distance between neighbouring cards, as a share of screen width

/**
 * Cover-flow carousel from the design: the active card centred, neighbours turned away in 3D.
 * Cards follow the finger and spring into place on release; tapping the active card flips it.
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
  const scale = (width / 390) * SLOT;
  const gap = width * GAP_RATIO;
  const n = entries.length;

  // Fractional index: 1.4 means 40% of the way from card 1 to card 2.
  const position = useRef(new Animated.Value(index)).current;
  const current = useRef(index);
  const settleTo = (k: number) => {
    current.current = k;
    if (reduceMotion) {
      position.setValue(k);
    } else {
      Animated.timing(position, {
        toValue: k,
        ...motion.settle,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    if (index !== current.current) settleTo(index);
  }, [index]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: (_, g) => {
          let dx = g.dx;
          const at = current.current;
          // Rubber band past the first and last card.
          if ((at === 0 && dx > 0) || (at === n - 1 && dx < 0)) dx *= 0.35;
          position.setValue(at - dx / gap);
        },
        onPanResponderRelease: (_, g) => {
          const at = current.current;
          let step = 0;
          if (Math.abs(g.dx) > gap * 0.5) step = -Math.round(g.dx / gap);
          else if (Math.abs(g.dx) > 36 || Math.abs(g.vx) > 0.5)
            step = g.dx < 0 ? 1 : -1;
          const k = Math.max(0, Math.min(n - 1, at + step));
          settleTo(k);
          if (k !== at) onIndexChange(k);
        },
        onPanResponderTerminate: () => settleTo(current.current),
      }),
    [n, gap],
  );

  return (
    <View
      {...pan.panHandlers}
      style={{height: CARD_HEIGHT * scale + 24, width}}
      accessibilityRole="adjustable"
      accessibilityLabel="Your credentials. Swipe left or right">
      {entries.map((entry, i) => (
        <CarouselCard
          key={entry.key}
          entry={entry}
          i={i}
          position={position}
          gap={gap}
          scale={scale}
          width={width}
          isActive={i === index}
          near={Math.abs(i - index) <= 1}
          flipped={i === index && flipped}
          onPress={() => (i === index ? onFlip() : onIndexChange(i))}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
};

const CarouselCard: React.FC<{
  entry: CarouselEntry;
  i: number;
  position: Animated.Value;
  gap: number;
  scale: number;
  width: number;
  isActive: boolean;
  near: boolean;
  flipped: boolean;
  onPress: () => void;
  reduceMotion: boolean;
}> = ({
  entry,
  i,
  position,
  gap,
  scale,
  width,
  isActive,
  near,
  flipped,
  onPress,
  reduceMotion,
}) => {
  const {data} = entry;

  const {translateX, rotateY, cardScale, translateY, opacity, dim} =
    useMemo(() => {
      // e: this card's distance from the centre, in cards (negative = to the left).
      const e = Animated.subtract(new Animated.Value(i), position);
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
            outputRange: [0.76, 0.91, 1.03, 0.91, 0.76],
            extrapolate: 'clamp',
          }),
          scale,
        ),
        translateY: e.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0, -8, 0],
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
  useEffect(() => {
    if (reduceMotion) flip.setValue(flipped ? 1 : 0);
    else
      Animated.timing(flip, {
        toValue: flipped ? 1 : 0,
        ...motion.flip,
        useNativeDriver: true,
      }).start();
  }, [flipped]);
  const frontY = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backY = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const left = (width - CARD_WIDTH) / 2;
  return (
    <Animated.View
      pointerEvents={near ? 'auto' : 'none'}
      style={[
        styles.slot,
        {
          left,
          // Scaling is about the centre, so shift up by the space the shrink leaves at the top.
          top: 12 - (CARD_HEIGHT * (1 - scale)) / 2,
          zIndex: isActive ? 10 : 1,
          opacity,
          transform: [
            {perspective: 1100},
            {translateX},
            {translateY},
            {rotateY},
            {scale: cardScale},
          ],
        },
        isActive && shadows.card,
      ]}>
      <Pressable
        onPress={onPress}
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
            {isActive ? (
              <Animated.View
                style={[
                  styles.face,
                  styles.back,
                  {transform: [{perspective: 1200}, {rotateY: backY}]},
                ]}>
                <CredentialCardBack data={data} showing={flipped} />
              </Animated.View>
            ) : null}
            <Animated.View
              pointerEvents="none"
              style={[styles.dim, {opacity: dim}]}
            />
          </View>
        ) : (
          <View style={styles.skeleton}>
            <VCCardSkeleton />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.card,
  },
  face: {backfaceVisibility: 'hidden'},
  back: {position: 'absolute', left: 0, top: 0},
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    borderRadius: radii.card,
  },
  skeleton: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
});
