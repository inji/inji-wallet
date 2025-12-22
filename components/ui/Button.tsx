import React from 'react';
import {
  Button as RNEButton,
  ButtonProps as RNEButtonProps,
} from 'react-native-elements';
import {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import {Text} from './Text';
import {Theme, Spacing} from './styleUtils';
import testIDProps from '../../shared/commonUtil';

export const Button: React.FC<ButtonProps> = props => {
  const type = props.type || 'solid';

  const buttonStylesWithSize =
    props.size !== undefined
      ? {
          ...Theme.ButtonStyles[type],
          ...Theme.ButtonStyles[props.size],
        }
      : Theme.ButtonStyles[type];

  const buttonStyle: StyleProp<ViewStyle> = [
    props.fill ? Theme.ButtonStyles.fill : null,
    buttonStylesWithSize,
    props.disabled && props.type === 'outline'
      ? Theme.ButtonStyles.disabledOutlineButton
      : null,
    {width: props.width ?? '100%'},
  ];
  const containerStyle: StyleProp<ViewStyle> = [
    !(type === 'gradient')
      ? Theme.ButtonStyles.container
      : {flexDirection: 'row'},
    props.disabled && props.type !== 'outline'
      ? Theme.ButtonStyles.disabled
      : null,
    props.margin ? Theme.spacing('margin', props.margin) : null,
    type === 'gradient'
      ? props.isVcThere
        ? Theme.ButtonStyles.float
        : buttonStylesWithSize
      : null,
    props.styles,
  ];
  const handleOnPress = (event: GestureResponderEvent) => {
    if (!props.disabled && props.onPress) {
      props.onPress(event);
    }
  };

  return !(type === 'gradient') ? (
    <RNEButton
      {...testIDProps(props.testID)}
      buttonStyle={buttonStyle}
      containerStyle={[
        props.fill ? Theme.ButtonStyles.fill : null,
        containerStyle,
      ]}
      type={props.type}
      raised={props.raised}
      title={
        <Text
          style={{paddingTop: 3}}
          weight="semibold"
          align="center"
          color={
            type === 'solid' || type === 'addId' || type === 'radius'
              ? Theme.Colors.whiteText
              : type === 'plain'
              ? Theme.Colors.plainText + 66
              : type === 'outline' && props.disabled
              ? Theme.Colors.textLabel
              : Theme.Colors.AddIdBtnTxt
          }>
          {props.title}
        </Text>
      }
      style={[buttonStyle]}
      icon={props.icon}
      onPress={handleOnPress}
      loading={props.loading}
    />
  ) : (
    <RNEButton
      {...testIDProps(props.testID)}
      buttonStyle={buttonStyle}
      ViewComponent={require('react-native-linear-gradient').default}
      linearGradientProps={{
        colors: !props.disabled
          ? Theme.Colors.GradientColors
          : Theme.Colors.DisabledColors,
        start: Theme.LinearGradientDirection.start,
        end: Theme.LinearGradientDirection.end,
      }}
      containerStyle={[
        props.fill ? Theme.ButtonStyles.fill : null,
        containerStyle,
      ]}
      type={props.type}
      raised={props.raised}
      title={
        <Text
          style={props.icon ? {paddingLeft: 10} : {paddingLeft: 0}}
          weight="bold"
          color={
            type === 'solid' || type === 'gradient' || type === 'radius'
              ? Theme.Colors.whiteText
              : Theme.Colors.DownloadIdBtnTxt
          }>
          {props.title}
        </Text>
      }
      style={[buttonStyle]}
      icon={props.icon}
      onPress={handleOnPress}
      loading={props.loading}
    />
  );
};

interface ButtonProps {
  testID?: string;
  title: string;
  disabled?: boolean;
  margin?: Spacing;
  type?: RNEButtonProps['type'] | 'gradient';
  isVcThere?: boolean;
  onPress?: RNEButtonProps['onPress'];
  fill?: boolean;
  raised?: boolean;
  loading?: boolean;
  icon?: RNEButtonProps['icon'];
  styles?: StyleProp<ViewStyle>;
  colors?: (string | number)[];
  width?: number;
  size?: string;
}
