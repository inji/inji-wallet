import {useCallback, useEffect, useMemo, useState} from 'react';
import {VC} from '../../../machines/VerifiableCredential/VCMetaMachine/vc';
import {MatchingVCsResultForPresentationExchangeRequest, VCInfo} from '../../../shared/openID4VP/openid4vp.types';
import {getVcKey} from '../../../shared/VCMetadata';

export type PresentationExchangeSelectedVcs = Record<string, Set<string>>;
export type PresentationExchangeSelectedDisclosures = Record<string, string[]>;

export function usePresentationExchangeMatchingVcController(
  matchingVcsResult: MatchingVCsResultForPresentationExchangeRequest | null,
) {
  const [selectedVcs, setSelectedVcs] = useState<PresentationExchangeSelectedVcs>(
    {},
  );
  const [selectedDisclosuresByVc, setSelectedDisclosuresByVc] = useState<
    PresentationExchangeSelectedDisclosures
  >({});

  const totalVcCount = useMemo(
    () => Object.values(matchingVcsResult?.matchingVCs ?? {}).flatMap(vc => vc).length,
    [matchingVcsResult],
  );

  const noOfCardsSelected = useMemo(() => {
    return Object.values(selectedVcs).reduce((vcCount, arr) => vcCount + arr.size, 0);
  }, [selectedVcs]);

  const areAllVcsChecked = noOfCardsSelected === totalVcCount;

  const onDisclosureChange = useCallback((vcKey: string, disclosures: string[]) => {
    setSelectedDisclosuresByVc(prev => ({
      ...prev,
      [vcKey]: disclosures,
    }));
  }, []);

  const SELECT_VC_ITEM = useCallback(
    (vcKey: string, credentialRequestId: string) => () => {
      setSelectedVcs(prev => {
        const updated = {...prev};
        const current = new Set(updated[credentialRequestId] ?? []);

        if (current.has(vcKey)) {
          current.delete(vcKey);
          if (current.size === 0) {
            delete updated[credentialRequestId];
          } else {
            updated[credentialRequestId] = current;
          }
        } else {
          current.add(vcKey);
          updated[credentialRequestId] = current;
        }

        return updated;
      });
    },
    [],
  );

  const UNCHECK_ALL = useCallback(() => {
    setSelectedVcs({});
  }, []);

  const CHECK_ALL = useCallback(() => {
    if (!matchingVcsResult) {
      return;
    }

    const updated: PresentationExchangeSelectedVcs = {};

    Object.entries(matchingVcsResult.matchingVCs).forEach(
      ([credentialRequestId, vcs]) => {
        updated[credentialRequestId] = new Set<string>(
          vcs.map((vc: VCInfo) => vc.vcKey),
        );
      },
    );

    setSelectedVcs(updated);
  }, [matchingVcsResult]);

  const transformForParent = useCallback(
    (currentSelectedVcs: PresentationExchangeSelectedVcs) => {
      const queryIdToSelectedVcKeys: PresentationExchangeSelectedVcs = {};

      Object.entries(currentSelectedVcs).forEach(([credentialRequestId, vcKeys]) => {
        queryIdToSelectedVcKeys[credentialRequestId] = new Set(vcKeys);
      });

      return queryIdToSelectedVcKeys;
    },
    [],
  );

  const isVPRequestSatisfiable = useCallback(
    (currentSelectedVcs: PresentationExchangeSelectedVcs) => {
      return Object.keys(transformForParent(currentSelectedVcs)).length !== 0;
    },
    [transformForParent],
  );

  return {
    selectedVcs,
    selectedDisclosuresByVc,
    noOfCardsSelected,
    areAllVcsChecked,
    onDisclosureChange,
    SELECT_VC_ITEM,
    UNCHECK_ALL,
    CHECK_ALL,
    transformForParent,
    isVPRequestSatisfiable,
  };
}




