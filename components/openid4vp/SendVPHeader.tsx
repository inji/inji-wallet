import React from 'react';
import {View} from 'react-native';
import {Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {BackButton} from '../ui/backButton/BackButton';
import {VerifierInfo} from './verifier/VerifierInfo';

type SendVPHeaderProps = {
  topInset: number;
  requesterLabel: string;
  onDismiss: () => void;
  verifierName?: string;
  verifierLogo?: string;
  isDcqlFlow: boolean;
  onInfoPress: () => void;
};

export const SendVPHeader: React.FC<SendVPHeaderProps> = ({
  topInset,
  requesterLabel,
  onDismiss,
  verifierName,
  verifierLogo,
  isDcqlFlow,
  onInfoPress,
}) => {
  return (
    <View
      style={{
        backgroundColor: Theme.Colors.whiteBackgroundColor,
        paddingTop: topInset,
      }}>
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          columnGap: 4,
        }}>
        <BackButton
          onPress={onDismiss}
          type={'chevron'}
          customIconStyle={{color: Theme.Colors.blackIcon}}
        />
        <View style={Theme.Styles.sendVPHeaderContainer}>
          <Text style={Theme.Styles.sendVPHeaderTitle}>{requesterLabel}</Text>
        </View>
      </View>
      {verifierName && (
        <VerifierInfo
          logoUri={verifierLogo}
          name={verifierName}
          showInfo={isDcqlFlow}
          onInfoPress={onInfoPress}
        />
      )}
    </View>
  );
};

