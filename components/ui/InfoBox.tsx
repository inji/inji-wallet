import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {Text} from './Text';
import {Theme} from './styleUtils';
import testIDProps from '../../shared/commonUtil';

type InfoBoxProps = {
  message: string;
  testID: string;
  style?: StyleProp<ViewStyle>;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
};

export const InfoBox: React.FC<InfoBoxProps> = ({
                                                  message,
                                                  testID,
                                                  style,
                                                  backgroundColor,
                                                  borderColor,
                                                  textColor
                                                }) => {
  const messageTestID = `${testID}-message`

  return (
    <View
      {...testIDProps(testID)}
      style={[
        styles.container,
        {backgroundColor},
        {borderColor},
        style,
      ]}>
      <Text testID={messageTestID} color={textColor} style={Theme.TextStyles.regular}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  containerWithIcon: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  icon: {
    marginRight: 12,
    marginTop: 1,
  },
});



