import React from 'react';
import {Column, Row, Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {VcItemContainer} from '../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {VCMetadata} from '../../shared/VCMetadata';
import {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {MatchingVCsResultForDcql} from '../../shared/openID4VP/openid4vp.types';
import {DcqlCredentialSetSection} from './DcqlCredentialSetSection';
import {useTranslation} from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';

interface MatchingVcListProps {
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
}

export const MatchingVcList: React.FC<MatchingVcListProps> = ({
                                                                controller,
                                                                onDisclosureChange,
                                                              }) => {
  const {t} = useTranslation('SendVPScreen');

  const getVcKey = (vcData: VC) => {
    return VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();
  };

  const noOfCardsSelected = controller.areAllVCsChecked
    ? Object.values(controller.vcsMatchingAuthRequest).length
    : Object.values(controller.credentialRequestIdToSelectedVcKeys).reduce(
      (vcCount, arr) => vcCount + arr.size,
      0,
    );

  const cardsSelectedText =
    noOfCardsSelected === 1
      ? noOfCardsSelected + ' ' + t('cardSelected')
      : noOfCardsSelected + ' ' + t('cardsSelected');

  const areAllVcsChecked =
    noOfCardsSelected ===
    Object.values(controller.vcsMatchingAuthRequest).flatMap(vc => vc).length;

  console.log('is dcql flow: ', controller.isDcqlFlow);

  if (controller.isDcqlFlow) {
    const dcqlResult = controller.matchingVcsResult as MatchingVCsResultForDcql;
    return (
      <Column scroll backgroundColor={Theme.Colors.whiteBackgroundColor}>
        {dcqlResult.credentialSetOptions.map((credentialSet, index) => (
          <DcqlCredentialSetSection
            key={index}
            credentialSet={credentialSet}
            matchingVCsResult={dcqlResult.matchingVCs}
            controller={controller}
            onDisclosureChange={onDisclosureChange}
          />
        ))}
      </Column>
    );
  }

  return (
    <>
      <LinearGradient colors={Theme.Colors.selectIDTextGradient}>
        <Column>
          <Text
            margin="15 0 13 24"
            color={Theme.Colors.textValue}
            style={Theme.VPSharingStyles.selectIDText}>
            {t('SendVcScreen:pleaseSelectAnId')}
          </Text>
        </Column>
      </LinearGradient>
      <Row
        padding="11 24 11 24"
        style={{
          backgroundColor: '#FAFAFA',
          justifyContent: 'space-between',
        }}>
        <Text style={Theme.VPSharingStyles.cardsSelectedText}>
          {cardsSelectedText}
        </Text>
        <Text
          style={{
            color: Theme.Colors.Icon,
            fontFamily: 'Montserrat_600SemiBold',
          }}
          onPress={
            areAllVcsChecked ? controller.UNCHECK_ALL : controller.CHECK_ALL
          }>
          {areAllVcsChecked ? t('unCheck') : t('checkAll')}
        </Text>
      </Row>
      <Column scroll backgroundColor={Theme.Colors.whiteBackgroundColor}>
        {Object.entries(controller.matchingVcsResult.matchingVCs).map(
          ([inputDescriptorId, vcs]: [string, any]) =>
            vcs.map((vcData: VC) => (
              <VcItemContainer
                key={`${getVcKey(vcData)}-${inputDescriptorId}`}
                vcMetadata={vcData.vcMetadata}
                margin="0 2 8 2"
                onPress={controller.SELECT_VC_ITEM(
                  getVcKey(vcData),
                  inputDescriptorId,
                )}
                selectable
                selected={
                  controller.areAllVCsChecked ||
                  (Object.keys(
                      controller.credentialRequestIdToSelectedVcKeys,
                    ).includes(inputDescriptorId) &&
                    controller.credentialRequestIdToSelectedVcKeys[
                      inputDescriptorId
                      ].has(getVcKey(vcData)))
                }
                selectionType={"multiple"}
                flow={VCItemContainerFlowType.VP_SHARE}
                isPinned={vcData.vcMetadata.isPinned}
                onDisclosuresChange={disclosures => {
                  onDisclosureChange(getVcKey(vcData), disclosures);
                }}
              />
            )),
        )}
      </Column>
    </>
  );
};
