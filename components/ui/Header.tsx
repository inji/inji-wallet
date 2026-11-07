import React from 'react';
import {Text, View, StyleProp, TextStyle, ViewStyle} from 'react-native';
import {Column, Row} from './Layout';
import {Theme, ElevationLevel} from './styleUtils';
import testIDProps from '../../shared/commonUtil';
import {BackButton} from './backButton/BackButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const Header: React.FC<HeaderProps> = ({
  goBack,
  title,
  testID,
  headerLeft,
  headerRight,
  safeArea = true,
  elevation = 2,
  titleAlign = 'center',
  containerStyle,
  titleStyle,
  titleWeight,
}) => {
  const insets = useSafeAreaInsets();
  const leftControl =
    headerLeft ?? (goBack ? <BackButton onPress={goBack} /> : null);
  const usesStandardBackButton = headerLeft === undefined && !!goBack;
  return (
    <Column
      safe={safeArea}
      safeEdges={['left', 'right']}
      align="center"
      testID={testID}>
      <Row elevation={elevation}>
        <View
          style={[
            Theme.HeaderStyles.container,
            safeArea && Theme.HeaderStyles.inset,
            safeArea && {
              paddingTop: Math.max(
                insets.top,
                Theme.HeaderStyles.inset.paddingTop,
              ),
            },
            containerStyle,
          ]}>
          {leftControl}
          <Row fill align={titleAlign === 'left' ? 'flex-start' : 'center'}>
            <Column style={Theme.HeaderStyles.titleColumn}>
              <View
                accessibilityRole="header"
                style={[
                  titleAlign === 'left'
                    ? Theme.HeaderStyles.titleLeft
                    : Theme.HeaderStyles.titleCentered,
                  usesStandardBackButton &&
                    !headerRight &&
                    Theme.HeaderStyles.standardBackTitle,
                ]}>
                <Text
                  style={[
                    Theme.TextStyles.semiBoldHeader,
                    titleWeight && Theme.TextStyles[titleWeight],
                    titleStyle,
                  ]}
                  {...testIDProps('title')}>
                  {title}
                </Text>
              </View>
            </Column>
          </Row>
          {headerRight}
        </View>
      </Row>
    </Column>
  );
};

interface HeaderProps {
  title?: string;
  goBack?: () => void;
  testID?: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  /** Disable when the containing screen already handles safe-area insets. */
  safeArea?: boolean;
  elevation?: ElevationLevel;
  titleAlign?: 'left' | 'center';
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  titleWeight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extraLight';
}
