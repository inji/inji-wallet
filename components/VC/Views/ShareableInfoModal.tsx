import React from 'react';
import {Overlay} from 'react-native-elements';
import {Text} from '../../../components/ui';
import {Icon} from 'react-native-elements';
import {Theme} from '../../../components/ui/styleUtils';
import {FlatList, View} from 'react-native';
import {Dimensions} from 'react-native';
import {useTranslation} from 'react-i18next';

const maxHeight = Dimensions.get('window').height / 1.5;
export interface ShareableInfoModalProps {
  isVisible: boolean;
  onDismiss: () => void;
  disclosedPaths: string[];
}

type FieldNode = {
  label: string;
  indentLevel: number;
  isArrayItem: boolean;
  isDisclosed: boolean;
};

const parsePathParts = (
  path: string,
): {key: string; isArrayItem: boolean}[] => {
  const parts = path.split('.');
  return parts.map(part => {
    const match = part.match(/^(.+?)(\[\d+\])?$/);
    return {
      key: match?.[1] || part,
      isArrayItem: !!match?.[2],
    };
  });
};

const groupDisclosedFieldsWithArrayInfo = (paths: string[]): FieldNode[] => {
  const tree: any = {};

  paths.forEach(path => {
    const parts = parsePathParts(path);
    let current = tree;

    parts.forEach(({key, isArrayItem}, idx) => {
      const isLeaf = idx === parts.length - 1;

      if (!current[key]) {
        current[key] = {
          _children: {},
          _isArrayItem: isArrayItem,
          _isDisclosed: false,
        };
      }

      // If this is the last part of the path, mark it as disclosed
      if (isLeaf) {
        current[key]._isDisclosed = true;
      }

      // Carry forward array info
      current[key]._isArrayItem = current[key]._isArrayItem || isArrayItem;
      current = current[key]._children;
    });
  });

  const flatten = (node: any, level = 0): FieldNode[] => {
    return Object.entries(node).flatMap(([key, value]: any) => {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, s => s.toUpperCase());

      const entry = [
        {
          label,
          indentLevel: level,
          isArrayItem: value._isArrayItem,
          isDisclosed: value._isDisclosed,
        },
      ];

      const children = flatten(value._children, level + 1);
      return [...entry, ...children];
    });
  };

  return flatten(tree);
};

export const ShareableInfoModal: React.FC<ShareableInfoModalProps> = ({
  isVisible,
  onDismiss,
  disclosedPaths,
}) => {
  const {t} = useTranslation('VcDetails');
  const disclosedFields = groupDisclosedFieldsWithArrayInfo(disclosedPaths);

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onDismiss}
      overlayStyle={{
        ...Theme.DisclosureOverlayStyles.overlay,
        maxHeight,
      }}>
      <View style={{maxHeight}}>
        <View style={Theme.DisclosureOverlayStyles.outerView}>
          <View style={{flex: 1}}>
            <Text style={Theme.DisclosureOverlayStyles.titleText}>
              {t('disclosedFieldsTitle')}
            </Text>
            <Text style={Theme.DisclosureOverlayStyles.titleDescription}>
              {t('disclosedFieldsDescription')}
            </Text>
          </View>

          <Icon
            name="close"
            type="material"
            color={Theme.Colors.blackIcon}
            size={20}
            onPress={onDismiss}
            containerStyle={{position: 'absolute', right: 16, top: 16}}
          />
        </View>

        <FlatList
          data={disclosedFields}
          keyExtractor={(item, index) => item.label + index}
          style={{maxHeight: maxHeight}}
          contentContainerStyle={{
            paddingVertical: 10,
            paddingBottom: 24,
          }}
          renderItem={({item}) => (
            <View
              style={{
                ...Theme.DisclosureOverlayStyles.listView,
                borderColor: item.isDisclosed
                  ? Theme.Colors.lightGreyBackgroundColor
                  : 'white',
                backgroundColor: item.isDisclosed
                  ? Theme.Colors.DetailedViewBackground
                  : 'white',
              }}>
              <Text
                style={{
                  fontSize: 15,
                  paddingLeft: item.indentLevel * 12,
                }}>
                {item.isArrayItem ? '• ' : item.indentLevel > 0 ? '└─ ' : ''}
                {item.label}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={true}
          bounces={true}
        />
        <View style={Theme.DisclosureOverlayStyles.noteView}>
          <Icon
            name="info"
            type="feather"
            color="#973C00"
            size={20}
            containerStyle={{marginRight: 8, marginBottom: 4}}
          />
          <View style={{flex: 1}}>
            <Text style={Theme.DisclosureOverlayStyles.noteTitleText}>
              {t('disclosureNoteTitle')}
            </Text>
            <Text style={Theme.DisclosureOverlayStyles.noteDescriptionText}>
              {t('disclosureNote')}
            </Text>
          </View>
        </View>
      </View>
    </Overlay>
  );
};
