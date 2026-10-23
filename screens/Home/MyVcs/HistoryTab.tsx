import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {ActorRefFrom} from 'xstate';
import {BottomSheet} from '../../../components/ui/BottomSheet';
import {useKebabPopUp} from '../../../components/KebabPopUpController';
import {VCMetadata} from '../../../shared/VCMetadata';
import {VCItemMachine} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {NotificationRow} from '../../History/NotificationRow';
import {groupIntoSections} from '../../History/historyNotifications';
import {PageButton} from '../../../components/revamp/Page';
import {ScaledText} from '../../../components/revamp/ScaledText';
import {fonts} from '../../../components/revamp/tokens';
import {useRevampTheme} from '../../../components/revamp/useRevampTheme';
import {BOTTOM_TAB_ROUTES} from '../../../routes/routesConstants';

/** One card's activity, in the Notifications list style, as a sheet over the card. */
export const HistoryTab: React.FC<HistoryTabProps> = props => {
  const {t} = useTranslation('HistoryScreen');
  const {c} = useRevampTheme();
  const navigation = useNavigation<any>();
  const controller = useKebabPopUp(props);
  const vcKey = VCMetadata.fromVC(props.vcMetadata).getVcKey();

  const sections = useMemo(
    () =>
      groupIntoSections(
        controller.activities.filter(activity => activity._vcKey === vcKey),
      ),
    [controller.activities, vcKey],
  );

  return (
    <BottomSheet
      testID="cardActivity"
      isVisible={controller.isShowActivities}
      onRequestClose={controller.DISMISS}>
      <View style={styles.head}>
        <ScaledText
          accessibilityRole="header"
          style={[styles.title, {color: c.ink}]}>
          {t('cardActivityTitle')}
        </ScaledText>
        {props.vcMetadata.credentialType ? (
          <ScaledText style={[styles.subtitle, {color: c.inkMuted}]}>
            {props.vcMetadata.credentialType}
          </ScaledText>
        ) : null}
      </View>
      {sections.length === 0 ? (
        <ScaledText
          testID="noHistory"
          style={[styles.empty, {color: c.inkMuted}]}>
          {t('noCardActivity')}
        </ScaledText>
      ) : (
        sections.map(section => (
          <View key={section.key}>
            <ScaledText style={[styles.section, {color: c.inkMuted}]}>
              {t(`sections.${section.key}`)}
            </ScaledText>
            {section.data.map((activity, index) => (
              <NotificationRow
                key={`${activity.timestamp}-${activity._vcKey}`}
                activity={activity}
                unread={false}
                showDivider={index < section.data.length - 1}
                onPress={() => undefined}
              />
            ))}
          </View>
        ))
      )}
      <View style={styles.footer}>
        <PageButton
          testID="openAllNotifications"
          variant="outline"
          title={t('openAllNotifications')}
          onPress={() => {
            controller.DISMISS();
            navigation.navigate(BOTTOM_TAB_ROUTES.history);
          }}
        />
      </View>
    </BottomSheet>
  );
};

export interface HistoryTabProps {
  service: ActorRefFrom<typeof VCItemMachine>;
  vcMetadata: VCMetadata;
}

const styles = StyleSheet.create({
  head: {gap: 2, marginBottom: 8, paddingHorizontal: 4},
  title: {
    fontFamily: fonts.semibold,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.4,
  },
  subtitle: {fontFamily: fonts.regular, fontSize: 13},
  section: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: 32,
  },
  footer: {marginTop: 20},
});
