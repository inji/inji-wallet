import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {Pressable, View} from 'react-native';
import {ActorRefFrom} from 'xstate';
import {ErrorMessageOverlay, MessageOverlay} from '../../MessageOverlay';
import {Theme} from '../../ui/styleUtils';
import {VCMetadata} from '../../../shared/VCMetadata';
import {format} from 'date-fns';

import {VCCardSkeleton} from '../common/VCCardSkeleton';
import {VCCardViewContent} from './VCCardViewContent';
import {useVcItemController} from '../VCItemController';
import {getCredentialIssuersWellKnownConfig} from '../../../shared/openId4VCI/Utils';
import {CARD_VIEW_DEFAULT_FIELDS, isVCLoaded} from '../common/VCUtils';
import {VCItemMachine} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {useTranslation} from 'react-i18next';
import {Copilot} from '../../ui/Copilot';
import {VCProcessor} from '../common/VCProcessor';

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
  onDisclosuresChange,
  onMeasured,
}) => {
  const controller = useVcItemController(vcMetadata);
  const {t} = useTranslation();
  const cardRef = useRef<View>(null);

  const service = controller.VCItemService;
  const verifiableCredentialData = controller.verifiableCredentialData;
  const generatedOn = -controller.generatedOn;

  const formattedDate =
    generatedOn && format(new Date(generatedOn), 'MM/dd/yyyy');

  useEffect(() => {
    controller.UPDATE_VC_METADATA(vcMetadata);
  }, [vcMetadata]);

  const [fields, setFields] = useState([]);
  const [wellknown, setWellknown] = useState(null);
  const [vc, setVc] = useState(null);

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
    async function loadVc() {
      if (!isDownloading) {
        const processedData = await VCProcessor.processForRendering(
          controller.credential,
          controller.verifiableCredentialData.format,
        );
        setVc(processedData);
      }
    }
    loadVc();
  }, [isDownloading, controller.credential]);

  useEffect(() => {
    if (!verifiableCredentialData || !verifiableCredentialData.vcMetadata)
      return;
    const {
      credentialConfigurationId,
      vcMetadata: {format},
    } = verifiableCredentialData;

    if (vcMetadata.issuerHost) {
      getCredentialIssuersWellKnownConfig(
        vcMetadata.issuerHost,
        CARD_VIEW_DEFAULT_FIELDS,
        credentialConfigurationId,
        format,
        vcMetadata.issuerHost,
      )
        .then(response => {
          if (response && response.matchingCredentialIssuerMetadata) {
            setWellknown(response.matchingCredentialIssuerMetadata);
          }
          controller.STORE_INCOMING_VC_WELLKNOWN_CONFIG(
            verifiableCredentialData?.vcMetadata.issuerHost,
            response.wellknownResponse,
          );
          setFields(response.fields);
        })
        .catch(error => {
          setWellknown({fallback: 'true'});
          console.error(
            'Error occurred while fetching wellknown for viewing VC ',
            error,
          );
        });
    }
  }, [verifiableCredentialData]);

  if (!isVCLoaded(controller.credential) || !wellknown || !vc) {
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
      onDisclosuresChange={onDisclosuresChange}
    />
  );

  const wrapTopCard = () => (
    <Copilot
      description={t('copilot:cardMessage')}
      order={6}
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
  onDisclosuresChange?: (paths: string[]) => void;
  onMeasured?: (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}
