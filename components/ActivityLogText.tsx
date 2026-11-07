import React from 'react';
import {useTranslation} from 'react-i18next';

import {TextItem} from './ui/TextItem';
import {VCActivityLog} from './ActivityLogEvent';
import {useHistoryTab} from '../screens/History/HistoryScreenController';
import {VPShareActivityLog} from './VPShareActivityLogEvent';
import {MdocShareActivityLog} from './MdocShareActivityLogEvent';
import {VCItemContainerFlowType} from '../shared/Utils';

function isMdocActivityLog(
  activity: VCActivityLog | VPShareActivityLog | MdocShareActivityLog,
): activity is MdocShareActivityLog {
  return activity.flow === VCItemContainerFlowType.MDOC_SHARE;
}

export const ActivityLogText: React.FC<{
  activity: VCActivityLog | VPShareActivityLog | MdocShareActivityLog;
}> = props => {
  let {activity} = props;
  const {t, i18n} = useTranslation('ActivityLogText');
  const historyController = useHistoryTab();
  activity =
    activity.flow === VCItemContainerFlowType.VP_SHARE
      ? VPShareActivityLog.getLogFromObject(activity)
      : isMdocActivityLog(activity)
      ? MdocShareActivityLog.getLogFromObject(activity)
      : VCActivityLog.getLogFromObject(activity);
  const wellknown =
    activity.flow === VCItemContainerFlowType.VC_SHARE && 'issuer' in activity
      ? historyController.getWellKnownIssuerMap(activity.issuer)
      : undefined;

  return (
    <TextItem
      label={activity.getActionLabel(i18n.language)}
      text={activity.getActionText(t, wellknown)}
      divider
    />
  );
};
