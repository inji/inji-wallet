import React, {forwardRef} from 'react';
import {DcqlMatchingVcList} from '../dcql/matchingVc/DcqlMatchingVcList';
import {PresentationExchangeMatchingVcList} from '../presentationExchange/PresentationExchangeMatchingVcList';
import {MatchingVCsResultForDcql} from "../../../shared/openID4VP/openid4vp.types";

interface MatchingVcListProps {
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
}

// eslint-disable-next-line react/display-name
export const MatchingVcListContainer = forwardRef<any, MatchingVcListProps>(
  ({ controller, onDisclosureChange }, ref) => {
    if (controller.isDcqlFlow) {
      return (
        <DcqlMatchingVcList
          ref={ref}
          matchingVcsResult={controller.matchingVcsResult as MatchingVCsResultForDcql | null}
        />
      );
    }

    return (
      <PresentationExchangeMatchingVcList
        ref={ref}
        controller={controller}
        onDisclosureChange={onDisclosureChange}
      />
    );
  }
);
