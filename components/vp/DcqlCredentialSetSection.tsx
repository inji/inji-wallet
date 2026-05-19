import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Column, Row, Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {VcItemContainer} from '../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {CredentialSetOption, MatchResult, VcWithMatchedClaims,} from '../../shared/openID4VP/openid4vp.types';
import {DcqlBadgeColors} from '../ui/themes/DefaultTheme';
import {Badge} from './Badge';
import {DcqlOrDivider} from './DcqlOrDivider';
import {DcqlMultiCardAccordion} from './DcqlMultiCardAccordion';
import {hasAtLeastOneMatch} from "../../shared/commonUtil";
import {VC} from "../../machines/VerifiableCredential/VCMetaMachine/vc";
import {VCMetadata} from "../../shared/VCMetadata";

interface DcqlCredentialSetSectionProps {
  credentialSet: CredentialSetOption;
  matchingVCsResult: Record<string, MatchResult>;
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
}

export const DcqlCredentialSetSection: React.FC<
  DcqlCredentialSetSectionProps
> = ({credentialSet, matchingVCsResult, controller, onDisclosureChange}) => {
  const [isCollapsed, setIsCollapsed] = useState(!credentialSet.required);

  const isRequired = credentialSet.required;

  const getVcKey = (vcData: VC): string =>
    VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();

  const isOptionSelected = (option: string[]): boolean => {
    // An option is selected if for every credential query in that option, at least one of the matching VCs for that query is selected.
    return option.every(credentialQueryId => {
      const matchResult = matchingVCsResult[credentialQueryId];
      if (!matchResult || matchResult.matchingVcs.length === 0) return false;

      const matchingVcKeys: Set<string> = new Set<string>(matchResult.matchingVcs.map((vcWithClaims: VcWithMatchedClaims) => getVcKey(vcWithClaims.vc)));
      const selectedCredentialVcKeys: Set<string> = controller.credentialRequestIdToSelectedVcKeys[credentialQueryId];

      return hasAtLeastOneMatch(matchingVcKeys, selectedCredentialVcKeys);
    });
  };

  // If an option is selected on whole - all credentials part of it are selected
  const selectAllInOption = (option: string[]) => {
    const selectedCredentialRequestIdToVCKeys : Record<string, Set<string>> = {};
    option.forEach(credentialQueryId => {
      const matchResult = matchingVCsResult[credentialQueryId];
      if (!matchResult || matchResult.matchingVcs.length === 0) return;
      // Case - 1: Verifier allows multiple credentials for a credential query - select all matching VCs for that credential query
      if (matchResult.allowMultipleCredentials) {
        console.log("Selecting all VCs for credentialQueryId:", credentialQueryId, "with matching VCs:", matchResult.matchingVcs);
        matchResult.matchingVcs.forEach((vcData: any) => {
          const vcKey = getVcKey(vcData);
          (selectedCredentialRequestIdToVCKeys[credentialQueryId] ??= new Set<string>()).add(vcKey);
        })
      } else {
        // Case - 2: Verifier does not allow multiple credentials then - select only the first VC for the credential query
        console.log("Selecting first VC for credentialQueryId:", credentialQueryId, "with matching VCs:", matchResult.matchingVcs);
        const vcData = matchResult.matchingVcs[0].vc;
        const vcKey = getVcKey(vcData);
        (selectedCredentialRequestIdToVCKeys[credentialQueryId] ??= new Set<string>()).add(vcKey);
      }
    });
    controller.TOGGLE_VC_ITEMS(selectedCredentialRequestIdToVCKeys)()
  };

  const isMultipleCombinedOption = (option: Array<string>) => {
    return option.length > 1;
  };
  const isVcSelected = (credentialQueryId: string, vcKey: string) => {
    console.log(
      'Checking if VC is selected for credentialQueryId:',
      credentialQueryId,
      'and vcKey:',
      vcKey,
    );
    console.log(
      'Checking if VC is selected for credentialQueryId:',
      controller.credentialRequestIdToSelectedVcKeys[credentialQueryId],
    );
    const matchingVCsResult =
      controller.credentialRequestIdToSelectedVcKeys[credentialQueryId];
    return matchingVCsResult ? matchingVCsResult.has(vcKey) : false;
  };

  const handleVcSelected = (vcKey: string, credentialQueryId: string) => {
    controller.SELECT_VC_ITEM(vcKey, credentialQueryId)();
  }

  const handleOptionSelection = (
    vcKey: string,
    selectedOptionIndex: number,
  ) => {
    console.log('Selected option index:', selectedOptionIndex);

    // If one option is selected, we want to deselect all other options in the same credential set.
    for (let i = 0; i < credentialSet.options.length; i++) {
      if (i === selectedOptionIndex) continue;
      const option = credentialSet.options[i];
      option.forEach(credentialQueryId => {
        controller.DESELECT_VC_ITEMS(
          controller.credentialRequestIdToSelectedVcKeys[credentialQueryId],
          credentialQueryId,
        )();
      });
    }

    // Then select the tapped option based on its current state.
    credentialSet.options[selectedOptionIndex].forEach(credentialQueryId => {
      controller.SELECT_VC_ITEM(vcKey, credentialQueryId)();
    });

    console.log(
      'After update ',
      controller.credentialRequestIdToSelectedVcKeys,
    );
  };
  return (
    <View style={Theme.DcqlStyles.sectionContainer}>
      <Pressable onPress={() => setIsCollapsed(prev => !prev)}>
        <Row style={Theme.DcqlStyles.sectionHeader}>
          <Text style={Theme.DcqlStyles.sectionTitle}>
            {isRequired ? 'MANDATORY CARDS' : 'OPTIONAL CARDS'}
          </Text>
          <View style={Theme.DcqlStyles.sectionChevronWrapper}>
            <Icon
              name={isCollapsed ? 'expand-more' : 'expand-less'}
              color={Theme.Colors.Icon}
              size={20}
            />
          </View>
          <Badge
            text={isRequired ? 'REQUIRED' : 'NOT REQUIRED'}
            borderColor={
              isRequired
                ? DcqlBadgeColors.requiredBorder
                : DcqlBadgeColors.optionalBorder
            }
            bgColor={
              isRequired
                ? DcqlBadgeColors.requiredBg
                : DcqlBadgeColors.optionalBg
            }
          />
        </Row>
      </Pressable>

      {!isCollapsed && (
        <Column>
          {credentialSet.options.map((option, optionIndex) => (
            <View key={optionIndex}>
              {optionIndex > 0 && <DcqlOrDivider/>}
              {isMultipleCombinedOption(option)
                ? (() => {
                  return (
                    <DcqlMultiCardAccordion
                      credentialQueryIds={option}
                      key={option.join('-')}
                      matchingVCsResult={matchingVCsResult}
                      isOptionSelected={isOptionSelected(option)}
                      isVcSelected={isVcSelected}
                      handleVcSelected={handleVcSelected}
                      onSelectAll={() => selectAllInOption(option)}
                      controller={controller}
                      onDisclosureChange={onDisclosureChange}
                    />
                  );
                })()
                : (() => {
                  const credentialQueryId = option[0];
                  // TODO: Implement the Option handling for multiple VCs matching one credential query
                  const matchResult = matchingVCsResult[credentialQueryId];
                  if (!matchResult || matchResult.matchingVcs.length === 0)
                    return null;
                  const vcData = matchResult.matchingVcs[0].vc;
                  const vcKey = getVcKey(vcData);
                  return (
                    <VcItemContainer
                      key={`${vcKey}-${credentialQueryId}`}
                      vcMetadata={vcData.vcMetadata}
                      margin="0 2 8 2"
                      onPress={() =>
                        handleOptionSelection(vcKey, optionIndex)
                      }
                      selectable
                      selected={isVcSelected(credentialQueryId, vcKey)}
                      flow={VCItemContainerFlowType.VP_SHARE}
                      isPinned={vcData.vcMetadata.isPinned}
                      onDisclosuresChange={disclosures => {
                        onDisclosureChange(vcKey, disclosures);
                      }}
                    />
                  );
                })()}
            </View>
          ))}
        </Column>
      )}
    </View>
  );
};
