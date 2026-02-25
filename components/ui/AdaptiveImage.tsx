import {Image, ImageStyle, StyleProp} from 'react-native';
import React from 'react';
import {SvgUri} from 'react-native-svg';
import testIDProps from '../../shared/commonUtil';

interface AdaptiveImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  testID: string;
}

const getPathname = (uri: string): string => uri.split('?')[0].split('#')[0];

const checkIsSvg = (uri: string): boolean => /\.svg$/i.test(getPathname(uri));

export const AdaptiveImage: React.FC<AdaptiveImageProps> = ({
  uri,
  style,
  testID,
}) => {
  if (!uri) return null;

  if (checkIsSvg(uri)) {
    return (
      <SvgUri
        uri={uri}
        style={style}
        height={60}
        width={60}
        {...testIDProps(testID)}
      />
    );
  }

  return (
    <Image
      source={{uri: uri}}
      style={style}
      resizeMode="contain"
      {...testIDProps(testID)}
    />
  );
};
