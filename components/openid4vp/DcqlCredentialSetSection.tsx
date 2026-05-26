import React from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Column, Text} from '../ui';
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
import {Checkbox, CheckboxSelectionType} from '../ui/checkbox/Checkbox';
import {Accordion} from '../ui/accordion/Accordion';
import {VCFormat} from '../../shared/VCFormat';
import {useTranslation} from 'react-i18next';
import testIDProps from '../../shared/commonUtil';
import {claimPathPointersToJsonPath} from '../../shared/openID4VP/OpenID4VPHelper';

interface DcqlCredentialSetSectionProps {
  credentialSet: CredentialSetOption;
  matchingVCsResult: Record<string, MatchResult>;
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
  mandatoryIndex?: number;
  testId: string;
}

export const DcqlCredentialSetSection: React.FC<
  DcqlCredentialSetSectionProps
> = ({
  credentialSet,
  matchingVCsResult,
  controller,
  onDisclosureChange,
  mandatoryIndex,
  testId,
}) => {
  // TODO: Maintain an options selected credential query Id to credential mapping
  /**
   * Scenario
   *  - Credential set query ID : options -> option 1 ->> gov - Govt ID + pan - PAN / option 2 ->> gov - Govt ID + dl - DL (Govt ID , PAN and DL are credentials & giv, pan and dl are credential query IDs)
   *  - User selects option 1 - Govt ID + PAN
   *  - When user selected Option 1, Option 2's Govt ID which is common should not be shown as selected in UI but the mapping of selected credentials should hold the gov - Govt ID
   *  - This is an important nuance to take care of
   */
  // const [selectedQueryIdToCredentialsByOption, setSelectedQueryIdToCredentialsByOption] = useState<Record<string, Record<string, Set<string>>>>()
  const isRequired = credentialSet.required;
  const {t} = useTranslation('SendVPScreen');

  const satisfiableOptions = credentialSet.options.filter(option =>
    option.every(queryId => {
      const matchingResult = matchingVCsResult[queryId];
      return (
        matchingResult &&
        matchingResult.matchingVcs &&
        matchingResult.matchingVcs.length > 0
      );
    }),
  );

  const isSingleMatchEdgeCase = (credentialQueryId: string): boolean => {
    return (
      isRequired &&
      satisfiableOptions.length === 1 &&
      satisfiableOptions[0].length === 1 &&
      (matchingVCsResult[credentialQueryId]?.matchingVcs?.length ?? 0) === 1
    );
  };

  const getVcKey = (vcData: VC): string =>
    VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();

  function deselectOtherOptions(excludedOptionIndex: number) {
    for (let i = 0; i < satisfiableOptions.length; i++) {
      if (i === excludedOptionIndex) continue;
      const option = satisfiableOptions[i];
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
      if (
        !matchResult ||
        !matchResult.matchingVcs ||
        matchResult.matchingVcs.length === 0
      )
        return false;

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
      if (
        !matchResult ||
        !matchResult.matchingVcs ||
        matchResult.matchingVcs.length === 0
      )
        return;

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
      matchingVCsResult[credentialQueryId]?.allowMultipleCredentials;
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
          return claimPathPointersToJsonPath(claim.path);
        })
        .flat();
    }
    return undefined;
  }

  // For a given credential query, render the matching VCs as selectable items.

  const renderCardView = (
    matchingCredentialData: VcWithMatchedClaims,
    credentialQueryId: string,
    handleVcSelection: (vcKey: string) => void,
    selectionType: CheckboxSelectionType,
    isVcSelected: (credentialQueryId: string, vcKey: string) => boolean,
    optionIndex: number,
    disableSelection = false,
  ) => {
    const vcData = matchingCredentialData.vc;
    const vcKey = getVcKey(vcData);
    console.log(
      'Passing disableSelection as ',
      disableSelection,
      'for the VC key ',
      vcKey,
    );

    return (
      <VcItemContainer
        sdClaimsPath={getSelectivelyDisclosableMatchedClaimPaths(
          matchingCredentialData,
        )}
        key={`${vcKey}-option-${optionIndex}-query-${credentialQueryId}`}
        vcMetadata={vcData.vcMetadata}
        margin="0 2 8 2"
        onPress={() => handleVcSelection(vcKey)}
        selectable
        disableSelection={disableSelection}
        selectionType={selectionType}
        selected={isVcSelected(credentialQueryId, vcKey)}
        flow={VCItemContainerFlowType.VP_SHARE}
        isPinned={vcData.vcMetadata.isPinned}
        testId={`${testId}-option-${optionIndex}-query-${credentialQueryId}-vc-${vcKey}`}
        onDisclosuresChange={disclosures => {
          onDisclosureChange(vcKey, disclosures);
        }}
      />
    );
  };
  const renderCredentialsMatchingQueryId = (
    credentialQueryId: string,
    optionIndex: number,
    handleVcSelection: (vcKey: string) => void,
    isVcSelected: (credentialQueryId: string, vcKey: string) => boolean,
  ) => {
    const matchResult = matchingVCsResult[credentialQueryId];
    if (!matchResult || matchResult.matchingVcs?.length === 0) return null;
    const selectionType =
      matchResult.matchingVcs.length > 1
        ? matchResult.allowMultipleCredentials
          ? CheckboxSelectionType.MULTIPLE
          : CheckboxSelectionType.SINGLE
        : CheckboxSelectionType.SINGLE;

    //.   Case 1: Only one VC matches the credential query
    //          - directly render that VC as a selected item if the option is selected
    if (matchResult.matchingVcs?.length === 1) {
      const matchingCredentialData = matchResult.matchingVcs[0];
      return renderCardView(
        matchingCredentialData,
        credentialQueryId,
        handleVcSelection,
        selectionType,
        isVcSelected,
        optionIndex,
        isSingleMatchEdgeCase(credentialQueryId),
      );
    }

    //.   Case 2: Multiple VCs match the credential query and verifier allows multiple credentials
    //          - render the matching VCs inside an accordion and allow user to select one or more VCs based on the verifier's preference
    //.   Case 3: Multiple VCs match the credential query but verifier does not allow multiple credentials
    //          - render the matching VCs inside an accordion and allow user to select only one VC based on the verifier's preference
    return (
      <Accordion
        testId={`${testId}-option-${optionIndex}-query-${credentialQueryId}-multi-vc`}
        title={t('dcqlSection.multipleCardsMatchingQuery')}
        defaultExpanded>
        {matchResult.matchingVcs.map(
          (matchingCredentialData: VcWithMatchedClaims) => {
            return renderCardView(
              matchingCredentialData,
              credentialQueryId,
              handleVcSelection,
              selectionType,
              isVcSelected,
              optionIndex,
            );
          },
        )}
      </Accordion>
    );
  };
  const isSectionSatisfied = satisfiableOptions.some((option, optionIndex) =>
    isOptionSelected(option, optionIndex),
  );

  return (
    <Accordion
      testId={testId}
      containerStyle={Theme.DcqlStyles.sectionContainer}
      title={
        <>
          <Text style={Theme.DcqlStyles.sectionTitle}>
            {isRequired
              ? t('dcqlSection.mandatoryCards', {
                  index:
                    mandatoryIndex !== undefined ? ` ${mandatoryIndex}` : '',
                })
              : t('dcqlSection.optionalCards')}
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
          testId={`${testId}-required-badge`}
          text={
            isRequired
              ? t('dcqlSection.required')
              : t('dcqlSection.notRequired')
          }
          borderColor={
            isRequired
              ? DcqlBadgeColors.requiredBorder
              : DcqlBadgeColors.optionalBorder
          }
          bgColor={
            isRequired ? DcqlBadgeColors.requiredBg : DcqlBadgeColors.optionalBg
          }
          textColor={
            isRequired
              ? DcqlBadgeColors.requiredText
              : DcqlBadgeColors.optionalText
          }
        />
      }
      defaultExpanded={credentialSet.required}>
      <Column>
        {satisfiableOptions.map((option, optionIndex) => {
          // If an option is not satisfiable - don't show the option
          const isOptionSatisfied = option.every(
            (credentialQueryId: string) => {
              const matchResult = matchingVCsResult[credentialQueryId];
              return matchResult && matchResult.matchingVcs.length !== 0;
            },
          );
          if (!isOptionSatisfied) {
            return null;
          }

          return (
            <View
              key={optionIndex}
              {...testIDProps(`${testId}-option-${optionIndex}`)}>
              {optionIndex > 0 && (
                <Divider
                  testId={`${testId}-option-${optionIndex}-divider`}
                  text={'OR'}
                />
              )}
              {isMultipleCombinedOption(option) ? (
                // Case 1: the option has multiple credential queries - Combination of credential queries need to be selected together
                <Accordion
                  testId={`${testId}-option-${optionIndex}-combined`}
                  title={t('dcqlSection.multipleCards')}
                  badge={
                    <Badge
                      testId={`${testId}-option-${optionIndex}-all-required-badge`}
                      textColor="#000"
                      text={t('dcqlSection.allRequired')}
                      bgColor={'#F1F5F9'}
                    />
                  }
                  stackBadge
                  headerActionLeft={
                    <Checkbox
                      testId={`${testId}-option-${optionIndex}-select-all`}
                      selectionType={CheckboxSelectionType.SINGLE}
                      checked={isOptionSelected(option, optionIndex)}
                      onPress={() => selectAllInOption(option, optionIndex)}
                    />
                  }>
                  {option.map(credentialQueryId => {
                    return renderCredentialsMatchingQueryId(
                      credentialQueryId,
                      optionIndex,
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
                  optionIndex,
                  (vcKey: string) =>
                    handleOptionSelection(vcKey, option[0], optionIndex),
                  isVcSelected,
                )
              )}
            </View>
          );
        })}
      </Column>
    </Accordion>
  );
};
