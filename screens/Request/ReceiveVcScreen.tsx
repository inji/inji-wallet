import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {DeviceInfoList} from '../../components/DeviceInfoList';
import {Button, Column, Text} from '../../components/ui';
import {Theme} from '../../components/ui/styleUtils';
import {useReceiveVcScreen} from './ReceiveVcScreenController';
import {MessageOverlay} from '../../components/MessageOverlay';
import {useOverlayVisibleAfterTimeout} from '../../shared/hooks/useOverlayVisibleAfterTimeout';
import {VcDetailsContainer} from '../../components/VC/VcDetailsContainer';
import {SharingStatusModal} from '../Scan/SharingStatusModal';
import {SvgImage} from '../../components/ui/svg';
import {DETAIL_VIEW_DEFAULT_FIELDS} from '../../components/VC/common/VCUtils';
import {getDetailedViewFields} from '../../shared/openId4VCI/Utils';
import {VCProcessor} from '../../components/VC/common/VCProcessor';
import VcRenderer from '../../shared/vcRenderer/VcRenderer';

export const ReceiveVcScreen: React.FC = () => {
  const {t} = useTranslation('ReceiveVcScreen');
  const [fields, setFields] = useState([]);
  const [wellknown, setWellknown] = useState(null);
  const controller = useReceiveVcScreen();
  const savingOverlayVisible = useOverlayVisibleAfterTimeout(
    controller.isAccepting,
  );
  const verifiableCredentialData = controller.verifiableCredentialData;
  const profileImage = verifiableCredentialData.face;

  const [credential, setCredential] = useState(null);

  const [svgTemplate, setSvgTemplate] = useState<string[] | null>(null);
  const [svgRendererError, setSvgRendererError] = useState<string[] | null>(
    null,
  );
  const [loadingSvg, setLoadingSvg] = useState<boolean>(true);

  useEffect(() => {
    async function processVC() {
      if (controller.credential) {
        const vcData = await VCProcessor.processForRendering(
          controller.credential,
          verifiableCredentialData.vcMetadata.format,
        );
        setCredential(vcData);
      }
    }

    processVC();
  }, [controller.credential]);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        setLoadingSvg(true);

        const vcJsonString = JSON.stringify(controller.credential.credential);
        const result = await VcRenderer.getInstance().generateCredentialDisplayContent(
          verifiableCredentialData.vcMetadata.format,
          wellknown ?? null,
          vcJsonString,
        );

        setSvgTemplate(result);
        setSvgRendererError(null);
      } catch (err: any) {
        setSvgTemplate(null);
        setSvgRendererError(err.errorCode ?? 'Unknown error');
      } finally {
        setLoadingSvg(false);
      }
    };

    if (controller.credential?.credential['renderMethod']) {
      requestAnimationFrame(fetchSvg);
    } else {
      setLoadingSvg(false);
    }
  }, [controller.credential?.credential, wellknown]);

  useEffect(() => {
    getDetailedViewFields(
      verifiableCredentialData.vcMetadata.issuerHost,
      verifiableCredentialData.credentialConfigurationId,
      DETAIL_VIEW_DEFAULT_FIELDS,
      verifiableCredentialData.vcMetadata.format,
      verifiableCredentialData.vcMetadata.issuerHost,
    ).then(response => {
      setWellknown(response.matchingCredentialIssuerMetadata);
      setFields(response.fields);
      controller.STORE_INCOMING_VC_WELLKNOWN_CONFIG(
        verifiableCredentialData?.vcMetadata.issuerHost,
        response.wellknownResponse,
      );
    });
  }, [verifiableCredentialData?.wellKnown]);

  return (
    <React.Fragment>
      {controller.isDisplayingIncomingVC && (
        <Column
          scroll
          padding="24 0 48 0"
          backgroundColor={Theme.Colors.lightGreyBackgroundColor}>
          <Column>
            <DeviceInfoList of="sender" deviceInfo={controller.senderInfo} />
            <Text weight="semibold" margin="24 24 0 24">
              {t('header')}
            </Text>
            <VcDetailsContainer
              fields={fields}
              wellknown={wellknown}
              credential={credential}
              credentialWrapper={controller.credential}
              verifiableCredentialData={verifiableCredentialData}
              isBindingPending={false}
              activeTab={1}
              vcHasImage={profileImage !== undefined}
              svgTemplate={svgTemplate}
              svgRendererError={svgRendererError}
              loadingSvg={loadingSvg}
            />
          </Column>
          <Column padding="0 24" margin="32 0 0 0">
            <Button
              title={t('goToReceivedVCTab')}
              margin="0 0 12 0"
              type="gradient"
              onPress={controller.GO_TO_RECEIVED_VC_TAB}
            />
          </Column>
        </Column>
      )}

      <MessageOverlay
        isVisible={savingOverlayVisible}
        message={t('saving')}
        progress={true}
      />

      <SharingStatusModal
        isVisible={controller.isSavingFailedInIdle}
        testId={'savingFailedError'}
        image={SvgImage.ErrorLogo()}
        title={t('errors.savingFailed.title')}
        message={t('errors.savingFailed.message')}
        gradientButtonTitle={t('common:ok')}
        onGradientButton={controller.RESET}
      />
    </React.Fragment>
  );
};
