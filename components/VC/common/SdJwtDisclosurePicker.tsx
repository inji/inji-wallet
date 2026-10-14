import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {CheckBox, Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {Column, Row, Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {SvgImage} from '../../ui/svg';
import {formatKeyLabel} from './VCUtils';

type DisclosureTree = Record<string, DisclosureTreeNode>;
interface DisclosureTreeNode {
  // True when this path itself is selectively disclosable, not only a parent of one.
  __self: boolean;
  children: DisclosureTree;
}

/**
 * Lets the holder pick which selectively disclosable SD-JWT claims to share. Selecting a
 * nested claim also selects its disclosable parents; clearing a claim clears its children.
 */
export const SdJwtDisclosurePicker: React.FC<SdJwtDisclosurePickerProps> = ({
  disclosedKeys,
  onDisclosuresChange,
}) => {
  const {t} = useTranslation('SendVPScreen');
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {},
  );

  const areAllSelected = disclosedKeys.every(key => selectedFields[key]);

  const toggleSelectAll = () => {
    const updated: Record<string, boolean> = {};
    disclosedKeys.forEach(key => {
      updated[key] = !areAllSelected;
    });
    setSelectedFields(updated);
    onDisclosuresChange(Object.keys(updated).filter(key => updated[key]));
  };

  const toggleField = (path: string) => {
    setSelectedFields(prev => {
      const updated = {...prev, [path]: !prev[path]};
      if (updated[path]) {
        const parts = path.split('.');
        while (parts.length > 1) {
          parts.pop();
          const parent = parts.join('.');
          if (disclosedKeys.includes(parent)) {
            updated[parent] = true;
          }
        }
      } else {
        Object.keys(updated).forEach(key => {
          if (key.startsWith(path + '.') && updated[key]) {
            updated[key] = false;
          }
        });
      }
      onDisclosuresChange(Object.keys(updated).filter(key => updated[key]));
      return updated;
    });
  };

  const toggleExpanded = (path: string) =>
    setExpandedNodes(prev => ({...prev, [path]: !prev[path]}));

  const renderNode = (name: string, node: DisclosureTreeNode, path: string) => (
    <Column key={path}>
      <Row
        crossAlign="center"
        style={{justifyContent: 'space-between', marginBottom: -10}}>
        <Row crossAlign="center">
          {node.__self && (
            <CheckBox
              size={22}
              checked={!!selectedFields[path]}
              checkedIcon={SvgImage.selectedCheckBox()}
              uncheckedIcon={
                <Icon
                  name="check-box-outline-blank"
                  color={Theme.Colors.uncheckedIcon}
                  size={22}
                />
              }
              onPress={() => toggleField(path)}
            />
          )}
          <Text
            weight="semibold"
            color={Theme.Colors.plainText}
            style={{marginLeft: 8}}>
            {formatKeyLabel(name)}
          </Text>
        </Row>
        {Object.keys(node.children).length > 0 && (
          <Pressable
            onPress={() => toggleExpanded(path)}
            style={{marginLeft: 12}}>
            <Icon
              name={expandedNodes[path] ? 'expand-less' : 'expand-more'}
              color={Theme.Colors.Icon}
            />
          </Pressable>
        )}
      </Row>
      {expandedNodes[path] &&
        Object.entries(node.children).map(([childName, childNode]) => (
          <Column key={childName} margin="0 0 0 15">
            {renderNode(childName, childNode, `${path}.${childName}`)}
          </Column>
        ))}
    </Column>
  );

  return (
    <Column padding="8 0">
      <View style={{paddingHorizontal: 6, marginTop: 8}}>
        <View style={{...Theme.Styles.horizontalSeparator, marginBottom: 12}} />
        <Column>
          <Text style={Theme.Styles.disclosureTitle}>
            {t('selectedFieldsTitle')}
          </Text>
          <Text style={Theme.Styles.disclosureSubtitle}>
            {t('selectedFieldsSubtitle')}
          </Text>
        </Column>
        <Row style={{marginTop: 12}} width="100%" align="flex-end">
          <Pressable onPress={toggleSelectAll}>
            <Text
              color={Theme.Colors.Icon}
              style={Theme.Styles.disclosureSelectButton}>
              {areAllSelected ? t('unselectAll') : t('selectAll')}
            </Text>
          </Pressable>
        </Row>
        <View style={{...Theme.Styles.horizontalSeparator, marginTop: 12}} />
      </View>
      {Object.entries(buildDisclosureTree(disclosedKeys)).map(([name, node]) =>
        renderNode(name, node, name),
      )}
    </Column>
  );
};

function buildDisclosureTree(paths: string[]): DisclosureTree {
  const root: DisclosureTree = {};
  paths.forEach(path => {
    let node = root;
    const parts = path.split('.');
    parts.forEach((part, index) => {
      if (!node[part]) {
        node[part] = {__self: false, children: {}};
      }
      if (index === parts.length - 1) {
        node[part].__self = true;
      }
      node = node[part].children;
    });
  });
  return root;
}

interface SdJwtDisclosurePickerProps {
  disclosedKeys: string[];
  onDisclosuresChange: (disclosures: string[]) => void;
}
