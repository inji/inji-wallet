import React, {Fragment, useEffect, useState} from 'react';
import {View} from 'react-native';
import {Column} from '../../../ui';
import {Theme} from '../../../ui/styleUtils';
import {VcItemContainer} from '../../../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../../../shared/Utils';
import {CredentialSetOption, MatchResult, VcWithMatchedClaims,} from '../../../../shared/openID4VP/openid4vp.types';
import {Divider} from '../../../ui/divider/Divider';
import {CheckboxSelectionType} from '../../../ui/checkbox/Checkbox';
import {VCFormat} from '../../../../shared/VCFormat';
import {useTranslation} from 'react-i18next';
import testIDProps from '../../../../shared/commonUtil';
import {claimPathPointersToJsonPath} from '../../../../shared/openID4VP/OpenID4VPHelper';
import {ExpandableListSheetView} from "../../../ui/expandableList/ExpandableListSheetView";
import {InfoBox} from "../../../ui/InfoBox";
import {styles} from "./Styles";
import MultipleCardsSection from "./MultipleCardsSection";
import SectionHeader from "./SectionHeader";

export type OptionSelectionState = Record<number, Record<string, Set<string>>>;

export type SectionSelectionState = {
  selection: OptionSelectionState;
  required: boolean;
};

interface DcqlCredentialSetSectionProps {
  credentialSet: CredentialSetOption;
  matchingVCsResult: Record<string, MatchResult>;
  satisfiableOptions: Array<Array<string>>;
  selectVcs: (queryIdToVcKeys: Record<string, Set<string>>) => void;
  deselectVcs: (queryIdToVcKeys: Record<string, Set<string>>) => void;
  selectedVcKeys: Set<string>;
  testId: string;
  stepLabel?: string;
  initialSelectionState?: SectionSelectionState;
  onSelectionChange: (newState: OptionSelectionState) => void;
}

export const CredentialSetSection: React.FC<DcqlCredentialSetSectionProps> = ({
                                                                                credentialSet,
                                                                                matchingVCsResult,
                                                                                satisfiableOptions,
                                                                                selectedVcKeys,
                                                                                selectVcs,
                                                                                deselectVcs,
                                                                                testId,
                                                                                stepLabel,
                                                                                initialSelectionState,
                                                                                onSelectionChange,
                                                                              }) => {
  // Per-option selection tracking: { optionIndex -> { credentialQueryId -> Set<vcKey> } }
  // This is the source of truth for UI selection state. It ensures that when two options
  // share the same credential query ID (e.g. "gov"), selecting option 1's "gov" does not
  // visually mark option 2's "gov" as selected.
  const [
    selectedQueryIdToCredentialsByOption,
    setSelectedQueryIdToCredentialsByOption,
  ] = useState<OptionSelectionState>(initialSelectionState?.selection ?? {});

  // Input: next per-option selection map.
  // Output: updates local state and propagates the same selection map to parent via callback.
  const updateSelectionState = (newState: OptionSelectionState) => {
    setSelectedQueryIdToCredentialsByOption(newState);
    onSelectionChange(newState);
  };

  const getPriorityVcKey = (optionIndex: number, credentialQueryId: string) => {
    const vcKeys = selectedQueryIdToCredentialsByOption[optionIndex]?.[
      credentialQueryId
    ];

    if (!vcKeys || vcKeys.size === 0) {
      return undefined;
    }

    return vcKeys.values().next().value as string | undefined;
  };

  const getPreselectedOptionState = (currentlySelectedVcKeys: Set<string>) => {
    let preferredOptionIndex = 0;
    let preferredSelection: Record<string, Set<string>> = {};
    let highestMatchedSelectedQueryCount = -1;

    satisfiableOptions.forEach((option, optionIndex) => {
      const selectionForOption: Record<string, Set<string>> = {};
      let matchedSelectedQueryCount = 0;

      option.forEach((credentialQueryId: string) => {
        const matchResult = matchingVCsResult[credentialQueryId];

        if (!matchResult?.matchingVcs?.length) {
          return;
        }

        const matchingSelectedVcKeys = matchResult.matchingVcs
          .map(matchingCredentialData => (matchingCredentialData.matchingVcInfo).vcKey)
          .filter(vcKey => currentlySelectedVcKeys.has(vcKey));

        const vcKeysToPreselect =
          matchingSelectedVcKeys.length > 0
            ? matchingSelectedVcKeys
            : [(matchResult.matchingVcs[0].matchingVcInfo).vcKey];

        if (matchingSelectedVcKeys.length > 0) {
          matchedSelectedQueryCount++;
        }

        selectionForOption[credentialQueryId] = new Set<string>(
          vcKeysToPreselect,
        );
      });

      if (matchedSelectedQueryCount > highestMatchedSelectedQueryCount) {
        highestMatchedSelectedQueryCount = matchedSelectedQueryCount;
        preferredOptionIndex = optionIndex;
        preferredSelection = selectionForOption;
      }
    });

    return {
      preferredOptionIndex,
      preferredSelection,
    };
  };

  useEffect(() => {
    // Pre-select VC

    // Case 1: Already selected VCs could satisfy the credential partially / fully
    // selected : vc1 , currentMatching : [{q1: vc2, q2: vc3}] , preselect -> vc2, vc3 (no matching previous selected Vcs)
    // selected : vc1 , currentMatching : [{q1: vc2, q2: vc3}, {q1: vc1, q2: vc3}] , preselect -> vc1, vc3 (matching previous selected Vc1)
    // selected : vc1 , currentMatching : [{q1: vc1, q2: vc1}, {q1: vc2, q2: vc3}] , preselect -> vc1 (match previous selected vc1)

    // Case 2: No already selected VCs (for required credential sets only)
    // Select first satisfiable option's first matching VC for each credential query in that option

    // Case 3: Optional credential sets with previously selected VCs that can satisfy this credential set
    // Pre-select those VCs if they match the optional credential set

    if (
      satisfiableOptions.length === 0 ||
      Object.keys(selectedQueryIdToCredentialsByOption).length > 0
    ) {
      return;
    }

    // For required sets, always try to pre-select
    // For optional sets, only pre-select if there are matching previously selected VCs
    const {preferredOptionIndex, preferredSelection} =
      getPreselectedOptionState(selectedVcKeys);

    // Only set pre-selection if:
    // 1. For required sets: always set if preferredSelection is not empty
    // 2. For optional sets: only set if there are actual matching previously selected VCs
    if (Object.keys(preferredSelection).length > 0) {
      // For optional sets, check if the selection is based on previously selected VCs
      if (!credentialSet.required) {
        // Check if at least one credential query in the preferred option has a matching previously selected VC
        const option = satisfiableOptions[preferredOptionIndex];
        const hasMatchingPreviouslySelectedVc = option.some(
          credentialQueryId => {
            const matchResult = matchingVCsResult[credentialQueryId];
            if (!matchResult?.matchingVcs?.length) {
              return false;
            }
            const matchingSelectedVcKeys = matchResult.matchingVcs
              .map(matchingCredentialData =>
                (matchingCredentialData.matchingVcInfo).vcKey,
              )
              .filter(vcKey => selectedVcKeys.has(vcKey));
            return matchingSelectedVcKeys.length > 0;
          },
        );

        // For optional sets, only pre-select if there's a matching previously selected VC
        if (!hasMatchingPreviouslySelectedVc) {
          return;
        }
      }

      updateSelectionState({
        [preferredOptionIndex]: preferredSelection,
      });
      selectVcs(preferredSelection);
    }
  }, [
    credentialSet.required,
    matchingVCsResult,
    satisfiableOptions,
    selectedQueryIdToCredentialsByOption,
    selectedVcKeys,
  ]);

  const isRequired = credentialSet.required;
  const {t} = useTranslation('SendVPScreen');

  // Input: credential query id.
  // Output: true only when this is a required single-option/single-query case with exactly one matching VC.
  const isSingleMatchEdgeCase = (credentialQueryId: string): boolean => {
    return (
      isRequired &&
      satisfiableOptions.length === 1 &&
      satisfiableOptions[0].length === 1 &&
      (matchingVCsResult[credentialQueryId]?.matchingVcs?.length ?? 0) === 1
    );
  };

  // Input: one option (array of query ids) and its index.
  // Output: true when every query id in that option currently has at least one selected VC.
  // An option is selected if for every credential query in that option, at least one of the matching VCs for that query is selected.
  const isOptionSelected = (option: string[], optionIndex: number): boolean => {
    return option.every(
      credentialQueryId =>
        (selectedQueryIdToCredentialsByOption[optionIndex]?.[credentialQueryId]
          ?.size ?? 0) > 0,
    );
  };

  // Input: option query ids + option index that user toggled.
  // Output: updates selection state by either fully deselecting that option or selecting it
  // (while clearing other options) and syncs selected/deselected VCs with the parent controller.
  const handleOptionToggle = (option: string[], optionIndex: number) => {
    if (isOptionSelected(option, optionIndex)) {
      const {
        newSelectedQueryIdToCredentialsByOption,
        toBeDeselectedCredentialQueryIds,
      } = deselectOption(optionIndex);

      updateSelectionState(newSelectedQueryIdToCredentialsByOption);
      deselectVcs(toBeDeselectedCredentialQueryIds);
    } else {
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
          const vcKey = (firstVc.matchingVcInfo).vcKey;
          tempVcKeysToSelect = new Set<string>([vcKey]);
        }
        newState[credentialQueryId] = tempVcKeysToSelect;
      });
      updateSelectionState({[optionIndex]: newState});
      selectVcs(newState);
    }
  };

  const isMultipleCardsCombinedOption = (option: Array<string>) => {
    return option.length > 1;
  };

  // Input: credential query id, VC key, and option index.
  // Output: true when that exact VC key is selected for that query within that option.
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

  // Input: target and source maps of queryId -> VC key set.
  // Output: target map containing the union of both maps (mutates and returns target).
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

  // Input: option index to remove, and an optional current selection snapshot.
  // Output: (1) next selection state without that option and
  // (2) minimal queryId->vcKeys that became fully unselected across all remaining options.
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

  // Input: option index that must remain active.
  // Output: state with all other options removed, and emits consolidated deselection events for orphaned VCs.
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

    deselectVcs(toBeDeselectedItems);
    return newState;
  }

  // Input: VC key + query id + option index of the interacted card.
  // Output: toggles that VC selection (single/multi rules respected), updates option state,
  // and emits matching select/deselect updates to the parent controller.
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

    // Appends a VC key to the current option's selection for a given query ID.
    // baseState: The cleaned state (without deselected options) to build upon.
    const appendVcKeyToCurrentSelection = (baseState: Record<number, Record<string, Set<string>>>) => {
      const existingVcKeys = Array.from(
        baseState[currentOptionIndex]?.[
          credentialQueryId
        ] ?? [],
      );

      return {
        ...baseState,
        [currentOptionIndex]: {
          ...baseState[currentOptionIndex] ?? {},
          [credentialQueryId]: new Set([vcKey, ...existingVcKeys]),
        },
      };
    };

    const prevSelectedQueryIdToCredentialsByOption =
      selectedQueryIdToCredentialsByOption;

    if (isVcSelected(credentialQueryId, vcKey, currentOptionIndex)) {
      const newSelectedQueryIdToCredentialsByOption =
        removeVcKeyFromCurrentSelection();
      updateSelectionState(newSelectedQueryIdToCredentialsByOption);

      const anyOtherOptionHoldsCurrentCredentialQueryIdAndVcKey =
        Object.entries(newSelectedQueryIdToCredentialsByOption).some(
          ([optionIndex, selectedQueryIdToVcKeys]) =>
            Number(optionIndex) !== currentOptionIndex &&
            (selectedQueryIdToVcKeys[credentialQueryId]?.has(vcKey) ?? false),
        );

      if (!anyOtherOptionHoldsCurrentCredentialQueryIdAndVcKey) {
        deselectVcs({[credentialQueryId]: new Set<string>([vcKey])});
      }
    } else {
      const allowsMultiple =
        matchingVCsResult[credentialQueryId]?.allowMultipleCredentials;

      const toBeUpdated = deselectOtherOptions(currentOptionIndex);
      let newState: Record<number, Record<string, Set<string>>>;

      if (allowsMultiple) {
        // If allowing multiple, just add this vc to the current selection without deselecting other VCs for this query
        newState = appendVcKeyToCurrentSelection(toBeUpdated);
      } else {
        deselectVcs({[credentialQueryId]: prevSelectedQueryIdToCredentialsByOption[currentOptionIndex]?.[credentialQueryId]})
        newState = {
          [currentOptionIndex]: {
            ...prevSelectedQueryIdToCredentialsByOption[currentOptionIndex],
            [credentialQueryId]: new Set<string>([vcKey]),
          },
        };
      }

      updateSelectionState({...toBeUpdated, ...newState});

      selectVcs({[credentialQueryId]: new Set<string>([vcKey])});
    }
  };

  // Input: one matched VC result containing metadata + matched claim pointers.
  // Output: Set of JSONPath strings for selectively disclosable VC formats, otherwise undefined.
  function getSelectivelyDisclosableMatchedClaimPaths(
    matchingCredentialDataResult: VcWithMatchedClaims,
  ): Set<string> | undefined {
    const vcFormat = matchingCredentialDataResult.matchingVcInfo.metadata.format;
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
    const {vcKey, metadata: vcMetadata} = matchingCredentialData.matchingVcInfo

    return (
      <VcItemContainer
        sdClaimsPath={getSelectivelyDisclosableMatchedClaimPaths(
          matchingCredentialData,
        )}
        minimalDisclosure
        key={`${vcKey}-option-${optionIndex}-query-${credentialQueryId}`}
        vcMetadata={vcMetadata}
        margin="0 2 8 2"
        onPress={() => handleVcSelection(vcKey)}
        selectable
        disableSelection={disableSelection}
        selectionType={selectionType}
        selected={isVcSelected(credentialQueryId, vcKey)}
        flow={VCItemContainerFlowType.VP_SHARE}
        isPinned={vcMetadata.isPinned}
        testId={`${testId}-option-${optionIndex}-query-${credentialQueryId}-vc-${vcKey}`}
      />
    );
  };

  const renderCredentialsMatchingQueryId = (
    credentialQueryId: string,
    optionIndex: number,
    handleVcSelection: (vcKey: string) => void,
    isVcSelected: (credentialQueryId: string, vcKey: string) => boolean,
    isMultipleCardsOption: boolean
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
    const content = (
      <Fragment>
        <InfoBox
          style={{marginHorizontal: 4}}
          message={"One card is selected. Tap \"Show more\" to see additional options."}
          testID={"more-cards-matching-info"}
          backgroundColor={Theme.Colors.infoBackground}
          borderColor={Theme.Colors.infoBorder}
          textColor={Theme.Colors.infoText}
        />
        <ExpandableListSheetView
          items={matchResult.matchingVcs ?? []}
          testID={`${testId}-option-${optionIndex}-query-${credentialQueryId}-multi-vc`}
          introText={""}
          title={"Cards"}
          footerText={""}
          closeText={"Close"}
          alignShowMoreTextAtRight
          showMoreText={() => "Show all cards"}
          priorityItemPredicate={item =>
            getPriorityVcKey(optionIndex, credentialQueryId) === item.matchingVcInfo.vcKey
          }
          keyExtractor={(item, _index, isExpanded) =>
            `${item.matchingVcInfo.vcKey}-${isExpanded ? 'expanded' : 'collapsed'}`
          }
          visibleItemsStyle={{}}
          collapsedItemCount={1}
          renderItem={
            ({item}) => {
              return renderCardView(
                item,
                credentialQueryId,
                handleVcSelection,
                selectionType,
                isVcSelected,
                optionIndex,
              )
            }
          }
        />
      </Fragment>
    );

    if (isMultipleCardsOption) {
      return (
        <View style={styles.dottedBorderContainer}>
          {content}
        </View>
      );
    }

    return content;
  };
  const isSectionSatisfied = satisfiableOptions.some((option, optionIndex) =>
    isOptionSelected(option, optionIndex),
  );

  return (
    <View {...testIDProps(testId)} style={Theme.DcqlStyles.sectionContainer}>
      <SectionHeader required={isRequired}
                     sectionSatisfied={isSectionSatisfied} stepLabel={stepLabel} testId={testId}
      />
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
                <MultipleCardsSection
                  key={`multiple-cards-${optionIndex}`} testId={testId} optionIndex={optionIndex}
                  checked={isOptionSelected(option, optionIndex)}
                  onPress={() => handleOptionToggle(option, optionIndex)}
                  title={t('dcqlSection.multipleCards')}
                  option={option}
                  renderCard={credentialQueryId => {
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
                      true
                    );
                  }}/>
              ) : (
                // Case 2: the option has only one credential query - Only one credential query needs to be selected
                renderCredentialsMatchingQueryId(
                  option[0],
                  optionIndex,
                  (vcKey: string) =>
                    handleVCSelection(vcKey, option[0], optionIndex),
                  (credentialQueryId: string, vcKey: string) =>
                    isVcSelected(credentialQueryId, vcKey, optionIndex),
                  false
                )
              )}
            </View>
          );
        })}
      </Column>
    </View>
  );
};
