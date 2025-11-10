import React from 'react';
import {View} from 'react-native';
import {Text} from '../ui/Text';
import { formattedDate } from '../../shared/openId4VCI/Utils';

export const Timestamp: React.FC<TimestampProps> = props => {
  return (
    <View>
      <Text
        testID={`${props.testId}Time`}
        size="regular"
        style={{
          fontFamily: 'Montserrat_500Medium',
          fontWeight: '600',
          fontSize: 14,
          letterSpacing: 0,
          lineHeight: 17,
        }}>
        {formattedDate(props.time)}
      </Text>
    </View>
  );
};

interface TimestampProps {
  time: number;
  testId: string;
}
