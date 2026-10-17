import * as React from 'react';
import {useEffect, useRef} from 'react';
import {Pressable, View} from 'react-native';
import {ActorRefFrom} from 'xstate';
import {ErrorMessageOverlay, MessageOverlay} from '../../MessageOverlay';
import {Theme} from '../../ui/styleUtils';
import {VCMetadata} from '../../../shared/VCMetadata';

import {VCCardSkeleton} from '../common/VCCardSkeleton';
import {VCCardViewContent} from './VCCardViewContent';
import {VCItemMachine} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {useTranslation} from 'react-i18next';
import {Copilot} from '../../ui/Copilot';
import {useVcCardData} from '../useVcCardData';
import {COPILOT_FINAL_STEP} from '../../../shared/constants';

export const VCCardView: React.FC<VCItemProps> = ({
  vcMetadata,
  selectable,
  selected,
  onPress,
  isDownloading,
  isPinned,
  flow,
  isInitialLaunch = false,
  isTopCard = false,
  onMeasured,
  autoOpen = false,
  onAutoOpened,
}) => {
  const {controller, vc, wellknown, isLoaded} = useVcCardData(
    vcMetadata,
    isDownloading,
  );
  const {t} = useTranslation();
  const cardRef = useRef<View>(null);

  const service = controller.VCItemService;
  const verifiableCredentialData = controller.verifiableCredentialData;

  useEffect(() => {
    if (onMeasured && cardRef.current) {
      const handle = requestAnimationFrame(() => {
        cardRef.current?.measureInWindow((x, y, width, height) => {
          if (width > 0 && height > 0) {
            onMeasured({x, y, width, height});
          }
        });
      });

      return () => cancelAnimationFrame(handle);
    }
  }, [onMeasured]);

  useEffect(() => {
    if (autoOpen && isLoaded) {
      onPress(service);
      onAutoOpened?.();
    }
  }, [autoOpen, isLoaded]);

  if (!isLoaded) {
    return <VCCardSkeleton />;
  }

  const CardViewContent = () => (
    <VCCardViewContent
      vcMetadata={vcMetadata}
      walletBindingResponse={controller.walletBindingResponse}
      credential={vc}
      verifiableCredentialData={verifiableCredentialData}
      wellknown={wellknown}
      selectable={selectable}
      selected={selected}
      service={service}
      isPinned={isPinned}
      onPress={() => onPress(service)}
      flow={flow}
      isKebabPopUp={controller.isKebabPopUp}
      DISMISS={controller.DISMISS}
      KEBAB_POPUP={controller.KEBAB_POPUP}
      isInitialLaunch={isInitialLaunch}
    />
  );

  const wrapTopCard = () => (
    <Copilot
      description={t('copilot:cardMessage')}
      order={COPILOT_FINAL_STEP}
      title={t('copilot:cardTitle')}>
      {CardViewContent()}
    </Copilot>
  );

  return (
    <>
      <MessageOverlay
        progress={true}
        title={t('In Progress')}
        isVisible={controller.isReverifyingVc}
      />

      <Pressable
        ref={cardRef}
        accessible={false}
        onPress={() => onPress(service)}
        style={
          selected
            ? Theme.Styles.selectedBindedVc
            : Theme.Styles.closeCardBgContainer
        }>
        {(isInitialLaunch || controller.isTourGuide) && isTopCard
          ? wrapTopCard()
          : CardViewContent()}
      </Pressable>
      <ErrorMessageOverlay
        isVisible={controller.isSavingFailedInIdle}
        error={controller.storeErrorTranslationPath}
        onDismiss={controller.DISMISS}
        translationPath={'VcDetails'}
      />
    </>
  );
};

export interface VCItemProps {
  vcMetadata: VCMetadata;
  margin?: string;
  selectable?: boolean;
  selected?: boolean;
  onPress: (vcRef?: ActorRefFrom<typeof VCItemMachine>) => void;
  onShow?: (vcRef?: ActorRefFrom<typeof VCItemMachine>) => void;
  isDownloading?: boolean;
  isPinned?: boolean;
  flow?: string;
  isInitialLaunch?: boolean;
  isTopCard?: boolean;
  /** Opens the card (as if pressed) once it has finished loading. */
  autoOpen?: boolean;
  onAutoOpened?: () => void;
  onMeasured?: (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}
