import React from 'react';
import {StyleSheet, Text, TextProps, useWindowDimensions} from 'react-native';

/**
 * Text that applies the system font size itself instead of leaving it to Android.
 *
 * React Native caches text measurements by font attributes, not by the system font scale or
 * display density, so after the user changes font size or display zoom with the app open, text
 * keeps its old measured size and is cut off. Sizes here are scaled and rounded to whole device
 * pixels, which makes both settings part of the attributes, so the text is measured again.
 *
 * `maxFontSizeMultiplier` caps the growth, as on React Native's own Text.
 */
export const ScaledText: React.FC<TextProps> = ({
  style,
  maxFontSizeMultiplier,
  ...props
}) => {
  const {fontScale, scale} = useWindowDimensions();
  const k = maxFontSizeMultiplier
    ? Math.min(fontScale, maxFontSizeMultiplier)
    : fontScale;
  const flat = StyleSheet.flatten(style) ?? {};
  const toPixels = (size: number) => Math.round(size * k * scale) / scale;
  const scaled = {
    ...(flat.fontSize != null && {fontSize: toPixels(flat.fontSize)}),
    ...(flat.lineHeight != null && {lineHeight: toPixels(flat.lineHeight)}),
  };
  return <Text {...props} allowFontScaling={false} style={[flat, scaled]} />;
};
