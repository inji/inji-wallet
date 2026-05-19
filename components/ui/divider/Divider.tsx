import React from 'react';
import {View} from 'react-native';
import {Row, Text} from '../index';
import {Theme} from '../styleUtils';

interface DividerProps {
  text: string;
}

export const Divider: React.FC<DividerProps> = ({text}) => {
  return (
    <Row style={Theme.DividerStyles.container}>
      <View style={Theme.DividerStyles.line} />
      <View style={Theme.DividerStyles.badge}>
        <Text style={Theme.DividerStyles.text}>{text}</Text>
      </View>
      <View style={Theme.DividerStyles.line} />
    </Row>
  );
};
