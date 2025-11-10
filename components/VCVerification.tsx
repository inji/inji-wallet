import React from 'react';
import {View} from 'react-native';
import testIDProps from '../shared/commonUtil';
import {Display} from './VC/common/VCUtils';
import VerifiedIcon from './VerifiedIcon';
import PendingIcon from './PendingIcon';
import {Row, Text} from './ui';
import {Theme} from './ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {VCMetadata} from '../shared/VCMetadata';
import {RevocationStatus} from '../shared/vcVerifier/VcVerifier';
import {formattedDate} from '../shared/openId4VCI/Utils';

export const VCVerification: React.FC<VCVerificationProps> = ({
  vcMetadata,
  display,
  showLastChecked = true,
}) => {
  const {t} = useTranslation('VcDetails');

  let statusText: string;
  let statusIcon: JSX.Element;

  if (vcMetadata.isVerified) {
    if (vcMetadata.isRevoked === RevocationStatus.TRUE) {
      statusText = t('revoked');
      statusIcon = <PendingIcon color="brown" />;
    } else if (vcMetadata.isExpired) {
      statusText = t('expired');
      statusIcon = <PendingIcon color="red" />;
    } else if (vcMetadata.isRevoked === RevocationStatus.UNDETERMINED) {
      statusText = t('pending');
      statusIcon = <PendingIcon color="orange" />;
    } else {
      statusText = t('valid');
      statusIcon = <VerifiedIcon />;
    }
  } else {
    statusText = t('pending');
    statusIcon = <PendingIcon color="orange" />;
  }

  return (
    <View
      {...testIDProps('verified')}
      style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingVertical: 6,
      }}>
      {/* First Row: Status Icon + Text */}
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {statusIcon}
        <Text
          testID="verificationStatus"
          color={display.getTextColor(Theme.Colors.Details)}
          style={Theme.Styles.verificationStatus}>
          {statusText}
        </Text>
      </View>

      {showLastChecked && vcMetadata.lastKnownStatusTimestamp && (
        <View style={{marginTop: 4}}>
          <Text
            testID="lastCheckedLabel"
            color={display.getTextColor(Theme.Colors.Details)}
            style={[
              Theme.Styles.verificationStatus,
              {fontFamily: 'Montserrat_400'},
            ]}>
            {t('lastChecked')}
          </Text>
          <Text
            testID="lastKnownStatusTimestamp"
            color={display.getTextColor(Theme.Colors.Details)}
            style={[
              Theme.Styles.verificationStatus,
              {fontFamily: 'Montserrat_400'},
            ]}>
            {formattedDate(vcMetadata.lastKnownStatusTimestamp)}
          </Text>
        </View>
      )}
    </View>
  );
};

export interface VCVerificationProps {
  vcMetadata: VCMetadata;
  display: Display;
  showLastChecked?: boolean;
}
