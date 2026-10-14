import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import * as DateFnsLocale from 'date-fns/locale';
import {VCActivityLog} from '../../components/ActivityLogEvent';
import {VPShareActivityLog} from '../../components/VPShareActivityLogEvent';
import {getDisplayObjectForCurrentLanguage} from '../../shared/openId4VCI/Utils';
import {
  describeActivity,
  formatSharedDetails,
  isPresentationLog,
  nameContext,
  NotificationNames,
  toMillis,
} from './historyNotifications';

export type NotificationActivity = VCActivityLog | VPShareActivityLog;

function issuerNameFromWellknown(wellknown?: object): string {
  const display = (wellknown as {display?: []} | undefined)?.display;
  return display ? getDisplayObjectForCurrentLanguage(display)?.name ?? '' : '';
}

/** Title, text, credential and issuer names for an activity log entry, as shown in History. */
export function useNotificationContent(
  activity: NotificationActivity,
  wellknown?: object,
) {
  const {t, i18n} = useTranslation('HistoryScreen');
  const {t: tLog} = useTranslation('ActivityLogText');

  const descriptor = describeActivity(activity);
  const log = isPresentationLog(activity)
    ? VPShareActivityLog.getLogFromObject(activity)
    : VCActivityLog.getLogFromObject(activity);
  const isCredentialLog = log instanceof VCActivityLog;
  const idType = isCredentialLog
    ? log.getCredentialTypeLabel(tLog, wellknown)
    : undefined;
  const issuerName = isCredentialLog
    ? log.issuerName || issuerNameFromWellknown(wellknown)
    : '';
  const sharedDetails = isCredentialLog
    ? formatSharedDetails(log.sharedDetails ?? [], {
        and: t('listAnd'),
        more: count => t('moreDetails', {count}),
      })
    : '';
  const names: NotificationNames = isCredentialLog
    ? {issuer: issuerName, device: log.deviceName, details: sharedDetails}
    : {verifier: log.verifierName, credentials: log.credentialName};
  const dateLocale = DateFnsLocale[i18n.language as keyof typeof DateFnsLocale];
  const expiryDate =
    isCredentialLog && log.expiryDate
      ? format(toMillis(log.expiryDate), 'd MMM yyyy', {locale: dateLocale})
      : '';
  const values = {
    ...names,
    idType,
    expiryDate,
    interpolation: {escapeValue: false},
  };

  return {
    descriptor,
    log,
    idType,
    issuerName,
    expiryDate,
    title: t(`notificationTitles.${descriptor.titleKey}`, {
      ...values,
      context: nameContext(descriptor.titleName, names),
    }),
    text: descriptor.textKey
      ? t(`text.${descriptor.textKey}`, {
          ...values,
          context: nameContext(descriptor.textName, names),
        })
      : log.getActionText(tLog, wellknown),
    dateLocale,
  };
}
