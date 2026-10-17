import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Theme} from './styleUtils';
import {ColorTokens, withAlpha} from './themes/designTokens';
import testIDProps from '../../shared/commonUtil';

const {colors: C} = Theme.Tokens;
const OPEN_DURATION_MS = 280;
const CLOSE_DURATION_MS = 200;

/**
 * A sheet that slides up from the bottom over a dimmed screen and sizes itself to its
 * content. It slides back down before unmounting when `isVisible` turns false, then calls
 * `onClosed`. iOS cannot present another modal or push a screen cleanly until this one is
 * fully dismissed, so an action that does (opening a camera, another sheet) belongs in
 * `onClosed`.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onRequestClose,
  onClosed,
  dismissOnBackdropPress = true,
  testID,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const {height} = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(isVisible);
  const hasOpened = useRef(isVisible);

  useEffect(() => {
    if (isVisible) {
      hasOpened.current = true;
      setIsMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: OPEN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (hasOpened.current) {
      Animated.timing(progress, {
        toValue: 0,
        duration: CLOSE_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({finished}) => {
        if (finished) {
          setIsMounted(false);
          // iOS reports the end of the dismissal through the modal's onDismiss instead.
          if (Platform.OS !== 'ios') {
            onClosed?.();
          }
        }
      });
    }
  }, [isVisible]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <Modal
      transparent={true}
      visible={isMounted}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onRequestClose}
      onDismiss={onClosed}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, {opacity: progress}]}>
          <Pressable
            {...(testID ? testIDProps(`${testID}Backdrop`) : {})}
            style={StyleSheet.absoluteFill}
            accessible={false}
            onPress={dismissOnBackdropPress ? onRequestClose : undefined}
          />
        </Animated.View>
        <Animated.View
          {...(testID ? testIDProps(testID) : {})}
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 16) + 8,
              transform: [{translateY}],
            },
          ]}>
          <View style={styles.handle} />
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(ColorTokens.dark.canvas, 0.55),
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: C.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.line,
    marginBottom: 18,
  },
});

interface BottomSheetProps {
  isVisible: boolean;
  onRequestClose: () => void;
  // Called once the sheet has fully closed.
  onClosed?: () => void;
  dismissOnBackdropPress?: boolean;
  testID?: string;
  children: React.ReactNode;
}
