import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {DesignTokens, withAlpha} from '../../components/ui/themes/designTokens';
import testIDProps from '../../shared/commonUtil';
import {formatNotificationTime, NotificationTone} from './historyNotifications';
import {
  NotificationActivity,
  useNotificationContent,
} from './useNotificationContent';

const {colors} = DesignTokens;

const TONES: Record<
  NotificationTone,
  {icon: string; color: string; background: string}
> = {
  success: {
    icon: 'shield-check-outline',
    color: colors.pass,
    background: colors.tintPass,
  },
  share: {
    icon: 'share-variant-outline',
    color: colors.azureInk,
    background: colors.tintAzure,
  },
  warning: {
    icon: 'alert-outline',
    color: colors.warn,
    background: colors.tintWarn,
  },
  // The token set has no fail tint, so this one is derived from `fail`.
  failure: {
    icon: 'alert-circle-outline',
    color: colors.fail,
    background: withAlpha(colors.fail, 0.1),
  },
  removed: {
    icon: 'trash-can-outline',
    color: colors.ink,
    background: colors.sand,
  },
  account: {icon: 'cellphone', color: colors.ink, background: colors.sand},
};

export const NotificationRow: React.FC<NotificationRowProps> = ({
  activity,
  wellknown,
  unread,
  showDivider,
  onPress,
}) => {
  const {t} = useTranslation('HistoryScreen');
  const {descriptor, title, text, dateLocale} = useNotificationContent(
    activity,
    wellknown,
  );
  const tone = TONES[descriptor.tone];
  const time = formatNotificationTime(
    activity.timestamp,
    value => t('yesterdayAt', {time: value}),
    dateLocale,
  );

  return (
    <Pressable
      {...testIDProps('notificationRow')}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        showDivider && styles.divider,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.iconCircle, {backgroundColor: tone.background}]}>
        <Icon
          name={tone.icon}
          type="material-community"
          size={22}
          color={tone.color}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            {...testIDProps('notificationTitle')}
            style={[styles.title, unread && styles.titleUnread]}>
            {title}
          </Text>
          {unread && (
            <View {...testIDProps('unreadDot')} style={styles.unreadDot} />
          )}
        </View>
        <Text {...testIDProps('notificationText')} style={styles.body}>
          {text}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.time}>{time}</Text>
          {descriptor.actionNeeded && (
            <Text {...testIDProps('actionNeeded')} style={styles.actionNeeded}>
              {t('actionNeeded')}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

interface NotificationRowProps {
  activity: NotificationActivity;
  wellknown?: object;
  unread: boolean;
  showDivider: boolean;
  onPress: () => void;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  pressed: {
    backgroundColor: colors.sand,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flexShrink: 1,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  titleUnread: {
    fontFamily: 'Montserrat_700Bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    backgroundColor: colors.azureInk,
  },
  body: {
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  time: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    color: colors.inkMuted,
  },
  actionNeeded: {
    marginLeft: 12,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
    color: colors.warn,
  },
});
