import React from 'react';
import {StyleSheet, View} from 'react-native';

const DOT_COLOR = '#d2461f';

/**
 * Marks the most recently added card: a dot on the card's top-right corner, partly over its
 * edge. Place it inside a box the size of the card, which must not clip its children.
 */
export const NewCardDot: React.FC<{size?: number}> = ({size = 26}) => {
  const ring = Math.max(2, Math.round(size * 0.12));
  const overhang = Math.round(size * 0.3);
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring,
          top: -overhang,
          right: -overhang,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    backgroundColor: DOT_COLOR,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
});
