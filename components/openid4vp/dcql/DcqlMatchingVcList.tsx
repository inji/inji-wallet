import React, {useEffect, useMemo, useState} from 'react';
import {Column} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {
  CredentialSetOption,
  MatchingVCsResultForDcql,
} from '../../../shared/openID4VP/openid4vp.types';
import {
  CredentialSetSection,
  SectionSelectionState,
} from './CredentialSetSection';
import {LoaderAnimation} from '../../ui/LoaderAnimation';
import {Pagination} from '../../ui/pagination/Pagination';
import {useTranslation} from 'react-i18next';

type DcqlMatchingVcListProps = {
  controller: any;
};

export const DcqlMatchingVcList: React.FC<DcqlMatchingVcListProps> = ({
  controller,
}) => {
  const {t} = useTranslation('SendVPScreen');
  const dcqlResult =
    controller.matchingVcsResult as MatchingVCsResultForDcql | null;
  const orderedCredentialSets = useMemo(
    () =>
      dcqlResult
        ? orderCredentialSetsByMandatoryRequirement(
            dcqlResult.credentialSetOptions,
          )
        : [],
    [dcqlResult],
  );
  const [selectedVcKeys, setSelectedVcKeys] = useState<Set<string>>(new Set());
  const [sectionSelectionState, setSectionSelectionState] = useState<
    Record<number, SectionSelectionState>
  >({});
  const [
    credentialSetQueryToSatisfiableOptions,
    setCredentialSetQueryToSatisfiableOptions,
  ] = useState<Record<number, Array<Array<string>>>>({});

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

  if (!dcqlResult) {
    return <LoaderAnimation testID={'matching-vc-list-dcql-loader'} />;
  }

  const deselectItems = (queryIdToVcKeys: Record<string, Set<string>>) => {
    setSelectedVcKeys(prev => {
      const updated = new Set(prev);

      Object.values(queryIdToVcKeys).forEach(vcKeys => {
        vcKeys.forEach(key => updated.delete(key));
      });

      return updated;
    });
    controller.DESELECT_VC_ITEMS(queryIdToVcKeys)();
  };

  const selectItems = (queryIdToVcKeys: Record<string, Set<string>>) => {
    setSelectedVcKeys(
      prev =>
        new Set([
          ...(prev ?? []),
          ...Object.values(queryIdToVcKeys).flatMap(vcKeys => [...vcKeys]),
        ]),
    );
    controller.SELECT_VC_ITEMS(queryIdToVcKeys)();
  };

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
            selectVcs={selectItems}
            deselectVcs={deselectItems}
            selectedVcKeys={selectedVcKeys}
            initialSelectionState={sectionSelectionState[item.index]}
            onSelectionChange={newState =>
              setSectionSelectionState(prev => ({
                ...prev,
                [item.index]: newState,
              }))
            }
            stepLabel={
              total > 1
                ? t('dcqlSection.stepOf', {current: index + 1, total})
                : undefined
            }
          />
        )}
        previousLabel={'← ' + t('dcqlSection.previous')}
        nextLabel={t('dcqlSection.next') + ' →'}
      />
    </Column>
  );
};

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
