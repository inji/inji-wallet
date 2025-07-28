import React from 'react';
import {Modal, View, Text, Image, ScrollView} from 'react-native';
import {Button} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';

export const TrustIssuerModal = ({
                                     isVisible,
                                     issuerLogo,
                                     issuerName,
                                     onConfirm,
                                     onCancel,
                                 }: {
    isVisible: boolean;
    issuerLogo: any;
    issuerName: string;
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    const {t} = useTranslation('trustScreen');
    return (
        <Modal transparent={true} visible={isVisible} animationType="fade">
            <View style={Theme.TrustIssuerScreenStyle.modalOverlay}>
                <View style={Theme.TrustIssuerScreenStyle.modalContainer}>
                    {(issuerLogo || issuerName) && (
                        <View style={Theme.TrustIssuerScreenStyle.issuerHeader}>
                            {issuerLogo && (
                                <Image
                                    source={{uri: issuerLogo}}
                                    style={Theme.TrustIssuerScreenStyle.issuerLogo}
                                />
                            )}
                            {issuerName && (
                                <Text style={Theme.TrustIssuerScreenStyle.issuerName}>
                                    {issuerName}
                                </Text>
                            )}
                        </View>
                    )}
                    <ScrollView
                        style={{flex: 1, width: '100%'}}
                        contentContainerStyle={{alignItems: 'center', paddingBottom: 10}}
                        showsVerticalScrollIndicator={true}>
                        <Text style={Theme.TrustIssuerScreenStyle.description}>
                            {t('description')}
                        </Text>

                        <View style={Theme.TrustIssuerScreenStyle.infoContainer}>
                            {t('infoPoints', {returnObjects: true}).map((point, index) => (
                                <View key={index} style={Theme.TrustIssuerScreenStyle.infoItem}>
                                    <Text style={Theme.TrustIssuerScreenStyle.info}>•</Text>
                                    <Text style={Theme.TrustIssuerScreenStyle.infoText}>
                                        {point}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={{width: '100%', paddingTop: 10, paddingBottom: 5}}>
                        <Button
                            styles={{
                                marginBottom: 3,
                                minHeight: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            type="gradient"
                            title={t('confirm')}
                            onPress={onConfirm}
                        />
                        <Button
                            styles={{
                                marginBottom: -10,
                                paddingBottom: 20,
                                minHeight: 80,
                                justifyContent: 'center',
                                alignItems: 'center',
                                maxWidth: '100%',
                            }}
                            type="clear"
                            title={t('cancel')}
                            onPress={onCancel}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};