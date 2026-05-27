import React from 'react';
import {DcqlMatchingVcList} from './dcql/DcqlMatchingVcList';
import {PresentationExchangeMatchingVcList} from './presentationExchange/PresentationExchangeMatchingVcList';

interface MatchingVcListProps {
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
}

export const MatchingVcListContainer: React.FC<MatchingVcListProps> = ({
  controller,
  onDisclosureChange,
}) => {
  if (controller.isDcqlFlow) {
    return <DcqlMatchingVcList controller={controller} />;
  }

  return (
    <PresentationExchangeMatchingVcList
      controller={controller}
      onDisclosureChange={onDisclosureChange}
    />
  );
};
