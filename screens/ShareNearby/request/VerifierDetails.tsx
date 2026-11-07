import {Theme} from '../../../components/ui/styleUtils';
import React from 'react';
import {Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text, Button} from '../../../components/ui';
import type {ReaderTrust} from '../../../shared/mdocPresentation/types';
import {VerifierTrustBadge} from './VerifierTrustBadge';

const styles = Theme.ShareNearbyStyles;

/** Frames 41 and 42. */
export function VerifierDetails({
  readerTrust,
  onClose,
  onLearnMore,
}: {
  readerTrust: ReaderTrust;
  onClose: () => void;
  onLearnMore: () => void;
}) {
  const {t} = useTranslation('ShareNearby');
  return (
    <>
      <VerifierTrustBadge status={readerTrust.status} />
      {readerTrust.status === 'verified' && readerTrust.readerName ? (
        <Text weight="semibold" style={styles.body}>
          {readerTrust.readerName}
        </Text>
      ) : null}
      <Text style={styles.body}>
        {t(`request.trustDescription.${readerTrust.status}`)}
      </Text>
      <Button
        styles={styles.buttonContainer}
        type="gradient"
        title={t('close')}
        onPress={onClose}
      />
      <Pressable
        accessibilityRole="button"
        onPress={onLearnMore}
        style={({pressed}) => [styles.linkButton, pressed && styles.pressed]}>
        <Text weight="semibold" style={styles.link}>
          {t('requestHelp.learnMore')}
        </Text>
      </Pressable>
    </>
  );
}
