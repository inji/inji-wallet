import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {CARD_HEIGHT, CARD_WIDTH, radii} from './tokens';
import {useRevampTheme} from './useRevampTheme';

/** Stands in for a credential card while it loads, laid out like the card's front. */
export const CardSkeleton: React.FC<{reduceMotion?: boolean}> = ({
  reduceMotion,
}) => {
  const {c} = useRevampTheme();
  const pulse = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion]);

  const bar = {backgroundColor: c.sand};
  return (
    <View style={[styles.card, {backgroundColor: c.card, borderColor: c.line}]}>
      <Animated.View style={[StyleSheet.absoluteFill, {opacity: pulse}]}>
        <View style={[styles.photo, bar]} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={{flex: 1, gap: 8}}>
              <View style={[styles.title, bar]} />
              <View style={[styles.issuer, bar]} />
            </View>
            <View style={[styles.badge, bar]} />
          </View>
          <View style={styles.lines}>
            <View style={[styles.holder, bar]} />
            <View style={[styles.line, bar]} />
            <View style={[styles.lineShort, bar]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photo: {
    position: 'absolute',
    left: 10,
    bottom: 0,
    width: 104,
    height: 125,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  body: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  topRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  title: {width: '55%', height: 24, borderRadius: 6},
  issuer: {width: '40%', height: 12, borderRadius: 4},
  badge: {width: 46, height: 46, borderRadius: radii.pill},
  lines: {marginLeft: 98, gap: 8},
  holder: {width: '70%', height: 17, borderRadius: 5},
  line: {width: '55%', height: 12, borderRadius: 4},
  lineShort: {width: '40%', height: 12, borderRadius: 4},
});
