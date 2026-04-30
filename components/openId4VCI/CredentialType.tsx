import {Pressable, View} from 'react-native';
import testIDProps from '../../shared/commonUtil';
import {Theme} from '../ui/styleUtils';
import {Text} from '../ui';
import React from 'react';
import {displayType} from '../../machines/Issuers/IssuersMachine';
import {SvgImage} from '../ui/svg';
import {getDisplayObjectForCurrentLanguage} from '../../shared/openId4VCI/Utils';
import {CredentialTypes} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import { getCredentialType } from '../VC/common/VCUtils';

export const CredentialType: React.FC<CredentialTypeProps> = props => {
  const credentialDisplay =
    (props.item as any).credential_metadata?.display ?? props.item.display;
  const selectedIssuerDisplayObject = credentialDisplay?.length
    ? getDisplayObjectForCurrentLanguage(credentialDisplay)
    : {name:getCredentialType(props.item)};

  return (
    <Pressable
      accessible={false}
      {...testIDProps(`credentialTypeItem-${props.testID}`)}
      onPress={props.onPress}
      style={({pressed}) =>
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
        {selectedIssuerDisplayObject?.logo &&
          SvgImage.IssuerIcon({
            ...props,
            displayDetails: selectedIssuerDisplayObject,
          })}
      </View>
      <View style={Theme.IssuersScreenStyles.issuerBoxContent}>
        <Text
          testID={`credentialTypeHeading-${props.testID}`}
          style={Theme.IssuersScreenStyles.issuerHeading}>
          {selectedIssuerDisplayObject.name as string}
        </Text>
      </View>
    </Pressable>
  );
};

export interface CredentialTypeProps {
  displayDetails: displayType;
  onPress: () => void;
  testID: string;
  item: CredentialTypes;
}
