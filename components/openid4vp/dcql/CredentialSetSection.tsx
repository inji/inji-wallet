import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Column, Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {VcItemContainer} from '../../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../../shared/Utils';
import {
  CredentialSetOption,
  MatchResult,
  VcWithMatchedClaims,
} from '../../../shared/openID4VP/openid4vp.types';
import {DcqlBadgeColors} from '../../ui/themes/DefaultTheme';
import {Badge} from '../../ui/badge/Badge';
import {Divider} from '../../ui/divider/Divider';

import {VC} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import {VCMetadata} from '../../../shared/VCMetadata';
import {Checkbox, CheckboxSelectionType} from '../../ui/checkbox/Checkbox';
import {Accordion} from '../../ui/accordion/Accordion';
import {VCFormat} from '../../../shared/VCFormat';
import {useTranslation} from 'react-i18next';
import testIDProps from '../../../shared/commonUtil';
import {claimPathPointersToJsonPath} from '../../../shared/openID4VP/OpenID4VPHelper';

interface DcqlCredentialSetSectionProps {
  credentialSet: CredentialSetOption;
  matchingVCsResult: Record<string, MatchResult>;
  satisfiableOptions: Array<Array<string>>;
  controller: any;
  mandatoryIndex?: number;
  testId: string;
  initialSelectedVcKeys: Record<number, Record<string, Set<string>>>;
}

export const CredentialSetSection: React.FC<DcqlCredentialSetSectionProps> = ({
  credentialSet,
  matchingVCsResult,
  satisfiableOptions,
  controller,
  mandatoryIndex,
  testId,
  initialSelectedVcKeys,
}) => {
  // Per-option selection tracking: { optionIndex -> { credentialQueryId -> Set<vcKey> } }
  // This is the source of truth for UI selection state. It ensures that when two options
  // share the same credential query ID (e.g. "gov"), selecting option 1's "gov" does not
  // visually mark option 2's "gov" as selected.
  const [
    selectedQueryIdToCredentialsByOption,
    setSelectedQueryIdToCredentialsByOption,
  ] = useState<Record<number, Record<string, Set<string>>>>({});

  useEffect(() => {
    setSelectedQueryIdToCredentialsByOption(initialSelectedVcKeys);
  }, []);

  const isRequired = credentialSet.required;
  const {t} = useTranslation('SendVPScreen');

  const isSingleMatchEdgeCase = (credentialQueryId: string): boolean => {
    return (
      isRequired &&
      satisfiableOptions.length === 1 &&
      satisfiableOptions[0].length === 1 &&
      (matchingVCsResult[credentialQueryId]?.matchingVcs?.length ?? 0) === 1
    );
  };

  const deselectItems = (queryIdToVcKeys: Record<string, Set<string>>) => {
    controller.DESELECT_VC_ITEMS(queryIdToVcKeys)();
  };

  const selectItems = (queryIdToVcKeys: Record<string, Set<string>>) => {
    controller.SELECT_VC_ITEMS(queryIdToVcKeys)();
  };

  const getVcKey = (vcData: VC): string =>
    VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();

  // An option is selected if for every credential query in that option, at least one of the matching VCs for that query is selected.
  const isOptionSelected = (option: string[], optionIndex: number): boolean => {
    return option.every(
      credentialQueryId =>
        (selectedQueryIdToCredentialsByOption[optionIndex]?.[credentialQueryId]
          ?.size ?? 0) > 0,
    );
  };

  const handleOptionToggle = (option: string[], optionIndex: number) => {
    if (isOptionSelected(option, optionIndex)) {
      console.log(
        'Option is already selected, deselecting option: ',
        optionIndex,
      );
      const {
        newSelectedQueryIdToCredentialsByOption,
        toBeDeselectedCredentialQueryIds,
      } = deselectOption(optionIndex);

      console.log(
        'To be updated into setSelectedQueryIdToCredentialsByOption ',
        newSelectedQueryIdToCredentialsByOption,
      );
      setSelectedQueryIdToCredentialsByOption(
        newSelectedQueryIdToCredentialsByOption,
      );
      deselectItems(toBeDeselectedCredentialQueryIds);
    } else {
      console.log(
        'Option is not already selected, selecting option: ',
        optionIndex,
      );
      deselectOtherOptions(optionIndex);

      const newState: Record<string, Set<string>> = {};
      // When selecting an option - some credential query IDs within this option may or may not be selected by user already
      // Case 1 -> the credential query within this option has been already selected -> keep the existing selection
      // Case 2 -> the credential query has not been selected already - add to the Vcs to select
      const currentOptionSelectedVcs =
        selectedQueryIdToCredentialsByOption[optionIndex];
      option.forEach(credentialQueryId => {
        let tempVcKeysToSelect: Set<string> = new Set<string>();
        if (currentOptionSelectedVcs?.[credentialQueryId]) {
          tempVcKeysToSelect = currentOptionSelectedVcs[credentialQueryId];
        } else {
          const firstVc =
            matchingVCsResult[credentialQueryId]?.matchingVcs?.[0];
          if (!firstVc) return;
          const vcKey = getVcKey(firstVc.vc);
          tempVcKeysToSelect = new Set<string>([vcKey]);
        }
        newState[credentialQueryId] = tempVcKeysToSelect;
      });
      console.log(
        'To be updated into setSelectedQueryIdToCredentialsByOption ',
        newState,
      );
      setSelectedQueryIdToCredentialsByOption({[optionIndex]: newState});
      selectItems(newState);
    }
  };

  const isMultipleCardsCombinedOption = (option: Array<string>) => {
    return option.length > 1;
  };

  const isVcSelected = (
    credentialQueryId: string,
    vcKey: string,
    optionIndex: number,
  ): boolean => {
    return (
      selectedQueryIdToCredentialsByOption[optionIndex]?.[
        credentialQueryId
      ]?.has(vcKey) ?? false
    );
  };

  const mergeQueryIdToVcKeys = (
    target: Record<string, Set<string>>,
    source: Record<string, Set<string>>,
  ) => {
    for (const [queryId, vcKeys] of Object.entries(source)) {
      target[queryId] ||= new Set<string>();
      for (const vcKey of vcKeys) {
        target[queryId].add(vcKey);
      }
    }
    return target;
  };

  const deselectOption = (
    optionIndex: number,
    currentSelection = selectedQueryIdToCredentialsByOption,
  ) => {
    const newSelectedQueryIdToCredentialsByOption = {
      ...currentSelection,
    };

    const toBeDeselectedCredentialQueryIds: Record<string, Set<string>> = {};

    const deselectionOptionEntry =
      newSelectedQueryIdToCredentialsByOption[optionIndex];
    delete newSelectedQueryIdToCredentialsByOption[optionIndex];

    // Trigger controller level deselect only if the deselectionOptionEntry are not available in any of the other options

    const activeVcKeysByQueryId: Record<string, Set<string>> = {};

    for (const queryMap of Object.values(
      newSelectedQueryIdToCredentialsByOption,
    )) {
      for (const [queryId, vcKeys] of Object.entries(queryMap)) {
        activeVcKeysByQueryId[queryId] ||= new Set();
        for (const vcKey of vcKeys) {
          activeVcKeysByQueryId[queryId].add(vcKey);
        }
      }
    }

    for (const [targetQueryId, targetVcKeys] of Object.entries(
      deselectionOptionEntry ?? {},
    )) {
      const deadVcKeysForThisQuery = new Set<string>();

      // Case 1 - existing selected options does not even have this credential query ID -> add to toBeDeselectedCredentialQueryIds
      if (!(targetQueryId in activeVcKeysByQueryId)) {
        toBeDeselectedCredentialQueryIds[targetQueryId] = new Set(targetVcKeys);
        continue;
      }

      // Case 2 - existing selection options has the query ID (matchingExistingQueryIds)
      const matchingExistingVcKeys = activeVcKeysByQueryId[targetQueryId];

      for (const vcKey of targetVcKeys) {
        const isVcStillSelectedElsewhere = matchingExistingVcKeys.has(vcKey);

        // Case 2.1 - deselectionOptionEntry are available in matchingExistingQueryIds -> don't add to toBeDeselectedCredentialQueryIds because the VC is still selected by other option
        // Case 2.2 - deselectionOptionEntry are not available in matchingExistingQueryIds -> add to toBeDeselectedCredentialQueryIds because the VC is no longer selected by any option
        if (!isVcStillSelectedElsewhere) {
          deadVcKeysForThisQuery.add(vcKey);
        }
      }

      if (deadVcKeysForThisQuery.size > 0) {
        toBeDeselectedCredentialQueryIds[targetQueryId] =
          deadVcKeysForThisQuery;
      }
    }

    return {
      newSelectedQueryIdToCredentialsByOption,
      toBeDeselectedCredentialQueryIds,
    };
  };

  function deselectOtherOptions(excludedOptionIndex: number) {
    let newState = {...selectedQueryIdToCredentialsByOption};
    let toBeDeselectedItems: Record<string, Set<string>> = {};

    for (
      let optionIndex = 0;
      optionIndex < satisfiableOptions.length;
      optionIndex++
    ) {
      if (optionIndex === excludedOptionIndex) continue;

      const {
        newSelectedQueryIdToCredentialsByOption,
        toBeDeselectedCredentialQueryIds,
      } = deselectOption(optionIndex, newState);

      newState = newSelectedQueryIdToCredentialsByOption;
      toBeDeselectedItems = mergeQueryIdToVcKeys(
        toBeDeselectedItems,
        toBeDeselectedCredentialQueryIds,
      );
    }

    deselectItems(toBeDeselectedItems);
    return newState;
  }

  const handleVCSelection = (
    vcKey: string,
    credentialQueryId: string,
    currentOptionIndex: number,
  ) => {
    const removeVcKeyFromCurrentSelection = () => {
      const newSelectedQueryIdToCredentialsByOption = {
        ...prevSelectedQueryIdToCredentialsByOption,
      };
      prevSelectedQueryIdToCredentialsByOption[currentOptionIndex]?.[
        credentialQueryId
      ]?.delete(vcKey);
      if (
        prevSelectedQueryIdToCredentialsByOption[currentOptionIndex]?.[
          credentialQueryId
        ]?.size === 0
      ) {
        delete prevSelectedQueryIdToCredentialsByOption[currentOptionIndex][
          credentialQueryId
        ];
      }
      if (
        prevSelectedQueryIdToCredentialsByOption[currentOptionIndex] &&
        Object.keys(
          prevSelectedQueryIdToCredentialsByOption[currentOptionIndex],
        ).length === 0
      ) {
        delete prevSelectedQueryIdToCredentialsByOption[currentOptionIndex];
      }
      return newSelectedQueryIdToCredentialsByOption;
    };

    const appendVcKeyToCurrentSelection = () => {
      return {
        ...prevSelectedQueryIdToCredentialsByOption,
        [currentOptionIndex]: {
          ...prevSelectedQueryIdToCredentialsByOption[currentOptionIndex],
          [credentialQueryId]: new Set([
            ...(prevSelectedQueryIdToCredentialsByOption[currentOptionIndex]?.[
              credentialQueryId
            ] ?? []),
            vcKey,
          ]),
        },
      };
    };

    const prevSelectedQueryIdToCredentialsByOption =
      selectedQueryIdToCredentialsByOption;

    if (isVcSelected(credentialQueryId, vcKey, currentOptionIndex)) {
      const newSelectedQueryIdToCredentialsByOption =
        removeVcKeyFromCurrentSelection();
      setSelectedQueryIdToCredentialsByOption(
        newSelectedQueryIdToCredentialsByOption,
      );

      const anyOtherOptionHoldsCurrentCredentialQueryIdAndVcKey =
        Object.entries(newSelectedQueryIdToCredentialsByOption).some(
          ([optionIndex, selectedQueryIdToVcKeys]) =>
            Number(optionIndex) !== currentOptionIndex &&
            (selectedQueryIdToVcKeys[credentialQueryId]?.has(vcKey) ?? false),
        );

      if (!anyOtherOptionHoldsCurrentCredentialQueryIdAndVcKey) {
        deselectItems({[credentialQueryId]: new Set<string>([vcKey])});
      }
    } else {
      const allowsMultiple =
        matchingVCsResult[credentialQueryId]?.allowMultipleCredentials;

      console.debug('current option index ', currentOptionIndex);
      const toBeUpdated = deselectOtherOptions(currentOptionIndex);
      let newState: Record<number, Record<string, Set<string>>>;

      console.debug(
        'allow multiple related credential query = ',
        allowsMultiple,
      );

      if (allowsMultiple) {
        // If allowing multiple, just add this vc to the current selection without deselecting other VCs for this query
        newState = appendVcKeyToCurrentSelection();
      } else {
        newState = {
          [currentOptionIndex]: {
            ...prevSelectedQueryIdToCredentialsByOption[currentOptionIndex],
            [credentialQueryId]: new Set<string>([vcKey]),
          },
        };
      }

      setSelectedQueryIdToCredentialsByOption({...toBeUpdated, ...newState});
      console.debug('new state after selection: ', newState);
      console.debug(
        'to be updated state after deselecting other options: ',
        toBeUpdated,
      );

      selectItems({[credentialQueryId]: new Set<string>([vcKey])});
    }
  };

  function getSelectivelyDisclosableMatchedClaimPaths(
    matchingCredentialDataResult: VcWithMatchedClaims,
  ): Set<string> | undefined {
    const vcFormat = matchingCredentialDataResult.vc.vcMetadata.format;
    if (vcFormat == VCFormat.dc_sd_jwt || vcFormat == VCFormat.vc_sd_jwt) {
      const jsonPaths = matchingCredentialDataResult.matchedClaims?.map(claim =>
        claimPathPointersToJsonPath(claim.path),
      );
      return new Set(jsonPaths);
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

    return (
      <VcItemContainer
        sdClaimsPath={getSelectivelyDisclosableMatchedClaimPaths(
          matchingCredentialData,
        )}
        minimalDisclosure
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
    const canSelectMultiple =
      (matchResult.matchingVcs?.length ?? 0) > 1 &&
      matchResult.allowMultipleCredentials;

    const selectionType = canSelectMultiple
      ? CheckboxSelectionType.MULTIPLE
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
        {matchResult.matchingVcs?.map(
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
              {isMultipleCardsCombinedOption(option) ? (
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
                      onPress={() => handleOptionToggle(option, optionIndex)}
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
                      (credentialQueryId: string, vcKey: string) =>
                        isVcSelected(credentialQueryId, vcKey, optionIndex),
                    );
                  })}
                </Accordion>
              ) : (
                // Case 2: the option has only one credential query - Only one credential query needs to be selected
                renderCredentialsMatchingQueryId(
                  option[0],
                  optionIndex,
                  (vcKey: string) =>
                    handleVCSelection(vcKey, option[0], optionIndex),
                  (credentialQueryId: string, vcKey: string) =>
                    isVcSelected(credentialQueryId, vcKey, optionIndex),
                )
              )}
            </View>
          );
        })}
      </Column>
    </Accordion>
  );
};
