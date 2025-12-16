import {useEffect, useState} from 'react';
import {Dimensions, Keyboard} from 'react-native';

export const useScreenHeight = () => {
  const {height} = Dimensions.get('window');
  const isSmallScreen = height < 600;

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      event => {
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight + 150);
      },
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const screenHeight = Math.floor(height - keyboardHeight);

  return {isSmallScreen, screenHeight};
};
