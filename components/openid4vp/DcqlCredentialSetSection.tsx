import React from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Column, Row, Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {VcItemContainer} from '../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {
  CredentialSetOption,
  MatchResult,
  VcWithMatchedClaims,
} from '../../shared/openID4VP/openid4vp.types';
import {DcqlBadgeColors} from '../ui/themes/DefaultTheme';
import {Badge} from './Badge';
import {Divider} from '../ui/divider/Divider';
import {hasAtLeastOneMatch} from '../../shared/commonUtil';
import {VC} from '../../machines/VerifiableCredential/VCMetaMachine/vc';
import {VCMetadata} from '../../shared/VCMetadata';
import {Checkbox} from '../ui/checkbox/Checkbox';
import {Accordion} from '../ui/accordion/Accordion';
import {VCFormat} from '../../shared/VCFormat';

interface DcqlCredentialSetSectionProps {
  credentialSet: CredentialSetOption;
  matchingVCsResult: Record<string, MatchResult>;
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
  mandatoryIndex?: number;
}

export const DcqlCredentialSetSection: React.FC<
  DcqlCredentialSetSectionProps
> = ({credentialSet, matchingVCsResult, controller, onDisclosureChange, mandatoryIndex}) => {

  const isRequired = credentialSet.required;

  const getVcKey = (vcData: VC): string =>
    VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();

  function deselectOtherOptions(excludedOptionIndex: number) {
    for (let i = 0; i < credentialSet.options.length; i++) {
      if (i === excludedOptionIndex) continue;
      const option = credentialSet.options[i];
      option.forEach(credentialQueryId => {
        controller.DESELECT_VC_ITEMS({
          [credentialQueryId]:
            controller.credentialRequestIdToSelectedVcKeys[credentialQueryId],
        })();
      });
    }
  }

  const isOptionSelected = (option: string[], optionIndex: number): boolean => {
    // An option is selected if for every credential query in that option, at least one of the matching VCs for that query is selected.
    return option.every(credentialQueryId => {
      const matchResult = matchingVCsResult[credentialQueryId];
      if (!matchResult || matchResult.matchingVcs.length === 0) return false;

      const matchingVcKeys: Set<string> = new Set<string>(
        matchResult.matchingVcs.map((vcWithClaims: VcWithMatchedClaims) =>
          getVcKey(vcWithClaims.vc),
        ),
      );
      const selectedCredentialVcKeys: Set<string> =
        controller.credentialRequestIdToSelectedVcKeys[credentialQueryId];

      return hasAtLeastOneMatch(matchingVcKeys, selectedCredentialVcKeys);
    });
  };

  // If an option is selected on whole - all credentials part of it are selected
  const selectAllInOption = (option: string[], optionIndex: number) => {
    const selectedCredentialRequestIdToVCKeys: Record<string, Set<string>> = {};
    option.forEach(credentialQueryId => {
      const matchResult = matchingVCsResult[credentialQueryId];
      if (!matchResult || matchResult.matchingVcs.length === 0) return;

      // Case - 1: There is only one VC matching the credential query - select that VC
      // Case - 2: There are multiple VCs matching the credential query - select the first VC
      const vcData = matchResult.matchingVcs[0].vc;
      const vcKey = getVcKey(vcData);
      (selectedCredentialRequestIdToVCKeys[credentialQueryId] ??=
        new Set<string>()).add(vcKey);
    });

    if (isOptionSelected(option, optionIndex)) {
      controller.DESELECT_VC_ITEMS(selectedCredentialRequestIdToVCKeys)();
    } else {
      deselectOtherOptions(optionIndex);
      controller.SELECT_VC_ITEMS(selectedCredentialRequestIdToVCKeys)();
    }
  };

  const isMultipleCombinedOption = (option: Array<string>) => {
    return option.length > 1;
  };
  const isVcSelected = (credentialQueryId: string, vcKey: string) => {
    console.log(
      'Checking if VC is selected for credentialQueryId:',
      credentialQueryId,
      'and vcKey:',
      vcKey,
    );
    console.log(
      'Checking if VC is selected for credentialQueryId:',
      controller.credentialRequestIdToSelectedVcKeys[credentialQueryId],
    );
    const matchingVCsResult =
      controller.credentialRequestIdToSelectedVcKeys[credentialQueryId];
    return matchingVCsResult ? matchingVCsResult.has(vcKey) : false;
  };

  const handleVCSelection = (
    vcKey: string,
    credentialQueryId: string,
    currentOptionIndex: number,
  ) => {
    deselectOtherOptions(currentOptionIndex);

    const currentSelectedKeys =
      controller.credentialRequestIdToSelectedVcKeys[credentialQueryId];
    if (currentSelectedKeys?.has(vcKey)) {
      controller.DESELECT_VC_ITEM(vcKey, credentialQueryId)();
      return;
    }

    const allowsMultipleSelection =
      matchingVCsResult[credentialQueryId].allowMultipleCredentials;
    if (allowsMultipleSelection) {
      controller.SELECT_VC_ITEM(vcKey, credentialQueryId)();
    } else {
      const selectedVcKeysForQuery: Set<string> =
        currentSelectedKeys ?? new Set<string>();
      controller.DESELECT_VC_ITEMS({
        [credentialQueryId]: selectedVcKeysForQuery,
      })();
      controller.SELECT_VC_ITEM(vcKey, credentialQueryId)();
    }
  };

  const handleOptionSelection = (
    vcKey: string,
    credentialQueryId: string,
    selectedOptionIndex: number,
  ) => {
    console.log('Selected option index:', selectedOptionIndex);

    handleVCSelection(vcKey, credentialQueryId, selectedOptionIndex);

    console.log(
      'After update ',
      controller.credentialRequestIdToSelectedVcKeys,
    );
  };

  function getSelectivelyDisclosableMatchedClaimPaths(
    matchingCredentialDataResult: VcWithMatchedClaims,
  ): string[] | undefined {
    const vcFormat = matchingCredentialDataResult.vc.vcMetadata.format;
    if (vcFormat == VCFormat.dc_sd_jwt || vcFormat == VCFormat.vc_sd_jwt) {
      return matchingCredentialDataResult.matchedClaims
        ?.map(claim => {
          return claim.path.join('.');
        })
        .flat();
    }
    return undefined;
  }

  // For a given credential query, render the matching VCs as selectable items.

  const renderCredentialsMatchingQueryId = (
    credentialQueryId: string,
    handleVcSelection: (vcKey: string) => void,
    isVcSelected: (credentialQueryId: string, vcKey: string) => boolean,
  ) => {
    const matchResult = matchingVCsResult[credentialQueryId];
    if (!matchResult || matchResult.matchingVcs.length === 0) return null;
    const selectionType =
      matchResult.matchingVcs.length > 1
        ? matchResult.allowMultipleCredentials
          ? 'multiple'
          : 'single'
        : 'single';

    //.   Case 1: Only one VC matches the credential query
    //          - directly render that VC as a selected item if the option is selected
    if (matchResult.matchingVcs.length === 1) {
      const matchingCredentialData = matchResult.matchingVcs[0];
      const vcData = matchingCredentialData.vc;
      const vcKey = getVcKey(vcData);

      return (
        <VcItemContainer
          sdClaimsPath={getSelectivelyDisclosableMatchedClaimPaths(
            matchingCredentialData,
          )}
          key={`${vcKey}-${credentialQueryId}`}
          vcMetadata={vcData.vcMetadata}
          margin="0 2 8 2"
          onPress={() => handleVcSelection(vcKey)}
          selectable
          selectionType={selectionType}
          selected={isVcSelected(credentialQueryId, vcKey)}
          flow={VCItemContainerFlowType.VP_SHARE}
          isPinned={vcData.vcMetadata.isPinned}
          onDisclosuresChange={disclosures => {
            onDisclosureChange(vcKey, disclosures);
          }}
        />
      );
    }

    //.   Case 2: Multiple VCs match the credential query and verifier allows multiple credentials
    //          - render the matching VCs inside an accordion and allow user to select one or more VCs based on the verifier's preference
    //.   Case 3: Multiple VCs match the credential query but verifier does not allow multiple credentials
    //          - render the matching VCs inside an accordion and allow user to select only one VC based on the verifier's preference
    return (
      <Accordion title={'Multiple Cards Matching Query'} defaultExpanded>
        {matchResult.matchingVcs.map(
          (matchingCredentialData: VcWithMatchedClaims, index: number) => {
            const vcData = matchingCredentialData.vc;
            const vcKey = getVcKey(vcData);

            return (
              <VcItemContainer
                sdClaimsPath={getSelectivelyDisclosableMatchedClaimPaths(
                  matchingCredentialData,
                )}
                key={`${vcKey}-${credentialQueryId}`}
                vcMetadata={vcData.vcMetadata}
                margin="0 2 8 2"
                onPress={() => handleVcSelection(vcKey)}
                selectable
                selectionType={selectionType}
                selected={isVcSelected(credentialQueryId, vcKey)}
                flow={VCItemContainerFlowType.VP_SHARE}
                isPinned={vcData.vcMetadata.isPinned}
                onDisclosuresChange={disclosures => {
                  onDisclosureChange(vcKey, disclosures);
                }}
              />
            );
          },
        )}
      </Accordion>
    );
  };
  const isSectionSatisfied = credentialSet.options.some((option, optionIndex) =>
    isOptionSelected(option, optionIndex),
  );

  return (
    <Accordion
      containerStyle={Theme.DcqlStyles.sectionContainer}
      title={
        <>
          <Text style={Theme.DcqlStyles.sectionTitle}>
            {isRequired
              ? `MANDATORY CARDS${mandatoryIndex !== undefined ? ` ${mandatoryIndex}` : ''}`
              : 'OPTIONAL CARDS'}
          </Text>
          {isSectionSatisfied && (
            <Icon
              name="check-circle"
              color={Theme.Colors.Icon}
              size={16}
              containerStyle={Theme.DcqlStyles.sectionSatisfiedIcon}
            />
          )}
        </>
      }
      headerAction={
        <Badge
          addInfoIcon
          text={isRequired ? 'REQUIRED' : 'NOT REQUIRED'}
          borderColor={
            isRequired
              ? DcqlBadgeColors.requiredBorder
              : DcqlBadgeColors.optionalBorder
          }
          bgColor={
            isRequired
              ? DcqlBadgeColors.requiredBg
              : DcqlBadgeColors.optionalBg
          }
          textColor={isRequired
            ? DcqlBadgeColors.requiredText
            : DcqlBadgeColors.optionalText
          }
        />
      }
      defaultExpanded={credentialSet.required}>
      <Column>
        {credentialSet.options.map((option, optionIndex) => (
          <View key={optionIndex}>
            {optionIndex > 0 && <Divider text={'OR'} />}
            {isMultipleCombinedOption(option) ? (
              // Case 1: the option has multiple credential queries - Combination of credential queries need to be selected together
              <Accordion
                title="Multiple Cards"
                badge={
                  <Badge
                    textColor='#000'
                    text={'ALL REQUIRED'}
                    bgColor={'#F1F5F9'}
                  />
                }
                stackBadge
                headerActionLeft={
                  <Checkbox
                    selectionType="single"
                    checked={isOptionSelected(option, optionIndex)}
                    onPress={() => selectAllInOption(option, optionIndex)}
                  />
                }>
                {option.map(credentialQueryId => {
                  return renderCredentialsMatchingQueryId(
                    credentialQueryId,
                    (vcKey: string) =>
                      handleVCSelection(
                        vcKey,
                        credentialQueryId,
                        optionIndex,
                      ),
                    isVcSelected,
                  );
                })}
              </Accordion>
            ) : (
              // Case 2: the option has only one credential query - Only one credential query needs to be selected
              renderCredentialsMatchingQueryId(
                option[0],
                (vcKey: string) =>
                  handleOptionSelection(vcKey, option[0], optionIndex),
                isVcSelected,
              )
            )}
          </View>
        ))}
      </Column>
    </Accordion>
  );
};
