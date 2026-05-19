import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Column, Row, Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {VcItemContainer} from '../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {
  CredentialSetOption,
  MatchResult,
} from '../../shared/openID4VP/openid4vp.types';
import {VCMetadata} from '../../shared/VCMetadata';
import {DcqlBadgeColors} from '../ui/themes/DefaultTheme';
import {Badge} from './Badge';
import {DcqlOrDivider} from './DcqlOrDivider';
import {DcqlMultiCardAccordion} from './DcqlMultiCardAccordion';

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
  const [selectedKeys, setSelectedKeys] = useState<Record<string, Set<string>>>(
    {},
  );

  const isRequired = credentialSet.required;

  const getVcKey = (vcData: any): string =>
    VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();

  const isOptionSelected = (option: string[]): boolean => {
    return option.every(credentialQueryId => {
      const matchResult = matchingVCsResult[credentialQueryId];
      if (!matchResult || matchResult.matchingVcs.length === 0) return false;
      const vcData = matchResult.matchingVcs[0].vc;
      const vcKey = getVcKey(vcData);
      return controller.credentialRequestIdToSelectedVcKeys[
        credentialQueryId
      ]?.includes(vcKey);
    });
  };

  /**
   * Select all VCs in a multi-card option by directly invoking SELECT_VC_ITEM.
   * The inner function's vcRef parameter is only used for a no-op destructuring,
   * so a minimal stub is safe to pass.
   */
  const selectAllInOption = (option: string[]) => {
    const mockVcRef = {getSnapshot: () => ({context: {}})};
    option.forEach(credentialQueryId => {
      const matchResult = matchingVCsResult[credentialQueryId];
      if (!matchResult || matchResult.matchingVcs.length === 0) return;
      const vcData = matchResult.matchingVcs[0].vc;
      const vcKey = getVcKey(vcData);
      controller.SELECT_VC_ITEM(vcKey, credentialQueryId)(mockVcRef as any);
    });
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
              {optionIndex > 0 && <DcqlOrDivider />}
              {isMultipleCombinedOption(option)
                ? (() => {
                    const vcDataList = option
                      .map(id => matchingVCsResult[id]?.matchingVcs[0])
                      .filter(Boolean);
                    const selected = isOptionSelected(option);
                    return (
                      <DcqlMultiCardAccordion
                        key={option.join('-')}
                        vcDataList={vcDataList}
                        credentialQueryIds={option}
                        isSelected={selected}
                        onSelectAll={() => selectAllInOption(option)}
                        controller={controller}
                        onDisclosureChange={onDisclosureChange}
                      />
                    );
                  })()
                : (() => {
                    const credentialQueryId = option[0];
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
