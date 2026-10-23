import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MessageOverlay} from '../../components/MessageOverlay';
import {useSettingsScreen} from './SettingScreenController';
import {useTranslation} from 'react-i18next';
import {LanguageSelector} from '../../components/LanguageSelector';
import {CREDENTIAL_REGISTRY_EDIT} from 'react-native-dotenv';
import {AboutInji} from './AboutInji';
import {EditableListItem} from '../../components/EditableListItem';
import {RootRouteProps} from '../../routes';
import testIDProps from '../../shared/commonUtil';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {Theme} from '../../components/ui/styleUtils';
import {SUPPORTED_LANGUAGES} from '../../i18n';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {ChangePin} from './ChangePin';
import {InfoPage} from './InfoPage';
import {AUTO_LOCK_OPTIONS, useAutoLockSetting} from './autoLock';
import {
  ChoiceList,
  ChoiceRow,
  Page,
  PageHeader,
  PageModal,
} from '../../components/revamp/Page';
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
import * as LocalAuthentication from 'expo-local-authentication';

/** Rows for features that are designed but not built yet; switch on when they are. */
const SHOW_CONNECTED_VERIFIERS = false;
const SHOW_APPEARANCE = false;
/** Help and Privacy show placeholder text until their real content exists. */
const SHOW_HELP_AND_PRIVACY = false;

export const SettingScreen: React.FC<SettingProps & RootRouteProps> = props => {
  const {t, i18n} = useTranslation('SettingScreen');
  const aboutT = useTranslation('AboutInji').t;
  const controller = useSettingsScreen(props);
  const navigation = useNavigation<NavigationProp<Record<string, undefined>>>();
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

  const [page, setPage] = useState<
    'changePin' | 'autoLock' | 'help' | 'privacy' | null
  >(null);
  const [autoLockMinutes, setAutoLockMinutes] = useAutoLockSetting();
  const [notice, setNotice] = useState('');

  // Off only when the phone has no fingerprint or face hardware, or none is enrolled.
  const [biometricsAvailable, setBiometricsAvailable] = useState(true);
  useEffect(() => {
    Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ])
      .then(([hardware, enrolled]) =>
        setBiometricsAvailable(hardware && enrolled),
      )
      .catch(() => setBiometricsAvailable(false));
  }, []);
  const autoLockLabel = (minutes: number) =>
    minutes === 0 ? t('autoLockNever') : t('autoLockAfter', {count: minutes});

  const languageName =
    SUPPORTED_LANGUAGES[i18n.language as keyof typeof SUPPORTED_LANGUAGES];

  return (
    <React.Fragment>
      <Pressable accessible={false} onPress={controller.TOGGLE_SETTINGS}>
        {props.triggerComponent}
      </Pressable>
      <View
        style={{flex: 1, backgroundColor: c.canvas, paddingTop: insets.top}}>
        <BannerNotificationContainer />
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
            isVisible={notice !== ''}
            onBackdropPress={() => setNotice('')}
            title={notice}
            buttonText="ok"
            onButtonPress={() => setNotice('')}
          />
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
              disabled={!biometricsAvailable}
              accessibilityState={{
                checked: controller.isBiometricUnlockEnabled,
              }}
              onPress={() =>
                handleBiometricToggle(!controller.isBiometricUnlockEnabled)
              }
              trailing={
                <SettingsSwitch value={controller.isBiometricUnlockEnabled} />
              }
            />
            {controller.isPasscodeSet() && (
              <SettingsRow
                testID="changePin"
                icon={settingsIcons.lock}
                label={t('changePin')}
                onPress={() => setPage('changePin')}
              />
            )}
            <SettingsRow
              testID="autoLock"
              icon={settingsIcons.clock}
              label={t('autoLock')}
              value={autoLockLabel(autoLockMinutes)}
              onPress={() => setPage('autoLock')}
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
            {SHOW_CONNECTED_VERIFIERS && (
              <SettingsRow
                testID="connectedVerifiers"
                icon={settingsIcons.shield}
                label={t('connectedVerifiers')}
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
            {SHOW_APPEARANCE && (
              <SettingsRow
                testID="appearance"
                icon={settingsIcons.appearance}
                label={t('appearance')}
              />
            )}
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
            {SHOW_HELP_AND_PRIVACY && (
              <SettingsRow
                testID="helpAndSupport"
                icon={settingsIcons.tour}
                label={t('helpAndSupport')}
                onPress={() => setPage('help')}
              />
            )}
            {SHOW_HELP_AND_PRIVACY && (
              <SettingsRow
                testID="privacyPolicy"
                icon={settingsIcons.document}
                label={t('privacyPolicy')}
                onPress={() => setPage('privacy')}
              />
            )}
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
              icon={settingsIcons.compass}
              label={t('injiTourGuide')}
              onPress={() => controller.INJI_TOUR_GUIDE()}
            />
          </SettingsSection>

          <ScaledText style={[styles.footer, {color: c.inkMuted}]}>
            {t('footer')}
          </ScaledText>
        </ScrollView>
      </View>
      <ChangePin
        isVisible={page === 'changePin'}
        onDone={changed => {
          setPage(null);
          if (changed) setNotice(t('pinChanged'));
        }}
      />
      <PageModal
        visible={page === 'autoLock'}
        onRequestClose={() => setPage(null)}>
        <Page
          testID="autoLockOptions"
          header={
            <PageHeader title={t('autoLock')} onBack={() => setPage(null)} />
          }>
          <ScrollView contentContainerStyle={styles.options}>
            <ScaledText style={[styles.optionsHint, {color: c.inkMuted}]}>
              {t('autoLockHint')}
            </ScaledText>
            <ChoiceList>
              {AUTO_LOCK_OPTIONS.map(minutes => (
                <ChoiceRow
                  key={minutes}
                  testID={'autoLock' + minutes}
                  label={autoLockLabel(minutes)}
                  mark="check"
                  selected={minutes === autoLockMinutes}
                  onPress={() => {
                    setAutoLockMinutes(minutes);
                    setPage(null);
                  }}
                />
              ))}
            </ChoiceList>
          </ScrollView>
        </Page>
      </PageModal>
      <InfoPage
        testID="helpAndSupportPage"
        isVisible={page === 'help'}
        title={t('helpAndSupport')}
        body={t('helpAndSupportBody')}
        onDismiss={() => setPage(null)}
      />
      <InfoPage
        testID="privacyPolicyPage"
        isVisible={page === 'privacy'}
        title={t('privacyPolicy')}
        body={t('privacyPolicyBody')}
        onDismiss={() => setPage(null)}
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
  options: {paddingTop: 12, paddingBottom: 24, gap: 12},
  optionsHint: {fontFamily: fonts.regular, fontSize: 13, paddingHorizontal: 4},
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
