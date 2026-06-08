import React from 'react';
import {Button, Column, Text} from '../ui';
import {Theme} from '../ui/styleUtils';

type SendVPConsentContentProps = {
  isDcqlFlow: boolean;
  isCancelling: boolean;
  isAuthorizationFlow: boolean;
  disableShareButton: boolean;
  onShare: () => void;
  onReject: () => void;
  consentAndShareLabel: string;
  dcqlInstructionLabel: string;
  cancelLabel: string;
  declineLabel: string;
};

export const SendVPActions: React.FC<SendVPConsentContentProps> = ({
  isDcqlFlow,
  isCancelling,
  isAuthorizationFlow,
  disableShareButton,
  onShare,
  onReject,
  consentAndShareLabel,
  dcqlInstructionLabel,
  cancelLabel,
  declineLabel,
}) => {
  return (
    <Column
      style={[
        Theme.SendVcScreenStyles.shareOptionButtonsContainer,
        {
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          marginBottom: 1,
          marginTop: 1,
          rowGap: 8,
        },
      ]}
      backgroundColor={Theme.Colors.whiteBackgroundColor}>
      {isDcqlFlow && (
        <Text weight="regular" color={Theme.Colors.instructionLabel}>
          {dcqlInstructionLabel}
        </Text>
      )}
      <Button
        type="gradient"
        styles={{marginTop: 12}}
        title={consentAndShareLabel}
        testID={'consent-share-button'}
        disabled={disableShareButton}
        onPress={onShare}
      />

      <Button
        type="clear"
        loading={isCancelling}
        title={isAuthorizationFlow ? cancelLabel : declineLabel}
        onPress={onReject}
      />
    </Column>
  );
};


