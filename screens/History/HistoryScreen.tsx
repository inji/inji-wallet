import React, {useMemo, useState} from 'react';
import {
  I18nManager,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useHistoryTab,
  useNotificationReadState,
  useWalletCredentials,
  useWalletExpiryDates,
} from './HistoryScreenController';
import {BOTTOM_TAB_ROUTES} from '../../routes/routesConstants';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {DesignTokens} from '../../components/ui/themes/designTokens';
import testIDProps from '../../shared/commonUtil';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {VCActivityLog} from '../../components/ActivityLogEvent';
import {
  expiryNotices,
  groupIntoSections,
  matchesFilter,
  NOTIFICATION_FILTERS,
  NotificationFilter,
  opensCredential,
  toMillis,
  withCardNames,
} from './historyNotifications';
import {NotificationRow} from './NotificationRow';
import {NotificationDetailModal} from './NotificationDetailModal';

const {colors, brand, elevation} = DesignTokens;

export const HistoryScreen: React.FC = () => {
  const {t} = useTranslation('HistoryScreen');
  const controller = useHistoryTab();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [selectedActivity, setSelectedActivity] =
    useState<VCActivityLog | null>(null);
  const walletCredentials = useWalletCredentials();
  const expiryDates = useWalletExpiryDates(walletCredentials);

  const activities = useMemo(
    () => [
      ...controller.activities.map(activity =>
        withCardNames(activity, walletCredentials.get(activity._vcKey)),
      ),
      ...expiryNotices(expiryDates, controller.activities).map(notice => {
        const card = walletCredentials.get(notice._vcKey);
        return VCActivityLog.getLogFromObject({
          ...notice,
          issuer: card?.issuerHost ?? '',
          ...VCActivityLog.namesFrom(card),
        });
      }),
    ],
    [controller.activities, walletCredentials, expiryDates],
  );
  const readState = useNotificationReadState(activities);
  const sections = useMemo(
    () =>
      groupIntoSections(
        activities.filter(activity => matchesFilter(activity, filter)),
      ),
    [activities, filter],
  );

  const goHome = () => navigation.navigate(BOTTOM_TAB_ROUTES.home as never);

  const goBack = () =>
    navigation.canGoBack() ? navigation.goBack() : goHome();

  const openNotification = (activity: VCActivityLog) => {
    readState.markAsRead(activity);
    if (opensCredential(activity) && walletCredentials.has(activity._vcKey)) {
      navigation.navigate(
        ...([
          BOTTOM_TAB_ROUTES.home,
          {
            screen: 'HomeScreen',
            params: {activeTab: 0, openVcKey: activity._vcKey},
          },
        ] as never),
      );
    } else {
      setSelectedActivity(activity);
    }
  };

  const wellknownFor = (activity: VCActivityLog) =>
    activity.flow === VCItemContainerFlowType.VC_SHARE
      ? controller.getWellKnownIssuerMap(activity.issuer) ?? undefined
      : undefined;

  return (
    <View style={[styles.screen, {paddingTop: insets.top + 12}]}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            {...testIDProps('goBack')}
            accessibilityRole="button"
            accessibilityLabel={t('goBack')}
            onPress={goBack}
            style={({pressed}) => [
              styles.backButton,
              elevation.icon,
              pressed && styles.pressed,
            ]}>
            <Icon
              name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
              type="material-community"
              size={22}
              color={colors.ink}
            />
          </Pressable>
          <Pressable
            {...testIDProps('markAllAsRead')}
            accessibilityRole="button"
            accessibilityState={{disabled: readState.unreadCount === 0}}
            disabled={readState.unreadCount === 0}
            onPress={readState.markAllAsRead}
            hitSlop={8}
            style={({pressed}) => pressed && styles.pressed}>
            <Text
              style={[
                styles.markAllAsRead,
                readState.unreadCount === 0 && styles.markAllAsReadDisabled,
              ]}>
              {t('markAllAsRead')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <Text {...testIDProps('notificationsTitle')} style={styles.title}>
            {t('title')}
          </Text>
          <Text {...testIDProps('unreadSummary')} style={styles.unreadSummary}>
            {readState.unreadCount === 0
              ? t('allCaughtUp')
              : t('unreadCount', {count: readState.unreadCount})}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}>
          {NOTIFICATION_FILTERS.map(option => {
            const selected = option === filter;
            return (
              <Pressable
                key={option}
                {...testIDProps(`filter-${option}`)}
                accessibilityRole="button"
                accessibilityState={{selected}}
                onPress={() => setFilter(option)}
                style={({pressed}) => [
                  styles.chip,
                  selected && styles.chipSelected,
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.chipLabel,
                    selected && styles.chipLabelSelected,
                  ]}>
                  {t(`filters.${option}`)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <SectionList
        {...testIDProps('notificationsList')}
        sections={sections}
        keyExtractor={(activity, index) =>
          `${toMillis(activity.timestamp)}-${activity._vcKey ?? ''}-${index}`
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={controller.isRefreshing}
            onRefresh={controller.REFRESH}
            tintColor={colors.azureInk}
            colors={[colors.azureInk]}
          />
        }
        ListHeaderComponent={<BannerNotificationContainer />}
        renderSectionHeader={({section}) => (
          <Text style={styles.sectionHeader}>
            {t(`sections.${section.key}`)}
          </Text>
        )}
        renderItem={({item, index, section}) => (
          <NotificationRow
            activity={item}
            wellknown={wellknownFor(item)}
            unread={readState.isUnread(item)}
            showDivider={index < section.data.length - 1}
            onPress={() => openNotification(item)}
          />
        )}
        renderSectionFooter={() => <View style={styles.sectionFooter} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon
                name="bell-outline"
                type="material-community"
                size={26}
                color={colors.azureInk}
              />
            </View>
            <Text testID="noHistory" style={styles.emptyText}>
              {filter === 'all' ? t('noHistory') : t('noNotificationsInFilter')}
            </Text>
          </View>
        }
      />

      {selectedActivity && (
        <NotificationDetailModal
          activity={selectedActivity}
          wellknown={wellknownFor(selectedActivity)}
          onClose={() => setSelectedActivity(null)}
          onBackToWallet={() => {
            setSelectedActivity(null);
            goHome();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  markAllAsRead: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15,
    color: colors.azureInk,
  },
  markAllAsReadDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 18,
  },
  title: {
    flexShrink: 1,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 30,
    color: colors.ink,
  },
  unreadSummary: {
    marginLeft: 12,
    fontFamily: 'Montserrat_500Medium',
    fontSize: 14,
    color: colors.inkMuted,
  },
  filters: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  chipSelected: {
    borderColor: colors.sel,
    backgroundColor: colors.sel,
  },
  chipLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
    color: colors.ink,
  },
  chipLabelSelected: {
    color: brand.onNavy,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 4,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: colors.inkMuted,
  },
  sectionFooter: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: colors.tintAzure,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15,
    color: colors.inkMuted,
  },
});
