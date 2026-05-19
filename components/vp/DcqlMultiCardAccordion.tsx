import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {CheckBox, Icon} from 'react-native-elements';
import {Column, Row, Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {VcItemContainer} from '../VC/VcItemContainer';
import {VCItemContainerFlowType} from '../../shared/Utils';
import {VcWithMatchedClaims} from '../../shared/openID4VP/openid4vp.types';
import {VCMetadata} from '../../shared/VCMetadata';

interface DcqlMultiCardAccordionProps {
  vcDataList: VcWithMatchedClaims[];
  credentialQueryIds: string[];
  isSelected: boolean;
  onSelectAll: () => void;
  controller: any;
  onDisclosureChange: (vcKey: string, disclosures: string[]) => void;
}

export const DcqlMultiCardAccordion: React.FC<DcqlMultiCardAccordionProps> = ({
  vcDataList,
  credentialQueryIds,
  isSelected,
  onSelectAll,
  controller,
  onDisclosureChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getVcKey = (vcData: any): string =>
    VCMetadata.fromVcMetadataString(vcData.vcMetadata).getVcKey();

  return (
    <View style={Theme.DcqlStyles.accordionContainer}>
      <Row style={Theme.DcqlStyles.accordionHeader}>
        <CheckBox
          checked={isSelected}
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
        <Row style={Theme.DcqlStyles.accordionTitleRow}>
          <Text style={Theme.DcqlStyles.accordionTitle}>Multiple Cards</Text>
          <View style={Theme.DcqlStyles.bothRequiredBadge}>
            <Text style={Theme.DcqlStyles.bothRequiredText}>BOTH REQUIRED</Text>
          </View>
        </Row>
        <Pressable
          onPress={() => setIsExpanded(prev => !prev)}
          style={Theme.DcqlStyles.accordionExpandButton}>
          <Icon
            name={isExpanded ? 'expand-less' : 'expand-more'}
            color={Theme.Colors.Icon}
          />
        </Pressable>
      </Row>

      {isExpanded &&
        vcDataList.map((vcWithClaims, idx) => {
          const credentialQueryId = credentialQueryIds[idx];
          const vcData = vcWithClaims.vc;
          const vcKey = getVcKey(vcData);
          return (
            <VcItemContainer
              key={`${vcKey}-${credentialQueryId}`}
              vcMetadata={vcData.vcMetadata}
              margin="0 2 8 2"
              onPress={controller.SELECT_VC_ITEM(vcKey, credentialQueryId)}
              selectable
              selected={isSelected}
              flow={VCItemContainerFlowType.VP_SHARE}
              isPinned={vcData.vcMetadata.isPinned}
              onDisclosuresChange={disclosures => {
                onDisclosureChange(vcKey, disclosures);
              }}
            />
          );
        })}
    </View>
  );
};
