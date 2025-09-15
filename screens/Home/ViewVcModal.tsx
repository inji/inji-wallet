import React, {useEffect, useState} from 'react';
import {Row} from '../../components/ui';
import {Modal} from '../../components/ui/Modal';
import {MessageOverlay} from '../../components/MessageOverlay';
import {ToastItem} from '../../components/ui/ToastItem';
import {useViewVcModal, ViewVcModalProps} from './ViewVcModalController';
import {useTranslation} from 'react-i18next';
import {OtpVerificationModal} from './MyVcs/OtpVerificationModal';
import {BindingVcWarningOverlay} from './MyVcs/BindingVcWarningOverlay';
import {VcDetailsContainer} from '../../components/VC/VcDetailsContainer';
import {TelemetryConstants} from '../../shared/telemetry/TelemetryConstants';
import {BannerNotificationContainer} from '../../components/BannerNotificationContainer';
import {Theme} from '../../components/ui/styleUtils';
import {HelpScreen} from '../../components/HelpScreen';
import {Pressable, View} from 'react-native';
import {KebabPopUp} from '../../components/KebabPopUp';
import {SvgImage} from '../../components/ui/svg';
import {VCMetadata} from '../../shared/VCMetadata';
import {WalletBinding} from './MyVcs/WalletBinding';
import {RemoveVcWarningOverlay} from './MyVcs/RemoveVcWarningOverlay';
import {HistoryTab} from './MyVcs/HistoryTab';
import {getDetailedViewFields} from '../../shared/openId4VCI/Utils';
import {
  DETAIL_VIEW_DEFAULT_FIELDS,
  isVCLoaded,
} from '../../components/VC/common/VCUtils';
import {ActivityIndicator} from '../../components/ui/ActivityIndicator';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {
  BannerNotification,
  BannerStatus,
} from '../../components/BannerNotification';
import {VCProcessor} from '../../components/VC/common/VCProcessor';
import {HelpIcon} from '../../components/ui/HelpIcon';
import VcRenderer from '../../shared/vcRenderer/VcRenderer';

export const ViewVcModal: React.FC<ViewVcModalProps> = props => {
  const {t} = useTranslation('ViewVcModal');
  const controller = useViewVcModal(props);
  const profileImage = controller.verifiableCredentialData.face;
  const verificationStatus = controller.verificationStatus;
  const [verifiableCredential, setVerifiableCredential] = useState(null);
  const [svgTemplate, setSvgTemplate] = useState<string[] | null>(null);
  const [svgRendererError, setSvgRendererError] = useState<string[] | null>(
    null,
  );

  useEffect(() => {
    async function processVC() {
      if (controller.credential) {
        const vcData = await VCProcessor.processForRendering(
          controller.credential,
          controller.verifiableCredentialData.format,
        );
        setVerifiableCredential(vcData);
      }
    }

    processVC();
  }, [controller.credential]);

  useEffect(() => {
    if (controller.isVerificationInProgress) {
      controller.SHOW_VERIFICATION_STATUS_BANNER();
    }
    if (
      !controller.verifiableCredentialData.vcMetadata.isVerified &&
      !controller.isVerificationInProgress
    ) {
      props.vcItemActor.send({type: 'VERIFY'});
    }
  }, [controller.verifiableCredentialData.vcMetadata.isVerified]);

  let [fields, setFields] = useState([]);
  const [wellknown, setWellknown] = useState(null);
  const [wellknownFieldsFlag, setWellknownFieldsFlag] = useState(false);
  const verifiableCredentialData = controller.verifiableCredentialData;

  const [loadingSvg, setLoadingSvg] = useState<boolean>(true);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        setLoadingSvg(true);

        const vcJsonString = JSON.stringify(controller.credential.credential);
        const result = await VcRenderer.getInstance().renderVC(
          controller.verifiableCredentialData.format,
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
      verifiableCredentialData.vcMetadata.issuerHost as string,
      verifiableCredentialData.credentialConfigurationId,
      DETAIL_VIEW_DEFAULT_FIELDS,
      verifiableCredentialData.vcMetadata.format,
      verifiableCredentialData.vcMetadata.issuerHost,
    )
      .then(response => {
        setWellknown(response.matchingCredentialIssuerMetadata);
        setFields(response.fields);
        setWellknownFieldsFlag(response.wellknownFieldsFlag);
      })
      .catch(error => {
        console.error('Error fetching well-known fields:', error);
      });
  }, [verifiableCredentialData?.wellKnown]);

  const headerRight = flow => {
    return flow === 'downloadedVc' ? (
      <Row align="space-between">
        <HelpScreen source={'Inji'} triggerComponent={HelpIcon()} />
        {isVCLoaded(verifiableCredential) ? (
          <Pressable
            onPress={() => props.vcItemActor.send('KEBAB_POPUP')}
            accessible={false}>
            <KebabPopUp
              icon={SvgImage.kebabIcon('KebabIcon')}
              vcMetadata={controller.verifiableCredentialData.vcMetadata}
              isVisible={
                props.vcItemActor.getSnapshot()?.context
                  .isMachineInKebabPopupState
              }
              onDismiss={() => props.vcItemActor.send('DISMISS')}
              service={props.vcItemActor}
              vcHasImage={profileImage !== undefined}
            />
          </Pressable>
        ) : (
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            width={35}
            height={35}
            style={Theme.Styles.shimmer}
          />
        )}
      </Row>
    ) : undefined;
  };

  const handleModalDismiss = () => {
    props.onDismiss();
    if (controller.isVerificationCompleted) {
      props.vcItemActor.send('REMOVE_VERIFICATION_STATUS_BANNER');
    }
  };

  return (
    <Modal
      isVisible={props.isVisible}
      testID="idDetailsHeader"
      arrowLeft={true}
      headerRight={headerRight(props.flow)}
      headerTitle={t('title')}
      onDismiss={handleModalDismiss}
      headerElevation={2}>
      <BannerNotificationContainer showVerificationStatusBanner={false} />

      {controller.showVerificationStatusBanner && (
        <BannerNotification
          type={verificationStatus?.statusType as BannerStatus}
          message={t(`VcVerificationBanner:${verificationStatus?.statusType}`, {
            vcDetails: `${verificationStatus.vcType} ${verificationStatus?.vcNumber}`,
          })}
          onClosePress={controller.RESET_VERIFICATION_STATUS}
          key={'reVerificationInProgress'}
          testId={'reVerificationInProgress'}
        />
      )}

      {!isVCLoaded(verifiableCredential) ? (
        <ActivityIndicator />
      ) : (
        <VcDetailsContainer
          fields={fields}
          wellknownFieldsFlag={wellknownFieldsFlag}
          wellknown={wellknown}
          credential={verifiableCredential}
          credentialWrapper={controller.credential}
          verifiableCredentialData={controller.verifiableCredentialData}
          onBinding={controller.addtoWallet}
          walletBindingResponse={controller.walletBindingResponse}
          activeTab={props.activeTab}
          vcHasImage={profileImage !== undefined}
          svgTemplate={svgTemplate}
          svgRendererError={svgRendererError}
          loadingSvg={loadingSvg}
        />
      )}

      {controller.isAcceptingBindingOtp && (
        <OtpVerificationModal
          service={props.vcItemActor}
          isVisible={controller.isAcceptingBindingOtp}
          onDismiss={controller.DISMISS}
          onInputDone={controller.inputOtp}
          error={controller.otpError}
          resend={controller.RESEND_OTP}
          phone={controller.isCommunicationDetails.phoneNumber}
          email={controller.isCommunicationDetails.emailId}
          flow={TelemetryConstants.FlowType.vcActivation}
        />
      )}

      <BindingVcWarningOverlay
        isVisible={controller.isBindingWarning}
        onConfirm={controller.CONFIRM}
        onCancel={controller.CANCEL}
      />

      <MessageOverlay
        testID="walletBindingError"
        isVisible={controller.isBindingError}
        title={controller.walletBindingError}
        onButtonPress={() => {
          controller.CANCEL();
        }}
      />

      <MessageOverlay
        isVisible={controller.isWalletBindingInProgress}
        title={t('inProgress')}
        progress
      />

      {controller.toastVisible && <ToastItem message={controller.message} />}

      <WalletBinding
        service={props.vcItemActor}
        vcMetadata={controller.verifiableCredentialData.vcMetadata}
      />

      <RemoveVcWarningOverlay
        testID="removeVcWarningOverlay"
        service={props.vcItemActor}
        vcMetadata={controller.verifiableCredentialData.vcMetadata}
      />

      <HistoryTab
        service={props.vcItemActor}
        vcMetadata={VCMetadata.fromVC(
          controller.verifiableCredentialData.vcMetadata,
        )}
      />
    </Modal>
  );
};
