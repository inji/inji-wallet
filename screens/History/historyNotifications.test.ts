import {subDays} from 'date-fns';
import {
  describeActivity,
  EXPIRY_NOTICE_DAYS,
  expiryNotices,
  formatNotificationTime,
  formatSharedDetails,
  getSectionKey,
  groupIntoSections,
  isActivityUnread,
  matchesFilter,
  nameContext,
  notificationId,
  opensCredential,
  pruneReadIds,
  withCardNames,
} from './historyNotifications';
import {VCItemContainerFlowType} from '../../shared/Utils';

const NOW = new Date(2026, 9, 14, 15, 51);
const at = (daysAgo: number, hours: number, minutes = 0) =>
  new Date(2026, 9, 14 - daysAgo, hours, minutes).getTime();

const vcLog = (type: string, timestamp = NOW.getTime(), vcStatus = '') => ({
  type,
  timestamp,
  vcStatus,
  flow: VCItemContainerFlowType.VC_SHARE,
});
const vpLog = (type: string, timestamp = NOW.getTime()) => ({
  type,
  timestamp,
  flow: VCItemContainerFlowType.VP_SHARE,
});

describe('describeActivity', () => {
  it('shows a downloaded credential as an issued credential', () => {
    expect(describeActivity(vcLog('VC_DOWNLOADED'))).toEqual({
      category: 'credentials',
      tone: 'success',
      titleKey: 'credentialIssued',
      actionNeeded: false,
      textKey: 'VC_DOWNLOADED',
      textName: 'issuer',
    });
  });

  it('puts shares under Sharing and QR login under Account', () => {
    expect(describeActivity(vcLog('VC_SHARED')).category).toBe('sharing');
    expect(describeActivity(vpLog('SHARED_SUCCESSFULLY')).category).toBe(
      'sharing',
    );
    expect(describeActivity(vcLog('QRLOGIN_SUCCESFULL')).category).toBe(
      'account',
    );
  });

  it('uses the status of a status change and flags expiry as action needed', () => {
    const expired = describeActivity(
      vcLog('VC_STATUS_CHANGED', NOW.getTime(), 'EXPIRED'),
    );
    expect(expired.tone).toBe('warning');
    expect(expired.titleKey).toBe('statusExpired');
    expect(expired.actionNeeded).toBe(true);
  });

  it('shows a declined request with the share tone', () => {
    expect(describeActivity(vpLog('USER_DECLINED_CONSENT'))).toMatchObject({
      tone: 'share',
      titleKey: 'requestDeclined',
    });
  });

  it('treats unlisted VP log types as sharing failures', () => {
    expect(describeActivity(vpLog('SEND_VP_ERROR'))).toMatchObject({
      category: 'sharing',
      tone: 'failure',
      titleKey: 'sharingFailed',
    });
  });
});

describe('opensCredential', () => {
  it('is true for downloaded and expiring credentials', () => {
    expect(opensCredential(vcLog('VC_DOWNLOADED'))).toBe(true);
    expect(opensCredential(vcLog('VC_EXPIRY_DUE'))).toBe(true);
    expect(opensCredential(vcLog('VC_EXPIRED'))).toBe(true);
    expect(opensCredential(vcLog('VC_SHARED'))).toBe(false);
    expect(opensCredential(vpLog('VC_DOWNLOADED'))).toBe(false);
  });
});

describe('expiryNotices', () => {
  const inDays = (days: number) =>
    new Date(NOW.getTime() + days * 86_400_000).toISOString();
  const dates = (entries: Record<string, string>) =>
    new Map(Object.entries(entries));

  it('is due within 30 days of expiry, dated when it became due', () => {
    const expiryDate = inDays(10);
    expect(expiryNotices(dates({vc: expiryDate}), [], NOW)).toEqual([
      {
        type: 'VC_EXPIRY_DUE',
        _vcKey: 'vc',
        timestamp: subDays(new Date(expiryDate), EXPIRY_NOTICE_DAYS).getTime(),
        expiryDate,
      },
    ]);
    expect(describeActivity(vcLog('VC_EXPIRY_DUE'))).toEqual({
      category: 'credentials',
      tone: 'warning',
      titleKey: 'renewalDue',
      actionNeeded: true,
      textKey: 'VC_EXPIRY_DUE',
    });
  });

  it('says nothing for credentials further from expiry or without a valid date', () => {
    expect(
      expiryNotices(dates({far: inDays(31), bad: 'not a date'}), [], NOW),
    ).toEqual([]);
  });

  it('is never dated before the card was added', () => {
    const added = at(1, 9);
    const [notice] = expiryNotices(
      dates({vc: inDays(5)}),
      [{...vcLog('VC_DOWNLOADED', added), _vcKey: 'vc'}],
      NOW,
    );
    expect(notice.timestamp).toBe(added);
  });

  it('turns into an expired notice on the expiry date', () => {
    const expiryDate = inDays(-2);
    expect(expiryNotices(dates({vc: expiryDate}), [], NOW)).toEqual([
      {
        type: 'VC_EXPIRED',
        _vcKey: 'vc',
        timestamp: new Date(expiryDate).getTime(),
        expiryDate,
      },
    ]);
    expect(describeActivity(vcLog('VC_EXPIRED')).titleKey).toBe(
      'statusExpired',
    );
  });

  it('leaves out an expiry a status check already logged', () => {
    expect(
      expiryNotices(
        dates({vc: inDays(-2)}),
        [{...vcLog('VC_STATUS_CHANGED', at(1, 9), 'EXPIRED'), _vcKey: 'vc'}],
        NOW,
      ),
    ).toEqual([]);
  });
});

describe('notification copy', () => {
  it('names the receiving device in the title of a Bluetooth share', () => {
    expect(describeActivity(vcLog('VC_SHARED'))).toMatchObject({
      titleName: 'device',
      textKey: 'VC_SHARED',
    });
  });

  it('names the verifier in the title and the cards in the text of an online share', () => {
    expect(describeActivity(vpLog('SHARED_AFTER_RETRY'))).toMatchObject({
      titleKey: 'presentationShared',
      titleName: 'verifier',
      textKey: 'vp.SHARED',
      textName: 'credentials',
    });
  });

  it('names the verifier in the text of a declined request', () => {
    expect(describeActivity(vpLog('USER_DECLINED_CONSENT'))).toMatchObject({
      textKey: 'vp.USER_DECLINED_CONSENT',
      textName: 'verifier',
    });
  });

  it('uses the status text for a status change', () => {
    expect(
      describeActivity(vcLog('VC_STATUS_CHANGED', NOW.getTime(), 'REVOKED')),
    ).toMatchObject({textKey: 'VC_STATUS_CHANGED.REVOKED', textName: 'issuer'});
  });

  it("keeps the log's own text for sharing errors without a text of their own", () => {
    expect(describeActivity(vpLog('SEND_VP_ERROR')).textKey).toBeUndefined();
  });
});

describe('in-person shares', () => {
  it('names the verifier in the title and lists the shared details', () => {
    expect(describeActivity(vcLog('VC_SHARED_IN_PERSON'))).toMatchObject({
      category: 'sharing',
      titleKey: 'credentialShared',
      titleName: 'device',
      textName: 'details',
    });
  });

  it('shows declined and failed sessions under Sharing', () => {
    expect(
      describeActivity(vcLog('VC_SHARE_IN_PERSON_DECLINED')),
    ).toMatchObject({category: 'sharing', titleKey: 'requestDeclined'});
    expect(describeActivity(vcLog('VC_SHARE_IN_PERSON_FAILED'))).toMatchObject({
      category: 'sharing',
      tone: 'failure',
      titleKey: 'sharingFailed',
    });
  });
});

describe('formatSharedDetails', () => {
  const words = {and: 'and', more: (count: number) => `${count} more`};

  it('lists element names as a sentence', () => {
    expect(
      formatSharedDetails(['family_name', 'portrait', 'age_over_18'], words),
    ).toBe('Family name, portrait and age over 18');
    expect(formatSharedDetails(['portrait'], words)).toBe('Portrait');
    expect(formatSharedDetails([], words)).toBe('');
  });

  it('summarises anything past the limit', () => {
    expect(
      formatSharedDetails(
        [
          'family_name',
          'given_name',
          'portrait',
          'birth_date',
          'document_number',
        ],
        words,
      ),
    ).toBe('Family name, given name, portrait and 2 more');
  });
});

describe('nameContext', () => {
  it('selects the named variant only when the name is known', () => {
    expect(nameContext('issuer', {issuer: 'Road Transport Authority'})).toBe(
      'issuer',
    );
    expect(nameContext('issuer', {issuer: '  '})).toBeUndefined();
    expect(nameContext('verifier', {issuer: 'Road Transport Authority'})).toBe(
      undefined,
    );
    expect(nameContext(undefined, {issuer: 'Road Transport Authority'})).toBe(
      undefined,
    );
  });
});

describe('read state', () => {
  const opened = {...vcLog('VC_DOWNLOADED', at(0, 10)), _vcKey: 'vc-1'};
  const other = {...vcLog('VC_DOWNLOADED', at(0, 10)), _vcKey: 'vc-2'};

  it('gives entries with the same time and type but different credentials different ids', () => {
    expect(notificationId(opened)).not.toBe(notificationId(other));
  });

  it('marks an opened notification as read without touching the others', () => {
    const readIds = new Set([notificationId(opened)]);

    expect(isActivityUnread(opened, 0, readIds)).toBe(false);
    expect(isActivityUnread(other, 0, readIds)).toBe(true);
  });

  it('treats everything up to "Mark all as read" as read', () => {
    expect(isActivityUnread(opened, at(0, 11), new Set())).toBe(false);
  });

  it('shows nothing as unread while the read state is loading', () => {
    expect(isActivityUnread(opened, null, new Set())).toBe(false);
  });

  it('prunes ids already covered by "Mark all as read"', () => {
    const newer = {...opened, timestamp: at(0, 12)};
    expect(
      pruneReadIds([notificationId(opened), notificationId(newer)], at(0, 11)),
    ).toEqual([notificationId(newer)]);
  });
});

describe('withCardNames', () => {
  const card = {
    credentialType: 'Driving Licence',
    issuerName: 'Road Transport Authority',
  };

  it('fills names an older log is missing from the card', () => {
    expect(withCardNames(vcLog('VC_DOWNLOADED'), card)).toMatchObject({
      credentialName: 'Driving Licence',
      issuerName: 'Road Transport Authority',
    });
  });

  it('keeps names the log already has', () => {
    const logged = {
      ...vcLog('VC_DOWNLOADED'),
      credentialName: 'National ID',
      issuerName: 'National Identity Authority',
    };
    expect(withCardNames(logged, card)).toBe(logged);
  });

  it('leaves the log alone when the card is no longer in the wallet', () => {
    const log = vcLog('VC_DOWNLOADED');
    expect(withCardNames(log, undefined)).toBe(log);
  });
});

describe('matchesFilter', () => {
  it('matches every activity for "all" and only its category otherwise', () => {
    const shared = vcLog('VC_SHARED');
    expect(matchesFilter(shared, 'all')).toBe(true);
    expect(matchesFilter(shared, 'sharing')).toBe(true);
    expect(matchesFilter(shared, 'credentials')).toBe(false);
  });
});

describe('getSectionKey', () => {
  it('splits by calendar day, not by 24-hour windows', () => {
    expect(getSectionKey(at(0, 0, 5), NOW)).toBe('today');
    expect(getSectionKey(at(1, 23, 59), NOW)).toBe('yesterday');
    expect(getSectionKey(at(2, 23, 59), NOW)).toBe('earlier');
  });

  it('accepts ISO string timestamps', () => {
    expect(getSectionKey(new Date(at(1, 9)).toISOString(), NOW)).toBe(
      'yesterday',
    );
  });
});

describe('groupIntoSections', () => {
  it('orders activities newest first and groups them by day', () => {
    const sections = groupIntoSections(
      [
        vcLog('VC_DOWNLOADED', at(5, 10)),
        vcLog('VC_SHARED', at(0, 9)),
        vcLog('VC_DOWNLOADED', at(1, 18)),
        vcLog('VC_SHARED', at(0, 15)),
      ],
      NOW,
    );

    expect(sections.map(section => section.key)).toEqual([
      'today',
      'yesterday',
      'earlier',
    ]);
    expect(sections[0].data.map(activity => activity.timestamp)).toEqual([
      at(0, 15),
      at(0, 9),
    ]);
  });

  it('returns no sections for no activities', () => {
    expect(groupIntoSections([], NOW)).toEqual([]);
  });
});

describe('formatNotificationTime', () => {
  const yesterday = (time: string) => `Yesterday, ${time}`;

  it('shows only the time for today', () => {
    expect(
      formatNotificationTime(at(0, 15, 32), yesterday, undefined, NOW),
    ).toBe('3:32 PM');
  });

  it('prefixes the time with "Yesterday" for yesterday', () => {
    expect(
      formatNotificationTime(at(1, 18, 40), yesterday, undefined, NOW),
    ).toBe('Yesterday, 6:40 PM');
  });

  it('shows day and month for older entries, adding the year for past years', () => {
    expect(formatNotificationTime(at(11, 9), yesterday, undefined, NOW)).toBe(
      '3 Oct',
    );
    expect(
      formatNotificationTime(
        new Date(2025, 8, 28).getTime(),
        yesterday,
        undefined,
        NOW,
      ),
    ).toBe('28 Sep 2025');
  });
});
