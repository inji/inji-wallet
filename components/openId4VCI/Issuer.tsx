import React from 'react';
import { Pressable, View } from 'react-native';
import { Theme } from '../ui/styleUtils';
import testIDProps from '../../shared/commonUtil';
import { Text } from '../ui';
import { displayType } from '../../machines/Issuers/IssuersMachine';
import { SvgImage } from '../ui/svg';

export const Issuer: React.FC<IssuerProps> = (props: IssuerProps) => {

  return (
    <Pressable
      accessible={false}
      {...testIDProps(`issuer-${props.testID}`)}
      onPress={props.onPress}
      style={({ pressed }) =>
        pressed
          ? [
            Theme.IssuersScreenStyles.issuerBoxContainerPressed,
            Theme.Styles.boxShadow,
          ]
          : [
            Theme.IssuersScreenStyles.issuerBoxContainer,
            Theme.Styles.boxShadow,
          ]
      }>
      <View style={Theme.IssuersScreenStyles.issuerBoxIconContainer}>
        {props.displayDetails.logo
          ? SvgImage.IssuerIcon(props)
          : SvgImage.defaultIssuerLogo(props.defaultLogo)}
      </View>
      <View style={Theme.IssuersScreenStyles.issuerBoxContent}>
        <Text
          testID={`issuerHeading-${props.testID}`}
          style={Theme.IssuersScreenStyles.issuerHeading}>
          {props.displayDetails.title ?? props.displayDetails.name}
        </Text>
        <Text
          testID={`issuerDescription-${props.testID}`}
          style={Theme.IssuersScreenStyles.issuerDescription}>
          {props.displayDetails.description}
        </Text>
      </View>
    </Pressable>
  );
};

export interface IssuerProps {
  displayDetails: displayType;
  onPress: () => void;
  testID: string;
  defaultLogo?: any;
}
