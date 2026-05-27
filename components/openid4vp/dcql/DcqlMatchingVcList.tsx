import React, {useEffect, useState} from 'react';
import {Column} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {getVcKey} from '../../../shared/VCMetadata';
import {
  CredentialSetOption,
  MatchingVCsResultForDcql,
} from '../../../shared/openID4VP/openid4vp.types';
import {CredentialSetSection} from './CredentialSetSection';
import {LoaderAnimation} from '../../ui/LoaderAnimation';

type DcqlMatchingVcListProps = {
  controller: any;
};

export const DcqlMatchingVcList: React.FC<DcqlMatchingVcListProps> = ({
  controller,
}) => {
  const dcqlResult = controller.matchingVcsResult as MatchingVCsResultForDcql;
  const orderedCredentialSets = orderCredentialSetsByMandatoryRequirement(
    dcqlResult.credentialSetOptions,
  );
  const [initialSelectedVcKeysBySet, setInitialSelectedVcKeysBySet] = useState<
    Record<number, Record<number, Record<string, Set<string>>>>
  >({});
  const [
    credentialSetQueryToSatisfiableOptions,
    setCredentialSetQueryToSatisfiableOptions,
  ] = useState<Record<number, Array<Array<string>>>>({});

  useEffect(() => {
    if (!controller.matchingVcsResult) {
      return;
    }

    const dcqlResult = controller.matchingVcsResult as MatchingVCsResultForDcql;
    const toSelectGlobal: Record<string, Set<string>> = {};
    const initialSelectedKeys: Record<
      number,
      Record<number, Record<string, Set<string>>>
    > = {};
    const satisfiableOptionsBySet: Record<number, Array<Array<string>>> = {};

    orderedCredentialSets.forEach((credentialSet, credentialSetIndex) => {
      console.log('credentialSet options  ', credentialSet.options);
      console.log('requried  ', credentialSet.required);
      console.log('requried after ', credentialSet.required);
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

      if (!credentialSet.required) {
        return;
      }

      const firstSatisfiableOption = satisfiableOptions[0];
      const queryIdToVcKey: Record<string, Set<string>> = {};

      firstSatisfiableOption.forEach((credentialQueryId: string) => {
        const matchResult = dcqlResult.matchingVCs[credentialQueryId];

        if (!matchResult?.matchingVcs?.length) {
          return;
        }

        const vcKey = getVcKey(matchResult.matchingVcs[0].vc);

        (toSelectGlobal[credentialQueryId] ??= new Set<string>()).add(vcKey);
        (queryIdToVcKey[credentialQueryId] ??= new Set<string>()).add(vcKey);
      });

      if (Object.keys(queryIdToVcKey).length > 0) {
        initialSelectedKeys[credentialSetIndex] = {0: queryIdToVcKey};
      }
    });

    setCredentialSetQueryToSatisfiableOptions(satisfiableOptionsBySet);

    if (Object.keys(toSelectGlobal).length > 0) {
      controller.SELECT_VC_ITEMS(toSelectGlobal)();
    }

    console.log('initial selected keys ', initialSelectedKeys);
    setInitialSelectedVcKeysBySet(initialSelectedKeys);
  }, [controller.matchingVcsResult]);

  if (!controller.matchingVcsResult) {
    return <LoaderAnimation testID={'matching-vc-list-dcql-loader'} />;
  }

  const getPreSelectedVcKeys = (
    setIndex: number,
  ): Record<number, Record<string, Set<string>>> => {
    return initialSelectedVcKeysBySet[setIndex] ?? {};
  };

  let mandatoryCount = 0;
  const totalMandatoryCount = orderedCredentialSets.filter(
    cs => cs.required,
  ).length;

  console.log(
    'ordered credential sets ',
    JSON.stringify(orderedCredentialSets, null, 2),
  );

  return (
    <Column
      testID="matching-vc-list"
      scroll
      backgroundColor={Theme.Colors.whiteBackgroundColor}>
      {orderedCredentialSets.map((credentialSet, index) => {
        const mandatoryIndex =
          credentialSet.required && totalMandatoryCount > 1
            ? ++mandatoryCount
            : undefined;

        const satisfiableOptions =
          credentialSetQueryToSatisfiableOptions[index];

        // If a credential set query is not satisfiable - ignore that credential set query
        if (!satisfiableOptions) return null;

        return (
          <CredentialSetSection
            key={index}
            testId={`matching-vc-list-dcql-section-${index}`}
            credentialSet={credentialSet}
            mandatoryIndex={mandatoryIndex}
            matchingVCsResult={dcqlResult.matchingVCs}
            controller={controller}
            satisfiableOptions={satisfiableOptions}
            initialSelectedVcKeys={getPreSelectedVcKeys(index)}
          />
        );
      })}
    </Column>
  );
};

const orderCredentialSetsByMandatoryRequirement = (
  credentialSets: CredentialSetOption[],
) => {
  const orderedCredentialSets: CredentialSetOption[] = [];

  credentialSets.forEach(credentialSet => {
    if (credentialSet.required) {
      orderedCredentialSets.unshift(credentialSet);
    } else {
      orderedCredentialSets.push(credentialSet);
    }
  });

  return orderedCredentialSets;
};
