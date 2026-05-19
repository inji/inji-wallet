import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {CheckBox, Icon} from 'react-native-elements';
import {Row, Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {VcItemContainer} from '../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {MatchResult} from "../../shared/openID4VP/openid4vp.types";
import {VC} from "../../machines/VerifiableCredential/VCMetaMachine/vc";
import {VCMetadata} from "../../shared/VCMetadata";

interface DcqlMultiCardAccordionProps {
  credentialQueryIds: string[];
  matchingVCsResult: Record<string, MatchResult>;
  handleVcSelected: (vcKey: string, credentialQueryId: string) => void;
  isOptionSelected: boolean;
  isVcSelected: (credentialQueryId: string, vcKey: string) => boolean;
  onSelectAll: () => void;
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
}

export const DcqlMultiCardAccordion: React.FC<DcqlMultiCardAccordionProps> = ({
                                                                                matchingVCsResult,
                                                                                credentialQueryIds,
                                                                                isOptionSelected,
                                                                                isVcSelected,
                                                                                onSelectAll,
                                                                                handleVcSelected,
                                                                                onDisclosureChange,
                                                                              }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getVcKey = (vcData: VC): string => VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();

  return (
    <View style={Theme.DcqlStyles.accordionContainer}>
      <Pressable
        onPress={() => setIsExpanded(prev => !prev)}
        style={Theme.DcqlStyles.accordionExpandButton}>
        <Row style={Theme.DcqlStyles.accordionHeader}>
          <Row style={Theme.DcqlStyles.accordionTitleRow}>
            <Text style={Theme.DcqlStyles.accordionTitle}>Multiple Cards</Text>
            <View style={Theme.DcqlStyles.bothRequiredBadge}>
              <Text style={Theme.DcqlStyles.bothRequiredText}>ALL REQUIRED</Text>
            </View>
          </Row>
          <CheckBox
            checked={isOptionSelected}
            checkedIcon={
              <Icon
                name="check-circle"
                type="material"
                color={Theme.Colors.Icon}
              />
            }
            uncheckedIcon={
              <Icon
                name="radio-button-unchecked"
                color={Theme.Colors.uncheckedIcon}
              />
            }
            onPress={onSelectAll}
            containerStyle={Theme.DcqlStyles.accordionCheckboxContainer}
          />
          <Icon
            name={isExpanded ? 'expand-less' : 'expand-more'}
            color={Theme.Colors.Icon}
          />
        </Row>
      </Pressable>

      {isExpanded && (
        // TODO: Implement the Option handling for multiple VCs matching one credential query
        credentialQueryIds.map((credentialQueryId) => {
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
              onPress={() => {
                return handleVcSelected(vcKey, credentialQueryId);
              }}
              selectable
              selected={isVcSelected(credentialQueryId, vcKey)}
              flow={VCItemContainerFlowType.VP_SHARE}
              isPinned={vcData.vcMetadata.isPinned}
              onDisclosuresChange={disclosures => {
                onDisclosureChange(vcKey, disclosures);
              }}
            />
          );
        })
      )}
    </View>
  );
};
