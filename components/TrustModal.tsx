import React, { memo } from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from './ui';

type ConsentStatus = 'idle' | 'loading' | 'success';

interface TrustModalProps {
    isVisible: boolean;
    logo?: string;
    name: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    flowType?: 'issuer' | 'verifier';
    consentStatus: ConsentStatus;
}

export const TrustModal = memo(({
    isVisible,
    logo,
    name,
    onConfirm,
    onCancel,
    flowType = 'issuer',
    consentStatus,
}: TrustModalProps) => {
    const { t } = useTranslation('trustScreen');

    const infoPoints = t(
        flowType === 'issuer' ? 'infoPoints' : 'verifierInfoPoints',
        { returnObjects: true }
    ) as string[];

    const isSuccess = consentStatus === 'success';
    const isLoading = consentStatus === 'loading';

    return (
        <Modal visible={isVisible} animationType="fade">
            <SafeAreaView style={styles.container}>
                <View style={[styles.topSpacer, { flexGrow: isSuccess ? 1 : 1000 }]} />
                <View>
                    {isSuccess ? (
                        <SuccessSection t={t} logo={logo} name={name} />
                    ) : (
                        <>
                            <HeaderSection t={t} />
                            <IssuerCardSection
                                t={t}
                                logo={logo}
                                name={name}
                                flowType={flowType}
                                infoPoints={infoPoints}
                            />
                        </>
                    )}
                </View>
                <View style={styles.middleSpacer} />
                {!isSuccess && (
                    <ActionsSection
                        t={t}
                        flowType={flowType}
                        isLoading={isLoading}
                        onConfirm={onConfirm}
                        onCancel={onCancel}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
});

TrustModal.displayName = 'TrustModal';



const HeaderSection = ({ t }: { t: any }) => (
    <View style={styles.header}>
        <Image
            source={require('../assets/TrustLogo.jpg')}
            style={styles.trustIcon}
        />
        <Text style={styles.title}>{t('Quick Check')}</Text>
        <Text style={styles.subtitle}>
            {t('Before proceeding, confirm you recognize this issuer')}
        </Text>
    </View>
);

const IssuerCardSection = ({
    t,
    logo,
    name,
    flowType,
    infoPoints,
}: {
    t: any;
    logo?: string;
    name: string;
    flowType: 'issuer' | 'verifier';
    infoPoints: string[];
}) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            {logo && (
                <Image
                    source={{ uri: logo }}
                    style={styles.issuerLogo}
                />
            )}
            <Text style={styles.issuerName}>{name}</Text>
        </View>

        <Text style={styles.cardDescription}>
            {t(flowType === 'issuer' ? 'description' : 'verifierDescription')}
        </Text>

        {infoPoints.map((point, index) => (
            <View key={index} style={styles.infoItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.infoText}>{point}</Text>
            </View>
        ))}
    </View>
);

const SuccessSection = ({
    t,
    logo,
    name,
}: {
    t: any;
    logo?: string;
    name: string;
}) => (
    <>
        <View style={styles.successContainer}>
            <Image
                source={require('../assets/success_message_icon.png')}
                style={styles.successIcon}
            />
            <Text style={styles.successTitle}>
                {t('Issuer Trusted Successfully')}
            </Text>
            <Text style={styles.successSubtitle}>
                {t('You will be auto redirected to your request shortly')}
            </Text>
        </View>

        <View style={styles.successCard}>
            <View style={styles.cardHeader}>
                {logo && (
                    <Image
                        source={{ uri: logo }}
                        style={styles.issuerLogo}
                    />
                )}
                <Text style={styles.issuerName}>{name}</Text>
            </View>
        </View>
    </>
);

const ActionsSection = ({
    t,
    flowType,
    isLoading,
    onConfirm,
    onCancel,
}: {
    t: any;
    flowType: 'issuer' | 'verifier';
    isLoading: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}) => (
    <View style={styles.actions}>
        <Button
            customLoader={isLoading}
            title={
                isLoading
                    ? t('In Progress...')
                    : t(flowType === 'issuer' ? 'confirm' : 'verifierConfirm')
            }
            type="gradient"
            onPress={onConfirm}
        />

        <Button
            type="clear"
            disabled={isLoading}
            title={t('cancel')}
            onPress={onCancel}
        />
    </View>
);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },

    topSpacer: {
        maxHeight: 250,
    },

    header: {
        alignItems: 'center',
        marginBottom: 23,
    },

    trustIcon: {
        width: 65,
        height: 65,
        marginBottom: 11,
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        fontFamily: 'Montserrat_700Bold',
    },

    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 7,
        lineHeight: 20,
        fontFamily: 'Montserrat_500Medium',
        paddingHorizontal: 12,
    },

    card: {
        backgroundColor: '#EDF6FB',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
    },

    successCard: {
        backgroundColor: '#EDF6FB',
        height: 107,
        borderRadius: 20,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    issuerLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#FFFFFF',
    },

    issuerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },

    cardDescription: {
        fontSize: 14,
        color: '#5D5D5D',
        lineHeight: 20,
        fontFamily: 'Montserrat_500Medium',
        marginBottom: 22,
        marginTop: 22,
        textAlign: 'center',
    },

    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },

    bullet: {
        fontSize: 16,
        color: '#374151',
        marginRight: 8,
        marginTop: 1,
    },

    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#5D5D5D',
        lineHeight: 20,
        fontFamily: 'Montserrat_400Regular',
        textAlign: 'left',
    },

    middleSpacer: {
        flex: 1,
    },

    actions: {
        gap: 12,
        paddingBottom: 8,
    },

    successContainer: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    successIcon: {
        width: 108,
        height: 108,
        marginBottom: 36,
    },

    successTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 7,
        textAlign: 'center',
    },

    successSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 28,
    },
});
