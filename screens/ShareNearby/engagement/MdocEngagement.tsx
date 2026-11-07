import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {View} from 'react-native';
import {useCountdown} from '../useCountdown';
import {EngagementHeading} from './EngagementHeading';
import {EngagementCode} from './EngagementCode';
import {EngagementStatus} from './EngagementStatus';
import {EngagementActions} from './EngagementActions';
import {ConnectionIllustration} from './ConnectionIllustration';
import {ConnectionPanel} from './ConnectionPanel';
import type {EngagementStage} from './types';

const styles = Theme.ShareNearbyStyles;

export function MdocEngagement({
  qrText,
  expiresAt,
  sessionExpiresAt,
  stage,
  onCancel,
  onHelp,
}: {
  qrText: string;
  expiresAt?: number;
  sessionExpiresAt?: number;
  stage: EngagementStage;
  onCancel: () => void;
  onHelp: () => void;
}) {
  const countdown = useCountdown(expiresAt);
  const isShowingQrCode = stage === 'showingCode';
  const isConnected = stage === 'waitingForRequest';
  return (
    <>
      {isShowingQrCode ? (
        <View style={styles.center}>
          <EngagementHeading stage={stage} />
          <EngagementCode
            qrText={qrText}
            isShowingQrCode
            isExpired={
              expiresAt !== undefined && countdown.remainingSeconds === 0
            }
          />
          <EngagementStatus
            stage={stage}
            expiresAt={expiresAt}
            countdown={countdown}
          />
        </View>
      ) : (
        <View style={styles.center}>
          <ConnectionIllustration
            phase={isConnected ? 'connected' : 'connecting'}
          />
          <EngagementHeading stage={stage} />
          <ConnectionPanel
            isConnected={isConnected}
            sessionExpiresAt={sessionExpiresAt}
          />
        </View>
      )}
      <EngagementActions
        isShowingQrCode={isShowingQrCode}
        isConnected={isConnected}
        onCancel={onCancel}
        onHelp={onHelp}
      />
    </>
  );
}
