import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {Text} from '../../../components/ui';

const styles = Theme.ShareNearbyStyles;

export function HelpSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.inset}>
      <Text weight="semibold" style={styles.body}>
        {title}
      </Text>
      <Text style={styles.body}>{description}</Text>
    </View>
  );
}
