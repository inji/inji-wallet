import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Theme} from './ui/styleUtils';

const COLORS = Theme.Colors.Design;

/** The verifier's logo in a teal ring, or a building icon when it has none or it fails to load. */
export const VerifierAvatar: React.FC<{logo?: string; size?: number}> = ({
  logo,
  size = 72,
}) => {
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [logo]);

  return (
    <View
      style={[
        styles.circle,
        {width: size, height: size, borderRadius: size / 2},
      ]}>
      {logo && !logoFailed ? (
        <Image
          source={{uri: logo}}
          style={{width: size * 0.66, height: size * 0.66}}
          resizeMode="contain"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <Icon
          name="office-building-outline"
          type="material-community"
          size={size * 0.42}
          color={COLORS.teal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    borderWidth: 3,
    borderColor: COLORS.teal,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 4,
  },
});
