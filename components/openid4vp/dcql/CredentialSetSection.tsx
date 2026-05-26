import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Column, Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {VcItemContainer} from '../../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../../shared/Utils';
import {CredentialSetOption, MatchResult, VcWithMatchedClaims,} from '../../../shared/openID4VP/openid4vp.types';
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
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
  mandatoryIndex?: number;
  testId: string;
  initialSelectedVcKeys: Record<number, Record<string, Set<string>>>;
}

export const CredentialSetSection: React.FC<
  DcqlCredentialSetSectionProps
> = ({
       credentialSet,
       matchingVCsResult,
       satisfiableOptions,
       controller,
       onDisclosureChange,
       mandatoryIndex,
       testId,
       initialSelectedVcKeys,
     }) => {
  // Per-option selection tracking: { optionIndex -> { credentialQueryId -> Set<vcKey> } }
  // This is the source of truth for UI selection state. It ensures that when two options
  // share the same credential query ID (e.g. "gov"), selecting option 1's "gov" does not
  // visually mark option 2's "gov" as selected.
  const [selectedQueryIdToCredentialsByOption, setSelectedQueryIdToCredentialsByOption] =
    useState<Record<number, Record<string, Set<string>>>>({});

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
    Object.values(queryIdToVcKeys).forEach(vcKeys => {
      Array.from(vcKeys).forEach(vcKey => {
        // TODO: What if the same VC has been matched with different claims in other option ?
        onDisclosureChange(vcKey, []);
      })
    })
    controller.DESELECT_VC_ITEMS(queryIdToVcKeys)()
  }

  const selectItems = (queryIdToVcKeys: Record<string, Set<string>>) => {
    Object.entries(queryIdToVcKeys).forEach(([queryId, vcKeys]) => {
      Array.from(vcKeys).forEach(vcKey => {
          matchingVCsResult[queryId]?.matchingVcs?.forEach(matchingCredentialData => {
            const matchingVcKey = getVcKey(matchingCredentialData.vc);
            if (matchingVcKey === vcKey) {
              onDisclosureChange(vcKey, matchingCredentialData.matchedClaims?.map(claim => claimPathPointersToJsonPath(claim.path)).flat() ?? []);
            }
          })
      })
    })

    controller.SELECT_VC_ITEMS(queryIdToVcKeys)()
  }

  const getVcKey = (vcData: VC): string =>
    VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();

  // An option is selected if for every credential query in that option, at least one of the matching VCs for that query is selected.
  const isOptionSelected = (option: string[], optionIndex: number): boolean => {
    return option.every(credentialQueryId =>
      (selectedQueryIdToCredentialsByOption[optionIndex]?.[credentialQueryId]?.size ?? 0) > 0,
    );
  };

  const selectAllInOption = (option: string[], optionIndex: number) => {
    if (isOptionSelected(option, optionIndex)) {
      const {newSelectedQueryIdToCredentialsByOption, toBeDeselectedCredentialQueryIds} = deselectOption(optionIndex);

      setSelectedQueryIdToCredentialsByOption(newSelectedQueryIdToCredentialsByOption)
      deselectItems(toBeDeselectedCredentialQueryIds);
    } else {
      deselectOtherOptions(optionIndex);

      const newState: Record<string, Set<string>> = {}
      option.forEach((credentialQueryId) => {
        const firstVc = matchingVCsResult[credentialQueryId]?.matchingVcs?.[0];
        if (!firstVc) return;
        const vcKey = getVcKey(firstVc.vc);
        newState[credentialQueryId] = new Set<string>([vcKey]);
      })
      setSelectedQueryIdToCredentialsByOption({[optionIndex]: newState})
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

  const deselectOption: (optionIndex: number) => {
    newSelectedQueryIdToCredentialsByOption: Record<number, Record<string, Set<string>>>;
    toBeDeselectedCredentialQueryIds: Record<string, Set<string>>
  } = (optionIndex: number) => {
    const newSelectedQueryIdToCredentialsByOption = selectedQueryIdToCredentialsByOption;

    const toBeDeselectedCredentialQueryIds: Record<string, Set<string>> = {}
    const option = satisfiableOptions[optionIndex];
    option.forEach(credentialQueryId => {
      const selectedVcKeys = newSelectedQueryIdToCredentialsByOption[optionIndex]?.[credentialQueryId];
      if (selectedVcKeys) {
        delete newSelectedQueryIdToCredentialsByOption[optionIndex];

        toBeDeselectedCredentialQueryIds[credentialQueryId] = selectedVcKeys
      }
    });
    return {newSelectedQueryIdToCredentialsByOption, toBeDeselectedCredentialQueryIds};
  }

  function deselectOtherOptions(excludedOptionIndex: number) {
    for (let optionIndex = 0; optionIndex < satisfiableOptions.length; optionIndex++) {
      if (optionIndex === excludedOptionIndex) continue;

      const {newSelectedQueryIdToCredentialsByOption, toBeDeselectedCredentialQueryIds} = deselectOption(optionIndex);

      setSelectedQueryIdToCredentialsByOption(newSelectedQueryIdToCredentialsByOption)
      deselectItems(toBeDeselectedCredentialQueryIds);
    }
  }

  const handleVCSelection = (
    vcKey: string,
    credentialQueryId: string,
    currentOptionIndex: number,
  ) => {
    const removeVcKeyFromCurrentSelection = () => {
      const newSelectedQueryIdToCredentialsByOption = {...prevSelectedQueryIdToCredentialsByOption};
      prevSelectedQueryIdToCredentialsByOption[currentOptionIndex]?.[credentialQueryId]?.delete(vcKey);
      if (prevSelectedQueryIdToCredentialsByOption[currentOptionIndex]?.[credentialQueryId]?.size === 0) {
        delete prevSelectedQueryIdToCredentialsByOption[currentOptionIndex][credentialQueryId];
      }
      if (prevSelectedQueryIdToCredentialsByOption[currentOptionIndex] && Object.keys(prevSelectedQueryIdToCredentialsByOption[currentOptionIndex]).length === 0) {
        delete prevSelectedQueryIdToCredentialsByOption[currentOptionIndex];
      }
      return newSelectedQueryIdToCredentialsByOption;
    }

    const appendVcKeyToCurrentSelection = () => {
      return {
        ...prevSelectedQueryIdToCredentialsByOption,
        [currentOptionIndex]: {
          ...prevSelectedQueryIdToCredentialsByOption[currentOptionIndex], // Copies existing queries for this option, if any
          [credentialQueryId]: new Set([
            ...(prevSelectedQueryIdToCredentialsByOption[currentOptionIndex]?.[credentialQueryId] ?? []), // Copies existing VC keys, if any
            vcKey, // Adds the new key
          ]),
        },
      }
    }

    const prevSelectedQueryIdToCredentialsByOption = selectedQueryIdToCredentialsByOption;

    if (isVcSelected(credentialQueryId, vcKey, currentOptionIndex)) {
      const newSelectedQueryIdToCredentialsByOption = removeVcKeyFromCurrentSelection();
      setSelectedQueryIdToCredentialsByOption(newSelectedQueryIdToCredentialsByOption);

      const anyOtherOptionHoldsCurrentCredentialQueryIdAndVcKey = Object.entries(newSelectedQueryIdToCredentialsByOption).some(
        ([optionIndex, selectedQueryIdToVcKeys]) =>
          Number(optionIndex) !== currentOptionIndex &&
          (selectedQueryIdToVcKeys[credentialQueryId]?.has(vcKey) ?? false),
      );

      if (!anyOtherOptionHoldsCurrentCredentialQueryIdAndVcKey) {
        deselectItems({[credentialQueryId]: new Set<string>([vcKey])});
      }
    } else {
      const allowsMultiple = matchingVCsResult[credentialQueryId]?.allowMultipleCredentials;

      if (allowsMultiple) {
        // If allowing multiple, just add this vc to the current selection without deselecting other VCs for this query
        setSelectedQueryIdToCredentialsByOption(appendVcKeyToCurrentSelection());
        deselectItems({[credentialQueryId]: new Set<string>([vcKey])});
      } else {
        deselectOtherOptions(currentOptionIndex);

        const newState = {[currentOptionIndex]: {[credentialQueryId]: new Set<string>(vcKey)}};
        setSelectedQueryIdToCredentialsByOption(newState);
        deselectItems({[credentialQueryId]: new Set<string>([vcKey])});
      }
    }
  }

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
    const canSelectMultiple = (matchResult.matchingVcs?.length ?? 0) > 1 && matchResult.allowMultipleCredentials;

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
          // If an option is not satisfiable - don't show the option
          const isOptionSatisfied = option.every(
            (credentialQueryId: string) => {
              const matchResult = matchingVCsResult[credentialQueryId];
              return matchResult && matchResult.matchingVcs?.length !== 0;
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
                      onPress={() => selectAllInOption(option, optionIndex)}
                    />
                  }>
                  {option.map(credentialQueryId => {
                    return renderCredentialsMatchingQueryId(
                      credentialQueryId,
                      optionIndex,
                      (vcKey: string) =>
                        handleVCSelection(vcKey, credentialQueryId, optionIndex),
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
