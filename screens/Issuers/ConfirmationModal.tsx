import React from 'react';
import { Modal, View, Text, TouchableWithoutFeedback } from 'react-native';
import { Button } from '../../components/ui';
import { Theme } from '../../components/ui/styleUtils';
import { useTranslation } from 'react-i18next';

interface CancelDownloadModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const CancelDownloadModal: React.FC<CancelDownloadModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const {t} = useTranslation('cancelDownloadModal');
  return (
    <Modal visible={visible} transparent={true} onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={null}>
        <View
          style={Theme.TransactionCodeScreenStyle.confirmationModalView}>
          <TouchableWithoutFeedback>
            <View
              style={Theme.TransactionCodeScreenStyle.confirmationModalInnerView}>
              <Text testID="cancelDownoadModalHeading" style={Theme.TransactionCodeScreenStyle.confirmationModalContentHeading}>
                {t('heading')}
              </Text>
              <Text
                testID='cancelDownoadModalSubHeading'
                style={Theme.TransactionCodeScreenStyle.confirmationModalContentSubHeading}>
                  {t('subHeading')}
              </Text>

              <Button
                testID="cancelDownloadModalNoButton"
                styles={{ marginTop: 24 }}
                type="gradient"
                title={t('cancel')}
                onPress={onCancel}
              />
              <Button
                testID='cancelDownloadModalYesButton'
                styles={{ marginTop: 12, marginBottom: -20 }}
                type="clear"
                title={t('confirm')}
                onPress={onConfirm}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
