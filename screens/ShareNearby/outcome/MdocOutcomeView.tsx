import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '../../../components/ui';
import {useMdocOutcome} from './MdocOutcomeController';
import {OutcomeStatus} from './OutcomeStatus';
import {OutcomeRequestSummary} from './OutcomeRequestSummary';
import {OutcomeActions} from './OutcomeActions';
import {ExpiredCode} from './ExpiredCode';
import {OUTCOME_LAYOUTS} from './outcomeConfig';
import type {MdocOutcomeViewProps} from './types';

const styles = Theme.ShareNearbyStyles;

export function MdocOutcomeView(props: MdocOutcomeViewProps) {
  const {t} = useTranslation('ShareNearby');
  const summary = useMdocOutcome(props);
  if (props.outcome === 'codeExpired')
    return (
      <ExpiredCode onNewCode={props.onNewCode} onCancel={props.onBackToEntry} />
    );
  const layout = OUTCOME_LAYOUTS[props.outcome];
  const isShared = props.outcome === 'shared';
  return (
    <>
      <OutcomeStatus
        outcome={props.outcome}
        icon={layout.icon}
        hasTips={layout.hasTips}
        tipsTitleKey={layout.tipsTitleKey}
      />
      {layout.summary && props.matches.length > 0 && (
        <OutcomeRequestSummary
          verifierName={summary.verifierName}
          isVerifiedVerifier={summary.isVerifiedVerifier}
          detailsLabel={t(isShared ? 'outcome.details' : 'outcome.askedFor')}
          detailsValue={
            isShared
              ? t('outcome.detailsFrom', {
                  count: summary.approvedCount,
                  card: summary.cardName,
                })
              : t('outcome.detailsCount', {count: summary.requestedCount})
          }
          time={summary.time}
        />
      )}
      {/* Only shares are in the activity log so far, so only they link to history. */}
      {isShared && (
        <Button
          styles={styles.buttonContainer}
          type="clear"
          title={t('outcome.viewHistory')}
          onPress={props.onViewHistory}
        />
      )}
      <OutcomeActions
        layout={layout}
        footnote={
          isShared
            ? undefined
            : t(layout.footnoteKey ?? 'outcome.sessionHasEnded')
        }
        onDone={isShared ? props.onDone : props.onBackToEntry}
        onNewCode={props.onNewCode}
        onTurnOnBluetooth={props.onTurnOnBluetooth}
      />
    </>
  );
}
