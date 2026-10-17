import {differenceInCalendarDays, format, isSameYear, subDays} from 'date-fns';
import {VCItemContainerFlowType} from '../../shared/Utils';

export type NotificationFilter = 'all' | 'credentials' | 'sharing' | 'account';
export type NotificationCategory = Exclude<NotificationFilter, 'all'>;
export type NotificationTone =
  | 'success'
  | 'share'
  | 'warning'
  | 'failure'
  | 'removed'
  | 'account';
export type NotificationSectionKey = 'today' | 'yesterday' | 'earlier';

export const NOTIFICATION_FILTERS: NotificationFilter[] = [
  'all',
  'credentials',
  'sharing',
  'account',
];

/** Names a notification can mention, when the activity log or the card has them. */
export type NotificationNameKind =
  | 'issuer'
  | 'device'
  | 'verifier'
  | 'credentials'
  | 'details';
export type NotificationNames = Partial<Record<NotificationNameKind, string>>;

export interface NotificationDescriptor {
  category: NotificationCategory;
  tone: NotificationTone;
  /** Key under `HistoryScreen:notificationTitles`. */
  titleKey: string;
  actionNeeded?: boolean;
  /** The title has a `_<kind>` variant naming this, used when the name is known. */
  titleName?: NotificationNameKind;
  /** Key under `HistoryScreen:text`; without one, the activity log's own text is shown. */
  textKey?: string;
  /** The text has a `_<kind>` variant naming this, used when the name is known. */
  textName?: NotificationNameKind;
}

/** The fields of a stored VC or VP activity log that decide how it is presented. */
export interface ActivityLike {
  type: string;
  flow?: string;
  vcStatus?: string;
  timestamp: number | string;
  _vcKey?: string;
}

type Copy = Pick<NotificationDescriptor, 'titleName' | 'textKey' | 'textName'>;

const credential = (
  tone: NotificationTone,
  titleKey: string,
  copy: Copy,
  actionNeeded = false,
): NotificationDescriptor => ({
  category: 'credentials',
  tone,
  titleKey,
  actionNeeded,
  ...copy,
});

const sharing = (
  tone: NotificationTone,
  titleKey: string,
  copy: Copy,
): NotificationDescriptor => ({category: 'sharing', tone, titleKey, ...copy});

const SHARED_WITH_DEVICE: Copy = {titleName: 'device'};

const VC_LOGS: Record<string, NotificationDescriptor> = {
  VC_DOWNLOADED: credential('success', 'credentialIssued', {
    textKey: 'VC_DOWNLOADED',
    textName: 'issuer',
  }),
  VC_RECEIVED: credential('success', 'credentialReceived', {
    textKey: 'VC_RECEIVED',
    textName: 'issuer',
  }),
  VC_RECEIVED_WITH_PRESENCE_VERIFIED: credential(
    'success',
    'credentialReceived',
    {textKey: 'VC_RECEIVED_WITH_PRESENCE_VERIFIED', textName: 'issuer'},
  ),
  VC_RECEIVED_NOT_SAVED: credential('failure', 'credentialNotSaved', {
    textKey: 'VC_RECEIVED_NOT_SAVED',
    textName: 'device',
  }),
  VC_RECEIVED_BUT_PRESENCE_VERIFICATION_FAILED: credential(
    'failure',
    'faceVerificationFailed',
    {
      textKey: 'VC_RECEIVED_BUT_PRESENCE_VERIFICATION_FAILED',
      textName: 'device',
    },
  ),
  VC_DELETED: credential('removed', 'credentialRemoved', {
    textKey: 'VC_REMOVED',
    textName: 'issuer',
  }),
  VC_REMOVED: credential('removed', 'credentialRemoved', {
    textKey: 'VC_REMOVED',
    textName: 'issuer',
  }),
  TAMPERED_VC_REMOVED: credential(
    'failure',
    'tamperedCredentialRemoved',
    {textKey: 'TAMPERED_VC_REMOVED'},
    true,
  ),
  WALLET_BINDING_SUCCESSFULL: credential('success', 'credentialActivated', {
    textKey: 'WALLET_BINDING_SUCCESSFULL',
    textName: 'issuer',
  }),
  WALLET_BINDING_FAILURE: credential(
    'failure',
    'activationFailed',
    {textKey: 'WALLET_BINDING_FAILURE', textName: 'issuer'},
    true,
  ),
  VC_SHARED: sharing('share', 'credentialShared', {
    ...SHARED_WITH_DEVICE,
    textKey: 'VC_SHARED',
  }),
  VC_SHARED_WITH_VERIFICATION_CONSENT: sharing('share', 'credentialShared', {
    ...SHARED_WITH_DEVICE,
    textKey: 'VC_SHARED_WITH_VERIFICATION_CONSENT',
  }),
  PRESENCE_VERIFIED_AND_VC_SHARED: sharing('share', 'credentialShared', {
    ...SHARED_WITH_DEVICE,
    textKey: 'PRESENCE_VERIFIED_AND_VC_SHARED',
  }),
  VC_SHARED_IN_PERSON: sharing('share', 'credentialShared', {
    ...SHARED_WITH_DEVICE,
    textKey: 'VC_SHARED_IN_PERSON',
    textName: 'details',
  }),
  VC_SHARE_IN_PERSON_DECLINED: sharing('share', 'requestDeclined', {
    textKey: 'VC_SHARE_IN_PERSON_DECLINED',
    textName: 'device',
  }),
  VC_SHARE_IN_PERSON_FAILED: sharing('failure', 'sharingFailed', {
    textKey: 'VC_SHARE_IN_PERSON_FAILED',
    textName: 'device',
  }),
  PRESENCE_VERIFICATION_FAILED: sharing('failure', 'faceVerificationFailed', {
    textKey: 'PRESENCE_VERIFICATION_FAILED',
    textName: 'device',
  }),
  QRLOGIN_SUCCESFULL: {
    category: 'account',
    tone: 'account',
    titleKey: 'onlineSignIn',
    textKey: 'QRLOGIN_SUCCESFULL',
    textName: 'issuer',
  },
  VC_EXPIRY_DUE: credential(
    'warning',
    'renewalDue',
    {textKey: 'VC_EXPIRY_DUE'},
    true,
  ),
  VC_EXPIRED: credential(
    'warning',
    'statusExpired',
    {textKey: 'VC_EXPIRED'},
    true,
  ),
};

const status = (vcStatus: string): Copy => ({
  textKey: `VC_STATUS_CHANGED.${vcStatus}`,
  textName: 'issuer',
});

const VC_STATUS_LOGS: Record<string, NotificationDescriptor> = {
  VALID: credential('success', 'statusValid', status('VALID')),
  PENDING: credential('warning', 'statusPending', status('PENDING')),
  EXPIRED: credential('warning', 'statusExpired', status('EXPIRED'), true),
  REVOKED: credential('failure', 'statusRevoked', status('REVOKED'), true),
};

const VP_SHARED = sharing('share', 'presentationShared', {
  titleName: 'verifier',
  textKey: 'vp.SHARED',
  textName: 'credentials',
});
const VP_SHARED_WITH_FACE = sharing('share', 'presentationShared', {
  titleName: 'verifier',
  textKey: 'vp.SHARED_WITH_FACE_VERIFICATION',
  textName: 'credentials',
});
const VP_FACE_VERIFICATION_FAILED = sharing(
  'failure',
  'faceVerificationFailed',
  {textKey: 'vp.FACE_VERIFICATION_FAILED', textName: 'verifier'},
);
const VP_NO_MATCHING_CREDENTIAL = sharing('warning', 'noMatchingCredential', {
  textKey: 'vp.NO_MATCHING_CREDENTIAL',
  textName: 'verifier',
});

const VP_LOGS: Record<string, NotificationDescriptor> = {
  SHARED_SUCCESSFULLY: VP_SHARED,
  SHARED_AFTER_RETRY: VP_SHARED,
  SHARED_WITH_FACE_VERIFIACTION: VP_SHARED_WITH_FACE,
  SHARED_WITH_FACE_VERIFICATION_AFTER_RETRY: VP_SHARED_WITH_FACE,
  USER_DECLINED_CONSENT: sharing('share', 'requestDeclined', {
    textKey: 'vp.USER_DECLINED_CONSENT',
    textName: 'verifier',
  }),
  VERIFIER_AUTHENTICATION_FAILED: sharing('failure', 'verifierCheckFailed', {
    textKey: 'vp.VERIFIER_AUTHENTICATION_FAILED',
    textName: 'verifier',
  }),
  FACE_VERIFICATION_FAILED: VP_FACE_VERIFICATION_FAILED,
  FACE_VERIFICATION_FAILED_AFTER_RETRY_ATTEMPT: VP_FACE_VERIFICATION_FAILED,
  NO_SELECTED_VC_HAS_IMAGE: sharing('warning', 'noMatchingCredential', {
    textKey: 'vp.NO_SELECTED_VC_HAS_IMAGE',
    textName: 'verifier',
  }),
  CREDENTIAL_MISMATCH_FROM_KEBAB: VP_NO_MATCHING_CREDENTIAL,
  NO_CREDENTIAL_MATCHING_REQUEST: VP_NO_MATCHING_CREDENTIAL,
};

const UNKNOWN_VC_LOG = credential('removed', 'walletActivity', {});
/** Every VP log type not listed above is an error code from the sharing flow. */
const UNKNOWN_VP_LOG = sharing('failure', 'sharingFailed', {});

export function isPresentationLog(activity: ActivityLike): boolean {
  return activity.flow === VCItemContainerFlowType.VP_SHARE;
}

export function describeActivity(
  activity: ActivityLike,
): NotificationDescriptor {
  if (isPresentationLog(activity)) {
    return VP_LOGS[activity.type] ?? UNKNOWN_VP_LOG;
  }
  if (activity.type === 'VC_STATUS_CHANGED') {
    return VC_STATUS_LOGS[activity.vcStatus ?? ''] ?? UNKNOWN_VC_LOG;
  }
  return VC_LOGS[activity.type] ?? UNKNOWN_VC_LOG;
}

/**
 * "Family name, portrait and age over 18" from mdoc element ids such as `family_name`,
 * listing at most `limit` of them and summarising the rest with `words.more`.
 */
export function formatSharedDetails(
  elements: string[],
  words: {and: string; more: (count: number) => string},
  limit = 3,
): string {
  const labels = [
    ...new Set(
      elements.map(element =>
        element.split('_').filter(Boolean).join(' ').toLowerCase(),
      ),
    ),
  ].filter(Boolean);
  if (labels.length === 0) return '';
  const shown =
    labels.length > limit
      ? [...labels.slice(0, limit), words.more(labels.length - limit)]
      : labels;
  const list =
    shown.length > 1
      ? `${shown.slice(0, -1).join(', ')} ${words.and} ${
          shown[shown.length - 1]
        }`
      : shown[0];
  return list.charAt(0).toUpperCase() + list.slice(1);
}

/** The i18next context selecting the `_<kind>` variant of a title or text, if that name is known. */
export function nameContext(
  kind: NotificationNameKind | undefined,
  names: NotificationNames,
): NotificationNameKind | undefined {
  return kind && names[kind]?.trim() ? kind : undefined;
}

const OPENS_CREDENTIAL = ['VC_DOWNLOADED', 'VC_EXPIRY_DUE', 'VC_EXPIRED'];

/** These notifications open the credential itself rather than a detail page. */
export function opensCredential(activity: ActivityLike): boolean {
  return (
    !isPresentationLog(activity) && OPENS_CREDENTIAL.includes(activity.type)
  );
}

/** How long before a credential expires its "renewal due" notice appears. */
export const EXPIRY_NOTICE_DAYS = 30;

const ADDED_TO_WALLET = [
  'VC_DOWNLOADED',
  'VC_RECEIVED',
  'VC_RECEIVED_WITH_PRESENCE_VERIFIED',
];

export interface ExpiryNotice {
  type: 'VC_EXPIRY_DUE' | 'VC_EXPIRED';
  _vcKey: string;
  timestamp: number;
  expiryDate: string;
}

/**
 * Notices for wallet credentials expiring within {@link EXPIRY_NOTICE_DAYS}, and for those that
 * have expired, unless a status check already logged that. They aren't logged but worked out
 * from the credentials' expiry dates, so each is dated when it became due (or when the card
 * was added, if later), which keeps its place in the list and its read state stable.
 */
export function expiryNotices(
  expiryDates: ReadonlyMap<string, string>,
  activities: ActivityLike[],
  now: Date = new Date(),
): ExpiryNotice[] {
  const addedAt = new Map<string, number>();
  const expiryLogged = new Set<string>();
  activities.forEach(activity => {
    if (!activity._vcKey || isPresentationLog(activity)) return;
    if (ADDED_TO_WALLET.includes(activity.type)) {
      addedAt.set(activity._vcKey, toMillis(activity.timestamp));
    }
    if (
      activity.type === 'VC_STATUS_CHANGED' &&
      activity.vcStatus === 'EXPIRED'
    ) {
      expiryLogged.add(activity._vcKey);
    }
  });

  const notices: ExpiryNotice[] = [];
  expiryDates.forEach((expiryDate, vcKey) => {
    const expiresAt = toMillis(expiryDate);
    if (Number.isNaN(expiresAt)) return;
    const dueAt = subDays(expiresAt, EXPIRY_NOTICE_DAYS).getTime();
    if (now.getTime() < dueAt) return;
    const expired = now.getTime() >= expiresAt;
    if (expired && expiryLogged.has(vcKey)) return;
    notices.push({
      type: expired ? 'VC_EXPIRED' : 'VC_EXPIRY_DUE',
      _vcKey: vcKey,
      timestamp: Math.max(expired ? expiresAt : dueAt, addedAt.get(vcKey) ?? 0),
      expiryDate,
    });
  });
  return notices;
}

interface CardNames {
  credentialName?: string;
  issuerName?: string;
}

/**
 * Fills names missing from a log (entries logged before they were recorded) from the
 * card's metadata, when the card is still in the wallet.
 */
export function withCardNames<T extends ActivityLike & CardNames>(
  activity: T,
  card?: {credentialType?: string; issuerName?: string},
): T {
  if (!card || (activity.credentialName && activity.issuerName)) {
    return activity;
  }
  return {
    ...activity,
    credentialName: activity.credentialName || card.credentialType || '',
    issuerName: activity.issuerName || card.issuerName || '',
  };
}

export function matchesFilter(
  activity: ActivityLike,
  filter: NotificationFilter,
): boolean {
  return filter === 'all' || describeActivity(activity).category === filter;
}

export function toMillis(timestamp: number | string): number {
  return typeof timestamp === 'number'
    ? timestamp
    : new Date(timestamp).getTime();
}

/** Stable id for an activity log entry; logs have no id of their own. Starts with the timestamp. */
export function notificationId(activity: ActivityLike): string {
  return [
    toMillis(activity.timestamp),
    activity.type,
    activity.vcStatus ?? '',
    activity._vcKey ?? '',
  ].join('|');
}

/**
 * Unread means logged after the last "Mark all as read" and not opened since. A `null`
 * `lastReadAt` (read state still loading) shows everything as read.
 */
export function isActivityUnread(
  activity: ActivityLike,
  lastReadAt: number | null,
  readIds: ReadonlySet<string>,
): boolean {
  return (
    lastReadAt != null &&
    toMillis(activity.timestamp) > lastReadAt &&
    !readIds.has(notificationId(activity))
  );
}

/** Drops ids that "Mark all as read" already covers, so the stored list stays small. */
export function pruneReadIds(
  readIds: Iterable<string>,
  lastReadAt: number,
): string[] {
  return [...readIds].filter(id => Number(id.split('|')[0]) > lastReadAt);
}

export function getSectionKey(
  timestamp: number | string,
  now: Date = new Date(),
): NotificationSectionKey {
  const daysAgo = differenceInCalendarDays(now, toMillis(timestamp));
  if (daysAgo <= 0) return 'today';
  if (daysAgo === 1) return 'yesterday';
  return 'earlier';
}

export interface NotificationSection<T> {
  key: NotificationSectionKey;
  data: T[];
}

/** Groups activities, newest first, into Today / Yesterday / Earlier sections. */
export function groupIntoSections<T extends ActivityLike>(
  activities: T[],
  now: Date = new Date(),
): NotificationSection<T>[] {
  const sorted = [...activities].sort(
    (a, b) => toMillis(b.timestamp) - toMillis(a.timestamp),
  );
  const sections: NotificationSection<T>[] = [];
  sorted.forEach(activity => {
    const key = getSectionKey(activity.timestamp, now);
    const last = sections[sections.length - 1];
    if (last?.key === key) {
      last.data.push(activity);
    } else {
      sections.push({key, data: [activity]});
    }
  });
  return sections;
}

/**
 * "3:32 PM" for today, "Yesterday, 6:40 PM" (via `formatYesterday`) and "3 Oct" for older
 * entries, with the year added once it is no longer the current one.
 */
export function formatNotificationTime(
  timestamp: number | string,
  formatYesterday: (time: string) => string,
  locale?: Locale,
  now: Date = new Date(),
): string {
  const millis = toMillis(timestamp);
  const time = format(millis, 'p', {locale});
  switch (getSectionKey(millis, now)) {
    case 'today':
      return time;
    case 'yesterday':
      return formatYesterday(time);
    default:
      return format(millis, isSameYear(millis, now) ? 'd MMM' : 'd MMM yyyy', {
        locale,
      });
  }
}
