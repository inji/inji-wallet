import React from 'react';
import {StyleProp, Text as RNText, TextStyle} from 'react-native';
import {Spacing, Theme} from './styleUtils';
import testIDProps from '../../shared/commonUtil';

export const Text: React.FC<TextProps> = (props: TextProps) => {
  const weight = props.weight || 'regular';

  const textStyles: StyleProp<TextStyle> = [
    Theme.TextStyles.base,
    Theme.TextStyles[weight],
    props.color ? {color: props.color} : null,
    props.align ? {textAlign: props.align} : {textAlign: 'left'},
    props.margin ? Theme.spacing('margin', props.margin) : null,
    props.size ? Theme.TextStyles[props.size] : null,
    props.style ? props.style : null,
  ];

  return (
    <RNText
      {...testIDProps(props.testID)}
      style={textStyles}
      numberOfLines={props.numLines}
      onTextLayout={props.onTextLayout}
      ellipsizeMode={props.ellipsizeMode}
      accessible={props.accessible}
      onPress={props.onPress}>
      {props.children}
    </RNText>
  );
};

interface TextProps {
  testID?: string;
  children: React.ReactNode;
  color?: string;
  weight?: 'regular' | 'semibold' | 'bold' | 'extraLight';
  align?: TextStyle['textAlign'];
  margin?: Spacing;
  size?:
    | 'small'
    | 'extraSmall'
    | 'smaller'
    | 'regular'
    | 'large'
    | 'mediumSmall'
    | 'medium'
    | 'mediumExtraSmall';
  lineHeight?: number;
  numLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip' | undefined;
  style?: StyleProp<TextStyle>;
  accessible?: boolean | true;
  onPress?: () => void;
  onTextLayout?: (e: any) => void;
}
