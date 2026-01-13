import React, {memo, useEffect, useRef, useState} from 'react';
import {Modal, View, Text, Image, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Button} from './ui';
import {Theme} from './ui/styleUtils';

type ConsentStatus = 'idle' | 'loading' | 'success';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SUCCESS_REDIRECT_SECONDS = 3;

interface TrustModalProps {
  isVisible: boolean;
  logo?: string;
  name: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  consentStatus: ConsentStatus;
}

export const TrustModal = memo(
  ({
    isVisible,
    logo,
    name,
    onConfirm,
    onCancel,
    consentStatus,
  }: TrustModalProps) => {
    const {t} = useTranslation('issuerTrustScreen');

    const [secondsLeft, setSecondsLeft] = useState<number>(
      SUCCESS_REDIRECT_SECONDS,
    );
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const infoPoints = t('infoPoints', {returnObjects: true}) as string[];

    const isSuccess = consentStatus === 'success';
    const isLoading = consentStatus === 'loading';

    useEffect(() => {
      if (!isSuccess) return;

      setSecondsLeft(SUCCESS_REDIRECT_SECONDS);

      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [isSuccess]);

    return (
      <Modal
        onRequestClose={() => {
          null;
        }}
        visible={isVisible}
        animationType="fade">
        <SafeAreaView style={Theme.TrustIssuerScreenStyle.container}>
          <View style={{flexGrow: 1, maxHeight: SCREEN_HEIGHT * 0.25}} />

          <View>
            {isSuccess ? (
              <SuccessSection
                t={t}
                logo={logo}
                name={name}
                secondsLeft={secondsLeft}
              />
            ) : (
              <View style={Theme.TrustIssuerScreenStyle.coverCard}>
                <HeaderSection t={t} />
                <IssuerCardSection
                  t={t}
                  logo={logo}
                  name={name}
                  infoPoints={infoPoints}
                />
              </View>
            )}
          </View>

          {!isSuccess && (
            <ActionsSection
              t={t}
              isLoading={isLoading}
              onConfirm={onConfirm}
              onCancel={onCancel}
            />
          )}
        </SafeAreaView>
      </Modal>
    );
  },
);

TrustModal.displayName = 'TrustModal';

const HeaderSection = ({t}: {t: any}) => (
  <View style={Theme.TrustIssuerScreenStyle.header}>
    <Image
      source={require('../assets/TrustLogo.jpg')}
      style={Theme.TrustIssuerScreenStyle.trustIcon}
    />
    <Text style={Theme.TrustIssuerScreenStyle.title}>{t('title')}</Text>
    <Text style={Theme.TrustIssuerScreenStyle.subtitle}>{t('subTitle')}</Text>
  </View>
);

const IssuerCardSection = ({
  t,
  logo,
  name,
  infoPoints,
}: {
  t: any;
  logo?: string;
  name: string;
  infoPoints: string[];
}) => (
  <View style={Theme.TrustIssuerScreenStyle.card}>
    <View
      style={[
        Theme.TrustIssuerScreenStyle.cardHeader,
        {marginTop: 0.037 * SCREEN_HEIGHT},
      ]}>
      {logo && (
        <Image
          source={{uri: logo}}
          style={Theme.TrustIssuerScreenStyle.issuerLogo}
        />
      )}
      <Text style={Theme.TrustIssuerScreenStyle.issuerName}>{name}</Text>
    </View>

    <Text style={Theme.TrustIssuerScreenStyle.cardDescription}>
      {t('description')}
    </Text>

    {infoPoints.map((point, index) => (
      <View key={index} style={Theme.TrustIssuerScreenStyle.infoItem}>
        <Text style={Theme.TrustIssuerScreenStyle.bullet}>•</Text>
        <Text style={Theme.TrustIssuerScreenStyle.infoText}>{point}</Text>
      </View>
    ))}
  </View>
);

const SuccessSection = ({
  t,
  logo,
  name,
  secondsLeft,
}: {
  t: any;
  logo?: string;
  name: string;
  secondsLeft: number;
}) => (
  <>
    <View style={Theme.TrustIssuerScreenStyle.successContainer}>
      <Image
        source={require('../assets/success_message_icon.png')}
        style={Theme.TrustIssuerScreenStyle.successIcon}
      />
      <Text style={Theme.TrustIssuerScreenStyle.successTitle}>
        {t('successfullyTrusted')}
      </Text>
      <Text style={Theme.TrustIssuerScreenStyle.successSubtitle}>
        {t('successfullyTrustedSubtitle', {
          seconds: secondsLeft,
        })}
      </Text>
    </View>

    {((name && name.length > 0) || logo) && (
      <View style={Theme.TrustIssuerScreenStyle.successCard}>
        <View style={Theme.TrustIssuerScreenStyle.cardHeader}>
          {logo && (
            <Image
              source={{uri: logo}}
              style={Theme.TrustIssuerScreenStyle.issuerLogo}
            />
          )}
          {name && name.length > 0 && (
            <Text style={Theme.TrustIssuerScreenStyle.issuerName}>{name}</Text>
          )}
        </View>
      </View>
    )}
  </>
);

const ActionsSection = ({
  t,
  isLoading,
  onConfirm,
  onCancel,
}: {
  t: any;
  isLoading: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) => (
  <View style={Theme.TrustIssuerScreenStyle.actions}>
    <Button
      customLoader={isLoading}
      title={isLoading ? t('inProgress') : t('confirm')}
      type="gradient"
      onPress={
        isLoading
          ? () => {
              null;
            }
          : onConfirm
      }
    />

    <Button
      type="clear"
      disabled={isLoading}
      title={t('cancel')}
      onPress={onCancel}
    />
  </View>
);
