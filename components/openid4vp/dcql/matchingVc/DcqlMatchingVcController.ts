import {useCallback, useState} from 'react';
import {MatchingVCsResultForDcql} from '../../../../shared/openID4VP/openid4vp.types';
import {claimPathPointersToJsonPath} from '../../../../shared/openID4VP/OpenID4VPHelper';
import {
  OptionSelectionState,
  SectionSelectionState,
} from '../credentialSetSection/CredentialSetSection';

function transformForParent(
  currentSectionSelectionState: Record<number, SectionSelectionState>,
) {
  const queryIdToSelectedVcKeys: Record<string, Set<string>> = {};

  Object.values(currentSectionSelectionState).forEach(sectionState => {
    const optionSelectionState = sectionState.selection;

    Object.values(optionSelectionState).forEach(optionState => {
      Object.entries(optionState).forEach(([queryId, vcKeys]) => {
        queryIdToSelectedVcKeys[queryId] = queryIdToSelectedVcKeys[queryId]
          ? new Set<string>([...queryIdToSelectedVcKeys[queryId], ...vcKeys])
          : vcKeys;
      });
    });
  });

  return queryIdToSelectedVcKeys;
}

export function useDcqlMatchingVcController() {
  const [selectedVcKeys, setSelectedVcKeys] = useState<Set<string>>(new Set());
  const [sectionSelectionState, setSectionSelectionState] = useState<
    Record<number, SectionSelectionState>
  >({});

  const onSectionSelectionChange = useCallback(
    (
      sectionIndex: number,
      newSelection: OptionSelectionState,
      required: boolean,
    ) => {
      setSectionSelectionState(prev => ({
        ...prev,
        [sectionIndex]: {
          selection: newSelection,
          required,
        },
      }));
    },
    [],
  );

  const deselectVcs = useCallback(
    (queryIdToVcKeys: Record<string, Set<string>>) => {
      setSelectedVcKeys(prev => {
        const updated = new Set(prev);

        Object.values(queryIdToVcKeys).forEach(vcKeys => {
          vcKeys?.forEach(key => updated.delete(key));
        });

        return updated;
      });
    },
    [],
  );

  const selectVcs = useCallback(
    (queryIdToVcKeys: Record<string, Set<string>>) => {
      setSelectedVcKeys(prev => {
        return new Set([
          ...prev,
          ...Object.values(queryIdToVcKeys).flatMap(vcKeys => [...vcKeys]),
        ]);
      });
    },
    [],
  );

  const getSelectedDisclosures = useCallback(
    (
      currentSectionSelectionState: Record<number, SectionSelectionState>,
      dcqlResult: MatchingVCsResultForDcql | null,
    ) => {
      const selectedVcsInfo = transformForParent(currentSectionSelectionState);
      const vcKeyToSelectedDisclosuresSet: Record<string, Set<string>> = {};

      Object.entries(selectedVcsInfo).forEach(
        ([credentialQueryId, selectedVcKeys]) => {
          dcqlResult?.matchingVCs[credentialQueryId].matchingVcs?.forEach(
            ({matchingVcInfo, matchedClaims}) => {
              const setOfMatchingClaims = new Set<string>();
              const vcKey = matchingVcInfo.vcKey;
              if (selectedVcKeys.has(vcKey)) {
                matchedClaims?.forEach(claim => {
                  setOfMatchingClaims.add(
                    claimPathPointersToJsonPath(claim.path),
                  );
                });
              }
              vcKeyToSelectedDisclosuresSet[vcKey] = new Set([
                ...(vcKeyToSelectedDisclosuresSet[vcKey] ?? new Set<string>()),
                ...setOfMatchingClaims,
              ]);
            },
          );
        },
      );

      return Object.fromEntries(
        Object.entries(vcKeyToSelectedDisclosuresSet).map(([k, s]) => [k, [...s]]),
      );
    },
    [],
  );

  return {
    selectedVcKeys,
    sectionSelectionState,
    onSectionSelectionChange,
    selectVcs,
    deselectVcs,
    getSelectedDisclosures,
  };
}

