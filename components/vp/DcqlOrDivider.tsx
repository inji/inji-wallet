import React from 'react';
import {View} from 'react-native';
import {Row, Text} from '../ui';
import {Theme} from '../ui/styleUtils';

export const DcqlOrDivider: React.FC = () => {
  return (
    <Row style={Theme.DcqlStyles.orDividerContainer}>
      <View style={Theme.DcqlStyles.orDividerLine} />
      <View style={Theme.DcqlStyles.orDividerBadge}>
        <Text style={Theme.DcqlStyles.orDividerText}>OR</Text>
      </View>
      <View style={Theme.DcqlStyles.orDividerLine} />
    </Row>
  );
};
