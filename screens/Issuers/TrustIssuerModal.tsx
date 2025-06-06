import React from 'react';
import { Modal, View, Text, Image } from 'react-native';
import { Button } from '../../components/ui';
import { Theme } from '../../components/ui/styleUtils';
import { useTranslation } from 'react-i18next';

export const TrustIssuerModal = ({
    isVisible,
    issuerLogo,
    issuerName,
    onConfirm,
    onCancel
}: {
    isVisible: boolean;
    issuerLogo: any;
    issuerName: string;
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    const { t } = useTranslation('trustScreen');
    return (
        <Modal transparent={true} visible={isVisible} animationType="fade">
            <View
                style={Theme.TrustIssuerScreenStyle.modalOverlay}>
                <View
                    style={Theme.TrustIssuerScreenStyle.modalContainer}>

                    {(issuerLogo || issuerName) && <View
                        style={Theme.TrustIssuerScreenStyle.issuerHeader}>
                        {issuerLogo && <Image
                            source={{ uri: issuerLogo }}
                            style={Theme.TrustIssuerScreenStyle.issuerLogo}
                        />}
                        {issuerName && <Text
                            style={Theme.TrustIssuerScreenStyle.issuerName}>
                            {issuerName}
                        </Text>}
                    </View>}

                    <Text
                        style={Theme.TrustIssuerScreenStyle.description}>
                            {t('description')}
                    </Text>
                    <Button styles={{ marginBottom: 6 }} type='gradient' title={t('confirm')} onPress={onConfirm} />
                    <Button styles={{ marginBottom: -10 }} type='clear' title={t('cancel')} onPress={onCancel} />
                </View>
            </View>
        </Modal>
    );
};
