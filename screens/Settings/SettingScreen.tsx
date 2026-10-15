import React from 'react';
import {Platform, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MessageOverlay} from '../../components/MessageOverlay';
import {useSettingsScreen} from './SettingScreenController';
import {useTranslation} from 'react-i18next';
import {LanguageSelector} from '../../components/LanguageSelector';
import {CREDENTIAL_REGISTRY_EDIT} from 'react-native-dotenv';
import {AboutInji} from './AboutInji';
import {EditableListItem} from '../../components/EditableListItem';
import {RequestRouteProps, RootRouteProps} from '../../routes';
import {ReceivedCardsModal} from './ReceivedCardsModal';
import {useReceivedVcsTab} from '../Home/ReceivedVcsTabController';
import testIDProps from '../../shared/commonUtil';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {Theme} from '../../components/ui/styleUtils';
import {SUPPORTED_LANGUAGES} from '../../i18n';
import {
  BOTTOM_TAB_ROUTES,
  SETTINGS_ROUTES,
  SettingsStackParamList,
} from '../../routes/routesConstants';
import {ScaledText} from '../../components/revamp/ScaledText';
import {
  SettingsRow,
  SettingsSection,
  SettingsSwitch,
  settingsIcons,
} from '../../components/revamp/SettingsList';
import {fonts} from '../../components/revamp/tokens';
import {TAB_BAR_SPACE} from '../../components/revamp/RevampTabBar';
import {useRevampTheme} from '../../components/revamp/useRevampTheme';

export const SettingScreen: React.FC<
  SettingProps & RootRouteProps & RequestRouteProps
> = props => {
  const {t, i18n} = useTranslation('SettingScreen');
  const keyT = useTranslation('SetupKey').t;
  const receivedT = useTranslation('ReceivedVcsTab').t;
  const aboutT = useTranslation('AboutInji').t;
  const controller = useSettingsScreen(props);
  const receivedCards = useReceivedVcsTab();
  const navigation = useNavigation<NavigationProp<SettingsStackParamList>>();
  const {c} = useRevampTheme();
  const insets = useSafeAreaInsets();

  const updateRegistry = items => {
    controller.UPDATE_CREDENTIAL_REGISTRY(items[0].value, items[1].value);
  };

  const handleBiometricToggle = (biometricToggleState: boolean) => {
    if (controller.isBiometricUnlockEnabled && !controller.isPasscodeSet()) {
      controller.CHANGE_UNLOCK_METHOD(biometricToggleState);
    } else if (
      !controller.isBiometricUnlockEnabled &&
      controller.isPasscodeSet()
    ) {
      controller.useBiometrics(biometricToggleState);
    } else {
      controller.TOGGLE_BIOMETRIC(biometricToggleState);
    }
  };

  const openKeyManagement = () => {
    controller.SET_KEY_MANAGEMENT_EXPLORED();
    navigation.navigate(SETTINGS_ROUTES.KeyManagement, {
      controller,
    } as never);
  };

  const languageName =
    SUPPORTED_LANGUAGES[i18n.language as keyof typeof SUPPORTED_LANGUAGES];

  return (
    <React.Fragment>
      <Pressable accessible={false} onPress={controller.TOGGLE_SETTINGS}>
        {props.triggerComponent}
      </Pressable>
      <BannerNotificationContainer />
      <View
        style={{flex: 1, backgroundColor: c.canvas, paddingTop: insets.top}}>
        <View style={styles.header}>
          <ScaledText
            accessibilityRole="header"
            style={[styles.title, {color: c.ink}]}>
            {t('header')}
          </ScaledText>
        </View>
        <ScrollView
          {...testIDProps('settingsScreen')}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: TAB_BAR_SPACE + insets.bottom},
          ]}
          showsVerticalScrollIndicator={false}>
          <MessageOverlay
            isVisible={controller.alertMsg != ''}
            onBackdropPress={controller.hideAlert}
            title={controller.alertMsg}
          />

          <SettingsSection title={t('securityAndPrivacy')}>
            <SettingsRow
              testID="biometricToggle"
              icon={settingsIcons.biometrics}
              label={t('bioUnlock')}
              accessibilityRole="switch"
              accessibilityState={{
                checked: controller.isBiometricUnlockEnabled,
              }}
              disabled={!controller.canUseBiometrics}
              onPress={() =>
                handleBiometricToggle(!controller.isBiometricUnlockEnabled)
              }
              trailing={
                <SettingsSwitch value={controller.isBiometricUnlockEnabled} />
              }
            />
            <SettingsRow
              testID="keyManagement"
              icon={settingsIcons.key}
              label={keyT('header')}
              onPress={openKeyManagement}
            />
          </SettingsSection>

          <SettingsSection title={t('walletSection')}>
            <SettingsRow
              testID="sharingHistory"
              icon={settingsIcons.history}
              label={t('sharingHistory')}
              onPress={() =>
                navigation.navigate(BOTTOM_TAB_ROUTES.history as never)
              }
            />
            {Platform.OS !== 'ios' && (
              <SettingsRow
                testID="receiveCardPressableArea"
                icon={settingsIcons.receive}
                label={t('receiveCard')}
                onPress={controller.RECEIVE_CARD}
              />
            )}
            {Platform.OS !== 'ios' && (
              <SettingsRow
                testID="receivedCardsPressableArea"
                icon={settingsIcons.received}
                label={receivedT('receivedCards')}
                onPress={receivedCards.TOGGLE_RECEIVED_CARDS}
              />
            )}
          </SettingsSection>

          <SettingsSection title={t('appSection')}>
            <LanguageSelector
              triggerComponent={
                <SettingsRow
                  testID="language"
                  icon={settingsIcons.language}
                  label={t('language')}
                  value={languageName}
                  chevron
                />
              }
            />
            {CREDENTIAL_REGISTRY_EDIT === 'true' && (
              <EditableListItem
                testID="credentialRegistry"
                title={t('credentialRegistry')}
                content={controller.credentialRegistry}
                items={[
                  {
                    label: t('credentialRegistry'),
                    value: controller.credentialRegistry,
                    testID: 'credentialRegistry',
                  },
                  {
                    label: t('esignethosturl'),
                    value: controller.esignetHostUrl,
                    testID: 'esignetHost',
                  },
                ]}
                response={controller.credentialRegistryResponse}
                onCancel={controller.CANCEL}
                onEdit={updateRegistry}
                Icon="star"
                errorMessage={t('errorMessage')}
                progress={controller.isResetInjiProps}
                titleColor={Theme.Colors.settingsLabel}
              />
            )}
          </SettingsSection>

          <SettingsSection title={t('support')}>
            <AboutInji
              appId={controller.appId}
              renderTrigger={open => (
                <SettingsRow
                  testID="aboutInji"
                  icon={settingsIcons.about}
                  label={aboutT('aboutInji')}
                  onPress={open}
                />
              )}
            />
            <SettingsRow
              testID="injiTourGuide"
              icon={settingsIcons.tour}
              label={t('injiTourGuide')}
              onPress={() => controller.INJI_TOUR_GUIDE()}
            />
          </SettingsSection>

          <ScaledText style={[styles.footer, {color: c.inkMuted}]}>
            {t('footer')}
          </ScaledText>
        </ScrollView>
      </View>
      <ReceivedCardsModal
        isVisible={receivedCards.isVisible}
        controller={receivedCards}
        onDismiss={receivedCards.TOGGLE_RECEIVED_CARDS}
      />
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  header: {paddingTop: 18, paddingBottom: 12, paddingHorizontal: 24},
  title: {
    fontFamily: fonts.medium,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.56,
  },
  content: {paddingTop: 8, paddingHorizontal: 24, paddingBottom: 32, gap: 24},
  footer: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});

interface SettingProps {
  testID?: string;
  triggerComponent: React.ReactElement;
}
