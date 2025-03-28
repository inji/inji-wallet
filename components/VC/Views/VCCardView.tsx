import * as React from 'react';
import {useEffect, useState} from 'react';
import {Pressable} from 'react-native';
import {ActorRefFrom} from 'xstate';
import {ErrorMessageOverlay} from '../../MessageOverlay';
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
  margin,
  selectable,
  selected,
  onPress,
  onShow,
  isDownloading,
  isPinned,
  flow,
  isInitialLaunch = false,
  isTopCard = false,
}) => {
  const controller = useVcItemController(vcMetadata);
  const {t} = useTranslation();

  const service = controller.VCItemService;
  const verifiableCredentialData = controller.verifiableCredentialData;
  const generatedOn = -controller.generatedOn;

  let formattedDate =
    generatedOn && format(new Date(generatedOn), 'MM/dd/yyyy');

  useEffect(() => {
    controller.UPDATE_VC_METADATA(vcMetadata);
  }, [vcMetadata]);

  const [fields, setFields] = useState([]);
  const [wellknown, setWellknown] = useState(null);
  const [vc, setVc] = useState(null);

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
    if (!verifiableCredentialData || !verifiableCredentialData.vcMetadata) return;
    const {
      issuer,
      credentialConfigurationId,
      vcMetadata: { format },
    } = verifiableCredentialData;
    if (vcMetadata) {
      getCredentialIssuersWellKnownConfig(
        issuer,
        CARD_VIEW_DEFAULT_FIELDS,
        credentialConfigurationId,
        format,
        vcMetadata.issuerHost,
      )
        .then(response => {
          setWellknown(response.matchingCredentialIssuerMetadata);
          setFields(response.fields);
        })
        .catch(error => {
          console.error(
            'Error occurred while fetching wellknown for viewing VC ',
            error,
          );
        });
    }
  }, [verifiableCredentialData]);

  if (!isVCLoaded(controller.credential, fields) || !wellknown || !vc) {
    return <VCCardSkeleton />;
  }
  
  const CardViewContent = () => (
    <VCCardViewContent
      vcMetadata={vcMetadata}
      context={controller.context}
      walletBindingResponse={controller.walletBindingResponse}
      credential={vc}
      verifiableCredentialData={verifiableCredentialData}
      fields={fields}
      wellknown={wellknown}
      generatedOn={formattedDate}
      selectable={selectable}
      selected={selected}
      service={service}
      isPinned={isPinned}
      onPress={() => onPress(service)}
      isDownloading={isDownloading}
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
      order={6}
      title={t('copilot:cardTitle')}
      children={CardViewContent()}
    />
  );

  return (
    <React.Fragment>
      <Pressable
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
    </React.Fragment>
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
}
