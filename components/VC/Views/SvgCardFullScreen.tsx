import React from 'react';
import {
  Modal,
  Pressable,
  StatusBar,
  useWindowDimensions,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {SvgCss} from 'react-native-svg/css';
import testIDProps from '../../../shared/commonUtil';

const SCREEN_MARGIN = 16;

/** Width and height of a landscape card turned sideways to fill a portrait screen. */
export function fullScreenCardSize(
  screenWidth: number,
  screenHeight: number,
  aspectRatio: number,
) {
  const width = Math.min(
    screenHeight - 2 * SCREEN_MARGIN,
    (screenWidth - 2 * SCREEN_MARGIN) / aspectRatio,
  );
  return {width, height: width * aspectRatio};
}

/** Shows one SVG card full screen, turned sideways for readability; any tap closes it. */
export const SvgCardFullScreen: React.FC<SvgCardFullScreenProps> = ({
  svg,
  aspectRatio,
  onClose,
}) => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const card = fullScreenCardSize(screenWidth, screenHeight, aspectRatio);

  return (
    <Modal
      visible={svg !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <StatusBar hidden />
      <Pressable
        {...testIDProps('svgCardFullScreen')}
        onPress={onClose}
        style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.92)'}}>
        {svg !== null && (
          <View
            style={{
              position: 'absolute',
              left: (screenWidth - card.width) / 2,
              top: (screenHeight - card.height) / 2,
              width: card.width,
              height: card.height,
              transform: [{rotate: '90deg'}],
            }}>
            <SvgCss
              xml={svg}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            />
          </View>
        )}
        <View
          {...testIDProps('closeSvgCardFullScreen')}
          style={{position: 'absolute', top: 24, right: 20}}>
          <Icon name="close" size={24} color="#FFFFFF" />
        </View>
      </Pressable>
    </Modal>
  );
};

interface SvgCardFullScreenProps {
  svg: string | null;
  aspectRatio: number;
  onClose: () => void;
}
