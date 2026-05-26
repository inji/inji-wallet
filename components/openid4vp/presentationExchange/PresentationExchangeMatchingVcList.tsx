import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';
import {Column, Row, Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {VcItemContainer} from '../../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../../shared/Utils';
import {getVcKey} from '../../../shared/VCMetadata';
import {VC} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import {CheckboxSelectionType} from '../../ui/checkbox/Checkbox';

type PresentationExchangeMatchingVcListProps = {
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
};

export const PresentationExchangeMatchingVcList: React.FC<
  PresentationExchangeMatchingVcListProps
> = ({controller, onDisclosureChange}) => {
  const {t} = useTranslation('SendVPScreen');

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
        testID="matching-vc-list-header-row"
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
      <Column
        testID="matching-vc-list-vc-items"
        scroll
        backgroundColor={Theme.Colors.whiteBackgroundColor}>
        {Object.entries(controller.matchingVcsResult.matchingVCs).map(
          ([inputDescriptorId, vcs]: [string, any]) =>
            vcs.map((vcData: VC) => (
              <VcItemContainer
                key={`${getVcKey(vcData)}-${inputDescriptorId}`}
                testId={`matching-vc-list-vc-${getVcKey(
                  vcData,
                )}-${inputDescriptorId}`}
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
                selectionType={CheckboxSelectionType.MULTIPLE}
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

