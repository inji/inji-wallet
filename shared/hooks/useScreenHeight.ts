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
        setKeyboardHeight(event.endCoordinates.height + 150);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const screenHeight = Math.floor(height - keyboardHeight);

  return {isSmallScreen, screenHeight};
};
