import React from 'react';
import {View} from 'react-native';
import {Row, Text} from '../index';
import {Theme} from '../styleUtils';
import testIDProps from '../../../shared/commonUtil';

interface DividerProps {
  text: string;
  testId?: string;
}

export const Divider: React.FC<DividerProps> = ({text, testId}) => {
  return (
    <Row {...(testId ? testIDProps(`divider-${testId}`) : {})} style={Theme.DividerStyles.container}>
      <View style={Theme.DividerStyles.line} />
      <View style={Theme.DividerStyles.badge}>
        <Text style={Theme.DividerStyles.text}>{text}</Text>
      </View>
      <View style={Theme.DividerStyles.line} />
    </Row>
  );
};
