import {Image, StyleProp, ImageStyle} from 'react-native';
import React, {useEffect} from 'react';
import {SvgUri} from 'react-native-svg';

interface InjiImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
}

type ImageType = 'svg' | 'image';

interface ImageState {
  uri: string | null;
  type: ImageType | null;
}

const getPathname = (uri: string): string => uri.split('?')[0].split('#')[0];

const checkIsSvg = (uri: string): boolean => /\.svg$/i.test(getPathname(uri));

export const AdaptiveImage: React.FC<InjiImageProps> = ({uri, style}) => {
  const [imageState, setImageState] = React.useState<ImageState>({
    uri: null,
    type: null,
  });

  useEffect(() => {
    if (!uri) {
      setImageState({uri: null, type: null});
      return;
    }
    const type: ImageType = checkIsSvg(uri) ? 'svg' : 'image';

    setImageState({uri, type});
  }, [uri]);

  if (!imageState.uri) return null;

  if (imageState.type === 'svg') {
    return <SvgUri uri={imageState.uri} style={style} height={60} width={60}/>;
  }

  return <Image source={{uri: imageState.uri}} style={style} resizeMode="contain"/>;
};
