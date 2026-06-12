import React, {ReactNode, useCallback, useMemo, useState} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Text} from '../Text';
import {Divider} from '../divider/Divider';
import {Theme} from '../styleUtils';
import {Button} from "../Button";

const DEFAULT_COLLAPSED_ITEM_COUNT = 3;
const SHEET_MAX_HEIGHT = '85%' as const;

type RenderItemParams<T> = {
  item: T;
  index: number;
  isExpanded: boolean;
  isLast: boolean;
};

type ExpandableListSheetViewProps<T> = {
  items: T[];
  testID: string;
  introText: string;
  title: string;
  footerText: string;
  closeText: string;
  showMoreText: (hiddenCount: number) => string;
  alignShowMoreTextAtRight?: boolean;
  visibleItemsStyle?: object;
  badge?: ReactNode;
  collapsedItemCount?: number;
  initialExpanded?: boolean;
  priorityItemPredicate?: (item: T) => boolean;
  renderItem: (params: RenderItemParams<T>) => ReactNode;
  keyExtractor: (item: T, index: number, isExpanded: boolean) => string;
};

function movePriorityItemToFront<T>(
  items: T[],
  priorityItemPredicate?: (item: T) => boolean,
) {
  if (!priorityItemPredicate) {
    return items;
  }

  const priorityIndex = items.findIndex(priorityItemPredicate);

  if (priorityIndex <= 0) {
    return items;
  }

  return [items[priorityIndex], ...items.slice(0, priorityIndex), ...items.slice(priorityIndex + 1)];
}

function getExpandableIds(baseTestID: string) {
  return {
    introText: `${baseTestID}-intro-text`,
    card: `${baseTestID}-card`,
    showMoreButton: `${baseTestID}-show-more-button`,
    modalOverlay: `${baseTestID}-modal-overlay`,
    modalSheet: `${baseTestID}-modal-sheet`,
    modalHandle: `${baseTestID}-modal-handle`,
    modalTitle: `${baseTestID}-modal-title`,
    modalDivider: `${baseTestID}-modal-divider`,
    modalFooter: `${baseTestID}-modal-footer`,
    modalCloseButton: `${baseTestID}-modal-close-button`,
  };
}

export function ExpandableListSheetView<T>({
                                             items,
                                             testID,
                                             introText,
                                             title,
                                             footerText,
                                             closeText,
                                             showMoreText,
                                             alignShowMoreTextAtRight = false,
                                             badge,
                                             visibleItemsStyle,
                                             collapsedItemCount = DEFAULT_COLLAPSED_ITEM_COUNT,
                                             initialExpanded = false,
                                             priorityItemPredicate,
                                             renderItem,
                                             keyExtractor,
                                           }: ExpandableListSheetViewProps<T>) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const orderedItems = useMemo(
    () => movePriorityItemToFront(items, priorityItemPredicate),
    [items, priorityItemPredicate],
  );
  const visibleItems = useMemo(
    () => orderedItems.slice(0, collapsedItemCount),
    [orderedItems, collapsedItemCount],
  );
  const hiddenCount = useMemo(
    () => orderedItems.length - collapsedItemCount,
    [orderedItems.length, collapsedItemCount],
  );
  const ids = useMemo(() => getExpandableIds(testID), [testID]);
  const showMoreLabel = useMemo(() => showMoreText(hiddenCount), [showMoreText, hiddenCount]);

  const openModal = useCallback(() => setExpanded(true), []);
  const closeModal = useCallback(() => setExpanded(false), []);

  return (
    <>
      <Text testID={ids.introText} style={styles.introText}>
        {introText}
      </Text>

      <View testID={ids.card} style={visibleItemsStyle ? visibleItemsStyle : styles.container}>
        {visibleItems.map((item, index) => (
          <React.Fragment
            key={
              keyExtractor?.(item, index, false) ??
              `${testID}-collapsed-item-${index}`
            }>
            {renderItem({
              item,
              index,
              isExpanded: false,
              isLast: index === visibleItems.length - 1,
            })}
          </React.Fragment>
        ))}
      </View>

      {hiddenCount > 0 && (
        <TouchableOpacity
          testID={ids.showMoreButton}
          style={[
            styles.showMoreButton,
            alignShowMoreTextAtRight && styles.showMoreButtonRight,
          ]}
          onPress={openModal}>
          <Text style={styles.showMoreText}>{showMoreLabel}</Text>
        </TouchableOpacity>
      )}

      {expanded && (
        <Modal
          testID={ids.modalOverlay}
          transparent
          visible={expanded}
          animationType="slide"
          onRequestClose={closeModal}>
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.backdrop}
              activeOpacity={1}
              onPress={closeModal}
            />
            <View testID={ids.modalSheet} style={styles.sheet}>
              <View testID={ids.modalHandle} style={styles.handle}/>
              <View style={styles.modalHeader}>
                <Text testID={ids.modalTitle} style={styles.modalTitle}>
                  {title}
                </Text>
                {badge}
              </View>
              <Divider testId={ids.modalDivider}/>
              <ScrollView>
                {orderedItems.map((item, index) => (
                  <React.Fragment
                    key={
                      keyExtractor?.(item, index, true) ??
                      `${testID}-expanded-item-${index}`
                    }>
                    {renderItem({
                      item,
                      index,
                      isExpanded: true,
                      isLast: index === orderedItems.length - 1,
                    })}
                  </React.Fragment>
                ))}
              </ScrollView>
              <Text testID={ids.modalFooter} style={styles.modalFooter}>
                {footerText}
              </Text>
              <Button type="clear" title={closeText} testID={ids.modalCloseButton} onPress={closeModal} styles={{marginBottom: 20, marginTop: -15}}/>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  introText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: Theme.Colors.errorGrayText,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  container: {
    backgroundColor: Theme.Colors.whiteBackgroundColor,
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.Colors.borderBottomColor,
    overflow: 'hidden',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 2,
  },
  showMoreButtonRight: {
    alignSelf: 'flex-end',
    paddingRight: 4
  },
  showMoreText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: Theme.Colors.secondaryText,
  },
  backdrop: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Theme.Colors.whiteBackgroundColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SHEET_MAX_HEIGHT,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.Colors.borderBottomColor,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: Theme.Colors.textValue,
    flex: 1,
  },
  modalFooter: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: Theme.Colors.errorGrayText,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
