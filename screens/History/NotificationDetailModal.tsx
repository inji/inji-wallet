import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {VCActivityLog} from '../../components/ActivityLogEvent';
import {DesignTokens, withAlpha} from '../../components/ui/themes/designTokens';
import testIDProps from '../../shared/commonUtil';
import {
  formatSharedDetails,
  NotificationDescriptor,
  toMillis,
} from './historyNotifications';
import {
  NotificationActivity,
  useNotificationContent,
} from './useNotificationContent';

const {colors, brand, elevation} = DesignTokens;

function heroFor(descriptor: NotificationDescriptor) {
  if (descriptor.titleKey === 'requestDeclined') {
    return {icon: 'close', color: colors.fail};
  }
  switch (descriptor.tone) {
    case 'success':
    case 'share':
      return {icon: 'check', color: colors.pass};
    case 'warning':
      return {icon: 'exclamation', color: colors.warn};
    case 'failure':
      return {icon: 'close', color: colors.fail};
    case 'removed':
      return {icon: 'trash-can-outline', color: brand.navy};
    case 'account':
      return {icon: 'cellphone', color: brand.navy};
  }
}

export const NotificationDetailModal: React.FC<
  NotificationDetailModalProps
> = ({activity, wellknown, onClose, onBackToWallet}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View
        style={[
          styles.screen,
          {paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20},
        ]}>
        <NotificationDetail
          activity={activity}
          wellknown={wellknown}
          onClose={onClose}
          onBackToWallet={onBackToWallet}
        />
      </View>
    </Modal>
  );
};

const NotificationDetail: React.FC<NotificationDetailModalProps> = ({
  activity,
  wellknown,
  onClose,
  onBackToWallet,
}) => {
  const {t} = useTranslation('HistoryScreen');
  const {
    descriptor,
    log,
    idType,
    issuerName,
    expiryDate,
    title,
    text,
    dateLocale,
  } = useNotificationContent(activity, wellknown);
  const hero = heroFor(descriptor);

  const rows: {label: string; value: string}[] = [];
  if (log instanceof VCActivityLog) {
    rows.push({label: t('detail.credential'), value: idType ?? ''});
    if (issuerName) {
      rows.push({label: t('detail.issuedBy'), value: issuerName});
    }
    if (log.deviceName) {
      const deviceLabel = log.type.startsWith('VC_SHARE_IN_PERSON_')
        ? 'detail.verifier'
        : descriptor.category === 'sharing'
        ? 'detail.sharedWith'
        : log.type.startsWith('VC_RECEIVED')
        ? 'detail.receivedFrom'
        : 'detail.device';
      rows.push({label: t(deviceLabel), value: log.deviceName});
    }
    if (log.sharedDetails?.length) {
      rows.push({
        label: t('detail.details'),
        value: formatSharedDetails(
          log.sharedDetails,
          {and: t('listAnd'), more: count => t('moreDetails', {count})},
          Infinity,
        ),
      });
    }
    if (expiryDate) {
      rows.push({label: t('detail.expiryDate'), value: expiryDate});
    }
    if (log.type === 'VC_STATUS_CHANGED' && log.vcStatus) {
      rows.push({
        label: t('detail.status'),
        value: t(`VcDetails:${log.vcStatus.toLowerCase()}`),
      });
    }
  } else {
    if (log.credentialName) {
      rows.push({label: t('detail.credential'), value: log.credentialName});
    }
    if (log.verifierName) {
      rows.push({
        label: t(
          descriptor.titleKey === 'presentationShared'
            ? 'detail.sharedWith'
            : 'detail.verifier',
        ),
        value: log.verifierName,
      });
    }
  }
  rows.push({
    label: t('detail.date'),
    value: format(toMillis(activity.timestamp), 'dd MMM yyyy, p', {
      locale: dateLocale,
    }),
  });

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.heroRing,
            {backgroundColor: withAlpha(hero.color, 0.25)},
          ]}>
          <View style={[styles.heroCircle, {backgroundColor: hero.color}]}>
            <Icon
              name={hero.icon}
              type="material-community"
              size={44}
              color={brand.onNavy}
            />
          </View>
        </View>

        <Text {...testIDProps('notificationDetailTitle')} style={styles.title}>
          {title}
        </Text>
        <Text {...testIDProps('notificationDetailText')} style={styles.text}>
          {text}
        </Text>

        <View style={[styles.card, elevation.ghost]}>
          {rows.map((row, index) => (
            <View
              key={row.label}
              {...testIDProps(`detailRow-${index}`)}
              style={[
                styles.row,
                index < rows.length - 1 && styles.rowDivider,
              ]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          {...testIDProps('backToWallet')}
          accessibilityRole="button"
          onPress={onBackToWallet}
          style={({pressed}) => [
            styles.primaryButton,
            elevation.btn,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.primaryLabel}>{t('detail.backToWallet')}</Text>
        </Pressable>
        <Pressable
          {...testIDProps('viewSharingHistory')}
          accessibilityRole="button"
          onPress={onClose}
          style={({pressed}) => [
            styles.secondaryButton,
            elevation.ghost,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.secondaryLabel}>
            {t('detail.viewSharingHistory')}
          </Text>
        </Pressable>
      </View>
    </>
  );
};

interface NotificationDetailModalProps {
  activity: NotificationActivity;
  wellknown?: object;
  onClose: () => void;
  onBackToWallet: () => void;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  heroRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 28,
    color: colors.ink,
  },
  text: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkMuted,
  },
  card: {
    alignSelf: 'stretch',
    marginTop: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowLabel: {
    marginRight: 16,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: colors.inkMuted,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: colors.ink,
  },
  actions: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.navy,
  },
  primaryLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    color: brand.onNavy,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.sel,
    backgroundColor: colors.card,
  },
  secondaryLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.85,
  },
});
