import React from 'react';
import { Modal, View, Text, Image, ScrollView } from 'react-native';
import { Button } from './ui';
import { Theme } from './ui/styleUtils';
import { useTranslation } from 'react-i18next';

export const TrustModalVerifier = ({
    isVisible,
    logo,
    name,
    onConfirm,
    onCancel,
    flowType = 'issuer',
}: {
    isVisible: boolean;
    logo: any;
    name: string;
    onConfirm: () => void;
    onCancel: () => void;
    flowType?: 'issuer' | 'verifier';
}) => {
    const { t } = useTranslation('trustScreen');
    return (
        <Modal transparent={true} visible={isVisible} animationType="fade">
            <View style={Theme.TrustVerifierScreenStyle.modalOverlay}>
                <View style={Theme.TrustVerifierScreenStyle.modalContainer}>
                    {(logo || name) && (
                        <View style={Theme.TrustVerifierScreenStyle.issuerHeader}>
                            {logo && (
                                <Image
                                    source={{ uri: logo }}
                                    style={Theme.TrustVerifierScreenStyle.issuerLogo}
                                />
                            )}
                            {name && (
                                <Text style={Theme.TrustVerifierScreenStyle.issuerName}>
                                    {name}
                                </Text>
                            )}
                        </View>
                    )}
                    <ScrollView
                        style={{ flex: 1, width: '100%' }}
                        contentContainerStyle={{ alignItems: 'center', paddingBottom: 10 }}
                        showsVerticalScrollIndicator={true}>
                        <Text style={Theme.TrustVerifierScreenStyle.description}>
                            {t(flowType === 'issuer' ? 'description' : 'verifierDescription')}
                        </Text>

                        <View style={Theme.TrustVerifierScreenStyle.infoContainer}>
                            {t(flowType === 'issuer' ? 'infoPoints' : 'verifierInfoPoints', { returnObjects: true }).map((point, index) => (
                                <View key={index} style={Theme.TrustVerifierScreenStyle.infoItem}>
                                    <Text style={Theme.TrustVerifierScreenStyle.info}>•</Text>
                                    <Text style={Theme.TrustVerifierScreenStyle.infoText}>
                                        {point}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={{ width: '100%', paddingTop: 10, paddingBottom: 5 }}>
                        <Button
                            styles={{
                                marginBottom: 3,
                                minHeight: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            type="gradient"
                            title={t(flowType == 'issuer' ? 'confirm' : 'verifierConfirm')}
                            onPress={onConfirm}
                        />
                        <Button
                            styles={{
                                marginBottom: -10,
                                paddingBottom: 20,
                                minHeight: 60,
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