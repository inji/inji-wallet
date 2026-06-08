import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useState} from 'react';
import {Column} from '../../../ui';
import {Theme} from '../../../ui/styleUtils';
import {CredentialSetOption, MatchingVCsResultForDcql,} from '../../../../shared/openID4VP/openid4vp.types';
import {
  CredentialSetSection,
  SectionSelectionState,
} from '../credentialSetSection/CredentialSetSection';
import {LoaderAnimation} from '../../../ui/LoaderAnimation';
import {Pagination} from '../../../ui/pagination/Pagination';
import {useTranslation} from 'react-i18next';
import {useDcqlMatchingVcController} from './DcqlMatchingVcController';
import {MatchingVcListRef} from "../../matchingVc/MatchingVcListContainer";

type DcqlMatchingVcListProps = {
  matchingVcsResult: MatchingVCsResultForDcql | null;
  setDisableShareButton: (disable: boolean) => void

};

// eslint-disable-next-line react/display-name
export const DcqlMatchingVcList = forwardRef<
  MatchingVcListRef,
  DcqlMatchingVcListProps
>(
  (
    {
      matchingVcsResult,
      setDisableShareButton,
    },
    ref,
  ) => {
  const {t} = useTranslation('SendVPScreen');
  const dcqlResult = matchingVcsResult;
  const orderedCredentialSets = useMemo(
    () =>
      dcqlResult
        ? orderCredentialSetsByMandatoryRequirement(
          dcqlResult.credentialSetOptions,
        )
        : [],
    [dcqlResult],
  );
  const [
    credentialSetQueryToSatisfiableOptions,
    setCredentialSetQueryToSatisfiableOptions,
  ] = useState<Record<number, Array<Array<string>>>>({});
  const dcqlController = useDcqlMatchingVcController();
  const {selectedVcKeys, sectionSelectionState} = dcqlController;


  useEffect(() => {
    if (!dcqlResult) {
      return;
    }

    const satisfiableOptionsBySet: Record<number, Array<Array<string>>> = {};

    orderedCredentialSets.forEach((credentialSet, credentialSetIndex) => {
      const satisfiableOptions = credentialSet.options.filter(option =>
        option.every(queryId => {
          const matchingResult = dcqlResult.matchingVCs[queryId];
          return (
            matchingResult &&
            matchingResult.matchingVcs &&
            matchingResult.matchingVcs.length > 0
          );
        }),
      );

      if (satisfiableOptions.length === 0) {
        return;
      }

      satisfiableOptionsBySet[credentialSetIndex] = satisfiableOptions;
    });

    setCredentialSetQueryToSatisfiableOptions(satisfiableOptionsBySet);
  }, [dcqlResult, orderedCredentialSets]);

  function transformForParent(sectionSelectionState: Record<number, SectionSelectionState>) {
    const queryIdToSelectedVcKeys: Record<string, Set<string>> = {};

    Object.values(sectionSelectionState).forEach(sectionState => {
      const optionSelectionState = sectionState.selection;

      Object.values(optionSelectionState).forEach(optionState => {
        Object.entries(optionState).forEach(([queryId, vcKeys]) => {
          queryIdToSelectedVcKeys[queryId] = queryIdToSelectedVcKeys[queryId]
            ? new Set<string>([...queryIdToSelectedVcKeys[queryId], ...vcKeys])
            : vcKeys;
        })
      })
    })

    return queryIdToSelectedVcKeys
  }

    useEffect(() => {
     const isVpRequestSatisfied = isVPRequestSatisfiable(sectionSelectionState);
     setDisableShareButton(!isVpRequestSatisfied);
    }, [
      sectionSelectionState,
      orderedCredentialSets,
      credentialSetQueryToSatisfiableOptions,
      dcqlResult,
    ]);

  const isVPRequestSatisfiable = (
    currentSectionSelectionState: Record<number, SectionSelectionState>,
  ) => {
    if (!dcqlResult) {
      return false;
    }

    // A required section is satisfied only when exactly one option is fully selected.
    return orderedCredentialSets.every((credentialSet, sectionIndex) => {
      if (!credentialSet.required) {
        return true;
      }

      const satisfiableOptions =
        credentialSetQueryToSatisfiableOptions[sectionIndex] ?? [];
      if (satisfiableOptions.length === 0) {
        return false;
      }

      const sectionState = currentSectionSelectionState[sectionIndex];
      if (!sectionState) {
        return false;
      }

      const fullySelectedOptionsCount = satisfiableOptions.filter(
        (option, optionIndex) =>
          option.every(
            credentialQueryId =>
              (sectionState.selection[optionIndex]?.[credentialQueryId]?.size ??
                0) > 0,
          ),
      ).length;

      return fullySelectedOptionsCount === 1;
    });
  };

  useImperativeHandle(ref, () => ({
    getSelectedVcs: () => transformForParent(sectionSelectionState),
    selectedDisclosures: () =>
      dcqlController.getSelectedDisclosures(sectionSelectionState, dcqlResult),
  }));

  if (!dcqlResult) {
    return <LoaderAnimation testID={'matching-vc-list-dcql-loader'}/>;
  }

  // TODO: Move this option satisfiable stuff to getMatching Vcs part
  // Build the ordered list of satisfiable sections for pagination
  const paginatedSections = orderedCredentialSets
    .map((credentialSet, index) => ({
      credentialSet,
      index,
      satisfiableOptions: credentialSetQueryToSatisfiableOptions[index],
    }))
    .filter(s => s.satisfiableOptions && s.satisfiableOptions.length > 0);

  return (
    <Column
      fill
      testID="matching-vc-list"
      backgroundColor={Theme.Colors.whiteBackgroundColor}>
      <Pagination
        data={paginatedSections}
        renderItem={({item, index, total}) => (
          <CredentialSetSection
            key={item.index}
            testId={`matching-vc-list-dcql-section-${item.index}`}
            credentialSet={item.credentialSet}
            matchingVCsResult={dcqlResult.matchingVCs}
            satisfiableOptions={item.satisfiableOptions}
            selectVcs={dcqlController.selectVcs}
            deselectVcs={dcqlController.deselectVcs}
            selectedVcKeys={selectedVcKeys}
            initialSelectionState={sectionSelectionState[item.index]}
            onSelectionChange={newState =>
              dcqlController.onSectionSelectionChange(
                item.index,
                newState,
                item.credentialSet.required,
              )
            }
            stepLabel={
              total > 1
                ? t('dcqlSection.stepOf', {current: index + 1, total})
                : undefined
            }
          />
        )}
      />
    </Column>
  );
  },
);

const orderCredentialSetsByMandatoryRequirement = (
  credentialSets: CredentialSetOption[],
) => {
  const requiredCredentialSets = credentialSets.filter(
    credentialSet => credentialSet.required,
  );
  const optionalCredentialSets = credentialSets.filter(
    credentialSet => !credentialSet.required,
  );

  return [...requiredCredentialSets, ...optionalCredentialSets];
};
