import React, {forwardRef} from 'react';
import {
  DcqlMatchingVcList,
} from '../dcql/matchingVc/DcqlMatchingVcList';
import {
  PresentationExchangeMatchingVcList,
} from '../presentationExchange/PresentationExchangeMatchingVcList';
import {
  MatchingVCsResultForDcql,
  MatchingVCsResultForPresentationExchangeRequest
} from "../../../shared/openID4VP/openid4vp.types";

interface MatchingVcListProps {
  setDisableShareButton: (disable: boolean) => void;
  controller: {
    isDcqlFlow?: boolean;
    matchingVcsResult?:
      | MatchingVCsResultForDcql
      | MatchingVCsResultForPresentationExchangeRequest
      | null;
  };
}

export type MatchingVcListRef = {
  getSelectedVcs: () => Record<string, Set<string>>;
  selectedDisclosures: () => Record<string, string[]>;
};

// eslint-disable-next-line react/display-name
export const MatchingVcListContainer = forwardRef<MatchingVcListRef, MatchingVcListProps>(
  ({ controller, setDisableShareButton }, ref) => {
    if (controller.isDcqlFlow) {
      return (
        <DcqlMatchingVcList
          setDisableShareButton={setDisableShareButton}
          ref={ref}
          matchingVcsResult={controller.matchingVcsResult as MatchingVCsResultForDcql | null}
        />
      );
    }

    return (
      <PresentationExchangeMatchingVcList
        ref={ref}
        setDisableShareButton={setDisableShareButton}
        matchingVcsResult={controller.matchingVcsResult as MatchingVCsResultForPresentationExchangeRequest | null}
      />
    );
  }
);
