import React, {useRef, useState} from 'react';
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  findNodeHandle,
  UIManager,
} from 'react-native';
import {Theme} from './styleUtils';

interface CustomTooltipProps {
  triggerComponent: React.ReactNode;
  toolTipContent: React.ReactNode;
  width?: number;
  maxHeight?: number;
}

export const TOOLTIP_MARGIN = 6;
export const SCREEN_PADDING = 10;
export const POINTER_SIZE = 12;

export const CustomTooltip = ({
  triggerComponent,
  toolTipContent,
  width = 275,
  maxHeight = 300,
}: CustomTooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({x: 0, y: 0});
  const [pointerLeft, setPointerLeft] = useState(20);
  const [showAbove, setShowAbove] = useState(false);

  const iconRef = useRef<View>(null);
  const screen = Dimensions.get('window');

  const showTooltip = () => {
    if (!iconRef.current) return;
    const handle = findNodeHandle(iconRef.current);
    if (!handle) return;

    try {
      UIManager.measureInWindow(handle, (x, y, w, h) => {
        if (w === 0 && h === 0) return;

        let tooltipX = x;
        let tooltipY = y + h + TOOLTIP_MARGIN;
        let showAboveTooltip = false;
        const iconCenterX = x + w / 2;

        if (tooltipX + width > screen.width) {
          tooltipX = screen.width - width - SCREEN_PADDING;
        }
        if (tooltipX < SCREEN_PADDING) {
          tooltipX = SCREEN_PADDING;
        }

        if (tooltipY + maxHeight > screen.height) {
          tooltipY = y - maxHeight - TOOLTIP_MARGIN * 2;
          showAboveTooltip = true;
        }
        if (tooltipY < SCREEN_PADDING) {
          tooltipY = SCREEN_PADDING;
          showAboveTooltip = false;
        }

        const calculatedPointerLeft = iconCenterX - tooltipX - POINTER_SIZE / 2;
        setPointerLeft(
          Math.min(
            Math.max(calculatedPointerLeft, SCREEN_PADDING),
            width - SCREEN_PADDING,
          ),
        );
        setShowAbove(showAboveTooltip);
        setPosition({x: tooltipX, y: tooltipY});
        setVisible(true);
      });
    } catch (e) {
      console.warn('Tooltip positioning failed:', e);
    }
  };

  return (
    <>
      <View ref={iconRef} collapsable={false}>
        <TouchableOpacity onPress={showTooltip} style={{marginLeft: 5}}>
          {triggerComponent}
        </TouchableOpacity>
      </View>

      {visible && (
        <Modal
          transparent
          visible={visible}
          animationType="fade"
          hardwareAccelerated
          onRequestClose={() => setVisible(false)}>
          <Pressable
            style={Theme.Styles.tooltipOverlay}
            onPress={() => setVisible(false)}
          />
          <View
            style={[
              Theme.Styles.tooltip,
              {width, top: position.y, left: position.x},
            ]}>
            <View
              style={[
                Theme.Styles.pointer,
                {
                  left: pointerLeft,
                  top: showAbove ? undefined : -POINTER_SIZE / 2,
                  bottom: showAbove ? -POINTER_SIZE / 2 : undefined,
                  transform: [{rotate: showAbove ? '180deg' : '0deg'}],
                },
              ]}
            />
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={{maxHeight, overflow: 'hidden'}}
              contentContainerStyle={{padding: 15}}>
              {toolTipContent}
            </ScrollView>
          </View>
        </Modal>
      )}
    </>
  );
};
