import {useSelector} from '@xstate/react';
import {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {
  ActivityLogEvents,
  selectActivities,
  selectIsRefreshing,
  selectWellknownIssuerMap,
} from '../../machines/activityLog';
import {
  selectMyVcs,
  selectMyVcsMetadata,
} from '../../machines/VerifiableCredential/VCMetaMachine/VCMetaSelectors';
import {getCredentialExpiryDate} from '../../shared/credentialExpiry';
import {GlobalContext} from '../../shared/GlobalContext';
import {VCMetadata} from '../../shared/VCMetadata';
import {MMKV} from '../../shared/storage';
import {
  ACTIVITY_LOG_LAST_READ_STORE_KEY,
  ACTIVITY_LOG_READ_IDS_STORE_KEY,
} from '../../shared/constants';
import {
  ActivityLike,
  isActivityUnread,
  notificationId,
  pruneReadIds,
} from './historyNotifications';

export function useHistoryTab() {
  const {appService} = useContext(GlobalContext);
  const activityLogService = appService.children.get('activityLog')!!;
  const wellknownIssuerMap = useSelector(
    activityLogService,
    selectWellknownIssuerMap,
  );

  return {
    activities: useSelector(activityLogService, selectActivities),

    isRefreshing: useSelector(activityLogService, selectIsRefreshing),

    getWellKnownIssuerMap: (issuerName: string) => {
      return wellknownIssuerMap[issuerName] ?? null;
    },

    REFRESH: () => activityLogService.send(ActivityLogEvents.REFRESH()),
  };
}

/** Expiry dates of the wallet's credentials that have one, by key. */
export function useWalletExpiryDates(
  walletCredentials: Map<string, VCMetadata>,
): Map<string, string> {
  const {appService} = useContext(GlobalContext);
  const myVcs = useSelector(appService.children.get('vcMeta')!, selectMyVcs);
  return useMemo(() => {
    const expiryDates = new Map<string, string>();
    walletCredentials.forEach((vcMetadata, vcKey) => {
      const expiryDate = getCredentialExpiryDate(
        myVcs[vcKey]?.verifiableCredential,
        vcMetadata.format,
      );
      if (expiryDate) {
        expiryDates.set(vcKey, expiryDate);
      }
    });
    return expiryDates;
  }, [walletCredentials, myVcs]);
}

/** Metadata of the credentials currently stored in the wallet, by key. */
export function useWalletCredentials(): Map<string, VCMetadata> {
  const {appService} = useContext(GlobalContext);
  const vcMetadatas = useSelector(
    appService.children.get('vcMeta')!,
    selectMyVcsMetadata,
  );
  return useMemo(
    () =>
      new Map(
        vcMetadatas.map(vcMetadata => [vcMetadata.getVcKey(), vcMetadata]),
      ),
    [vcMetadatas],
  );
}

function parseReadIds(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReadState(key: string, value: string) {
  MMKV.setItem(key, value).catch(error =>
    console.error('Could not save notification read state.', error),
  );
}

/**
 * Read state for the notifications list: everything logged after the last "Mark all as
 * read" is unread until it is opened. Until the stored state has loaded, nothing is shown
 * as unread.
 */
export function useNotificationReadState(activities: ActivityLike[]) {
  const [lastReadAt, setLastReadAt] = useState<number | null>(null);
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      MMKV.getItem(ACTIVITY_LOG_LAST_READ_STORE_KEY),
      MMKV.getItem(ACTIVITY_LOG_READ_IDS_STORE_KEY),
    ])
      .then(([storedLastReadAt, storedReadIds]) => {
        if (cancelled) return;
        setReadIds(new Set(parseReadIds(storedReadIds)));
        setLastReadAt(Number(storedLastReadAt) || 0);
      })
      .catch(() => !cancelled && setLastReadAt(0));
    return () => {
      cancelled = true;
    };
  }, []);

  const isUnread = useCallback(
    (activity: ActivityLike) => isActivityUnread(activity, lastReadAt, readIds),
    [lastReadAt, readIds],
  );

  const markAsRead = useCallback(
    (activity: ActivityLike) => {
      if (!isUnread(activity)) return;
      const updated = new Set(readIds).add(notificationId(activity));
      setReadIds(updated);
      saveReadState(
        ACTIVITY_LOG_READ_IDS_STORE_KEY,
        JSON.stringify(pruneReadIds(updated, lastReadAt ?? 0)),
      );
    },
    [isUnread, readIds, lastReadAt],
  );

  const markAllAsRead = useCallback(() => {
    const now = Date.now();
    setLastReadAt(now);
    setReadIds(new Set());
    saveReadState(ACTIVITY_LOG_LAST_READ_STORE_KEY, String(now));
    saveReadState(ACTIVITY_LOG_READ_IDS_STORE_KEY, '[]');
  }, []);

  return {
    isUnread,
    unreadCount: activities.filter(isUnread).length,
    markAsRead,
    markAllAsRead,
  };
}
