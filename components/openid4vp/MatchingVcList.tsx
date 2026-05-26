import React, {useEffect} from 'react';
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
import {LoaderAnimation} from '../ui/LoaderAnimation';

interface MatchingVcListProps {
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
}

export const MatchingVcList: React.FC<MatchingVcListProps> = ({
  controller,
  onDisclosureChange,
}) => {
  const {t} = useTranslation('SendVPScreen');

  useEffect(() => {
    if (!controller.isDcqlFlow || !controller.matchingVcsResult) return;
    const dcqlResult = controller.matchingVcsResult as MatchingVCsResultForDcql;
    const toSelect: Record<string, Set<string>> = {};
    dcqlResult.credentialSetOptions.forEach(credentialSet => {
      if (!credentialSet.required) return;
      const satisfiableOption = credentialSet.options.find(option =>
        option.every((qId: string) => {
          const mr = dcqlResult.matchingVCs[qId];
          return mr && mr.matchingVcs.length > 0;
        }),
      );
      if (!satisfiableOption) return;
      satisfiableOption.forEach((credentialQueryId: string) => {
        const matchResult = dcqlResult.matchingVCs[credentialQueryId];
        if (!matchResult || matchResult.matchingVcs.length === 0) return;
        const vcKey = getVcKey(matchResult.matchingVcs[0].vc);
        (toSelect[credentialQueryId] ??= new Set<string>()).add(vcKey);
      });
    });
    if (Object.keys(toSelect).length > 0) {
      controller.SELECT_VC_ITEMS(toSelect)();
    }
  }, []);

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
    if (!controller.matchingVcsResult) {
      return <LoaderAnimation testID={'matching-vc-list-dcql-loader'} />;
    }

    const totalMandatoryCount = dcqlResult.credentialSetOptions.filter(
      cs => cs.required,
    ).length;
    let mandatoryCount = 0;

    return (
      <Column
        testID="matching-vc-list"
        scroll
        backgroundColor={Theme.Colors.whiteBackgroundColor}>
        {dcqlResult.credentialSetOptions.map((credentialSet, index) => {
          const mandatoryIndex =
            credentialSet.required && totalMandatoryCount > 1
              ? ++mandatoryCount
              : undefined;

          const isMatchingVcsEmpty = credentialSet.options.every(
            (option: string[]) => {
              return option.every((credentialQueryId: string) => {
                const matchResult = dcqlResult.matchingVCs[credentialQueryId];
                return !matchResult || matchResult.matchingVcs.length === 0;
              });
            },
          );

          // If a credential set query is not satisfiable - ignore that credential set query
          if (isMatchingVcsEmpty) {
            return null;
          }

          return (
            <DcqlCredentialSetSection
              key={index}
              testId={`matching-vc-list-dcql-section-${index}`}
              credentialSet={credentialSet}
              mandatoryIndex={mandatoryIndex}
              matchingVCsResult={dcqlResult.matchingVCs}
              controller={controller}
              onDisclosureChange={onDisclosureChange}
            />
          );
        })}
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
                selectionType={'multiple'}
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
