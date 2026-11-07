import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Theme} from '../../../components/ui/styleUtils';

const progressStyles = Theme.ShareNearbyProgressStyles;

/** Native reports transfer stages, not byte progress: never imply a percentage. */
export function TransferProgress({label}: {label: string}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trackWidth) return;
    animation.setValue(0);
    const loop = Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [animation, trackWidth]);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{busy: true}}
      onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}
      style={progressStyles.track}>
      <Animated.View
        style={[
          progressStyles.segment,
          {
            transform: [
              {
                translateX: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-trackWidth * 0.6, trackWidth],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={Theme.Colors.GradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={progressStyles.fill}
        />
      </Animated.View>
    </View>
  );
}
