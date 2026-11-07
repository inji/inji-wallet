import React, {useState, useRef, useMemo, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Animated, Easing, View, Pressable} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Text} from '../../../components/ui';
import {Theme} from '../../../components/ui/styleUtils';
import {AUTO_HOME_SECONDS} from './OutcomeActions';

const styles = Theme.ShareNearbyStyles;
const outcomeStyles = Theme.ShareNearbyOutcomeStyles;

/** Frame 50: after a share the wallet returns Home by itself unless the holder stays (51). */
export function AutoHome({onDone}: {onDone: () => void}) {
  const {t} = useTranslation('ShareNearby');
  const [remaining, setRemaining] = useState(AUTO_HOME_SECONDS);
  const [isStaying, setStaying] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const countdownProgress = useRef(new Animated.Value(1)).current;
  const barTranslation = useMemo(
    () =>
      countdownProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [-trackWidth, 0],
      }),
    [countdownProgress, trackWidth],
  );
  useEffect(() => {
    if (isStaying) return;
    const animation = Animated.timing(countdownProgress, {
      toValue: 0,
      duration: AUTO_HOME_SECONDS * 1000,
      easing: Easing.linear,
      useNativeDriver: true,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [countdownProgress, isStaying]);
  useEffect(() => {
    if (isStaying) return;
    if (remaining === 0) {
      onDone();
      return;
    }
    const timer = setTimeout(() => setRemaining(seconds => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [isStaying, remaining, onDone]);
  if (isStaying) return null;
  return (
    <View style={outcomeStyles.autoHome} testID="mdocAutoHome">
      <View style={outcomeStyles.autoHomeRow}>
        <Text style={styles.small}>
          {t('outcome.goingHome')}{' '}
          <Text weight="bold" style={styles.small}>
            {t('outcome.seconds', {count: remaining})}
          </Text>
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setStaying(true)}>
          <Text weight="semibold" style={styles.link}>
            {t('outcome.stayHere')}
          </Text>
        </Pressable>
      </View>
      <View
        style={outcomeStyles.autoHomeTrack}
        onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}>
        <Animated.View
          style={[
            outcomeStyles.autoHomeBar,
            {transform: [{translateX: barTranslation}]},
          ]}>
          <LinearGradient
            colors={Theme.Colors.GradientColors}
            start={Theme.LinearGradientDirection.start}
            end={Theme.LinearGradientDirection.end}
            style={outcomeStyles.autoHomeFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}
