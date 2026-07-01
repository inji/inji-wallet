import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {ErrorView} from '../ui/Error';
import {SvgImage} from '../ui/svg';
import {Column, Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {MissingClaimsView} from './missingClaimsView/MissingClaimsView';
import {VerifierInfo} from './verifier/VerifierInfo';
import {VcItemContainer} from '../VC/VcItemContainer';
import {
  MatchingVcsResult,
  MatchingVCsResultForDcql,
  MatchingVCsResultForPresentationExchangeRequest,
} from '../../shared/openID4VP/openid4vp.types';
import {VCMetadata} from '../../shared/VCMetadata';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {useOvpErrorModal} from '../../shared/hooks/useOvpErrorModal';
import OpenID4VP from '../../shared/openID4VP/OpenID4VP';
import {
  isIOS,
  OVP_ERROR_CODE,
  OVP_ERROR_MESSAGES,
} from '../../shared/constants';

type SendVPErrorProps = {
  isAuthorizationFlow: boolean;
  error: string;
  noCredentialsMatchingVPRequest: boolean;
  requestedClaimsByVerifier: Set<string>;
  getAdditionalMessage: () => string;
  generateAndStoreLogMessage: (logType: string, errorInfo?: string) => void;
  matchingVcsResult?: MatchingVcsResult;
  verifierNameInTrustModal?: string;
  verifierLogoInTrustModal?: string;
  isOVPViaDeepLink: boolean;
  openID4VPRetryCount: number;
  onRetry: () => void;
  onGoBack: () => void;
  onGoHome: () => void;
  onDeepLinkErrorExit: () => void;
};

export const SendVPError: React.FC<SendVPErrorProps> = ({
  isAuthorizationFlow,
  error,
  noCredentialsMatchingVPRequest,
  requestedClaimsByVerifier,
  getAdditionalMessage,
  generateAndStoreLogMessage,
  matchingVcsResult,
  verifierNameInTrustModal,
  verifierLogoInTrustModal,
  isOVPViaDeepLink,
  openID4VPRetryCount,
  onRetry,
  onGoBack,
  onGoHome,
  onDeepLinkErrorExit,
}) => {
  const {t} = useTranslation('SendVPScreen');
  const [errorModal, resetErrorModal] = useOvpErrorModal({
    error: error ?? '',
    noCredentialsMatchingVPRequest,
    requestedClaimsByVerifier,
    getAdditionalMessage,
    generateAndStoreLogMessage,
    matchingVcsResult,
    verifierInfo: {
      name: verifierNameInTrustModal,
      logo: verifierLogoInTrustModal,
    },
    t,
  });

  useEffect(() => {
    if (errorModal.show && isOVPViaDeepLink) {
      const timeout = setTimeout(
        async () => {
          // Send error to verifier is initiated and its response is not listened to here.
          void OpenID4VP.sendErrorToVerifier(
            OVP_ERROR_MESSAGES.NO_MATCHING_VCS,
            OVP_ERROR_CODE.NO_MATCHING_VCS,
          );
          resetErrorModal();
          onDeepLinkErrorExit();
        },
        isIOS() ? 4000 : 2000,
      );

      return () => clearTimeout(timeout);
    }
  }, [errorModal.show, isOVPViaDeepLink, onDeepLinkErrorExit, resetErrorModal]);

  if (!errorModal.show || isAuthorizationFlow) {
    return null;
  }

  const additionalMessage =
    isOVPViaDeepLink && !(errorModal.showRetryButton && openID4VPRetryCount < 3)
      ? errorModal.additionalMessage
      : undefined;

  const primaryButtonText =
    errorModal.showRetryButton && openID4VPRetryCount < 3
      ? t('ScanScreen:status.retry')
      : undefined;

  const textButtonText = isOVPViaDeepLink
    ? undefined
    : t('ScanScreen:status.accepted.home');

  const getAdditionalErrorContent = () => {
    if (!errorModal.matchingVcsResult) {
      return undefined;
    }

    const uniqueVcsByKey = new Map<string, VCMetadata>();
    if (Object.keys(errorModal.matchingVcsResult).length > 0) {
      const isDcql =
        (errorModal.matchingVcsResult as MatchingVCsResultForDcql)
          .credentialSetOptions !== undefined;
      if (isDcql) {
        const dcqlResult =
          errorModal.matchingVcsResult as MatchingVCsResultForDcql;
        for (const matchResult of Object.values(dcqlResult.matchingVCs)) {
          for (const dcqlMatch of matchResult.matchingVcs ?? []) {
            const {vcKey, metadata} = dcqlMatch.matchingVcInfo;
            uniqueVcsByKey.set(vcKey, metadata);
          }
        }
      } else {
        const peResult =
          errorModal.matchingVcsResult as MatchingVCsResultForPresentationExchangeRequest;
        for (const vcs of Object.values(peResult.matchingVCs)) {
          for (const {vcKey, metadata} of vcs) {
            uniqueVcsByKey.set(vcKey, metadata);
          }
        }
      }
    }

    const consolidatedMatchingVcs = Array.from(uniqueVcsByKey.values());
    const requestedClaims = Array.from(
      errorModal.matchingVcsResult?.requestedClaims ?? [],
    ) as string[];

    return (
      <Column>
        {requestedClaims.length > 0 && (
          <MissingClaimsView claims={requestedClaims} />
        )}
        <Text style={Theme.DcqlStyles.credentialMissingSectionLabel}>
          {t('errors.noMatchingCredentials.whatYouCanDo')}
        </Text>
        <View style={Theme.DcqlStyles.credentialMissingCard}>
          <VerifierInfo
            flat
            subLabel={t('errors.noMatchingCredentials.contactVerifier')}
            subLabelColor={Theme.Colors.Icon}
            name={verifierNameInTrustModal}
            logoUri={verifierLogoInTrustModal}
          />
          <View style={Theme.DcqlStyles.credentialMissingCardDivider} />
          <Text style={Theme.DcqlStyles.credentialMissingCardBodyText}>
            {t('errors.noMatchingCredentials.reachOutText')}
          </Text>
        </View>
        {consolidatedMatchingVcs.length > 0 && (
          <React.Fragment>
            <Text style={Theme.DcqlStyles.credentialMissingSectionLabel}>
              {t('errors.noMatchingCredentials.matchingCredentials')}
            </Text>
            <View style={Theme.DcqlStyles.credentialMissingCard}>
              {Array.from(uniqueVcsByKey.entries()).map(
                ([vcKey, vcMetadata]) => (
                  <VcItemContainer
                    key={vcKey}
                    vcMetadata={vcMetadata}
                    margin="0 2 8 2"
                    selectable={false}
                    selected={false}
                    onPress={() => undefined}
                    flow={VCItemContainerFlowType.VP_SHARE}
                    isPinned={vcMetadata.isPinned}
                  />
                ),
              )}
            </View>
          </React.Fragment>
        )}
      </Column>
    );
  };

  const additionalContent = getAdditionalErrorContent();

  return (
    <ErrorView
      isModal
      goBack={errorModal.showBackButton ? onGoBack : undefined}
      goBackButtonVisible={Boolean(errorModal.showBackButton)}
      onDismiss={errorModal.showBackButton ? onGoBack : undefined}
      alignActionsOnEnd
      showClose={false}
      isVisible={errorModal.show}
      title={errorModal.title}
      additionalContent={additionalContent}
      message={errorModal.message}
      additionalMessage={additionalMessage}
      image={SvgImage.PermissionDenied()}
      primaryButtonTestID={'retry'}
      primaryButtonText={primaryButtonText}
      primaryButtonEvent={onRetry}
      textButtonTestID={'home'}
      textButtonText={textButtonText}
      textButtonEvent={onGoHome}
      textButtonType={primaryButtonText ? 'clear' : 'gradient'}
      customImageStyles={{paddingBottom: 0, marginBottom: -6}}
      customStyles={additionalContent ? {} : {marginTop: '30%'}}
      exitAppWithTimer={isOVPViaDeepLink}
      testID={'vpShareError'}
    />
  );
};
