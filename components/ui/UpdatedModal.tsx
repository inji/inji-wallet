/**
 * TODO: Consolidate this bottom-sheet container with ExpandableListSheetView,
 * StatusInfoModal, KebabPopUp, and ShareableInfoModal. Share presentation,
 * safe-area handling, scrolling, and dismissal;
 * keep each consumer's content and actions separate. Preserve existing fullscreen callers.
 */
import React from 'react';
import {
  I18nManager,
  Modal as RNModal,
  ScrollView,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from './Text';
import {Button} from './Button';
import {Icon} from 'react-native-elements';
import {Column, Row} from '.';
import {Theme, ElevationLevel} from './styleUtils';

const sheetStyles = Theme.BottomSheetStyles;

export const Modal: React.FC<ModalProps> = props => {
  if (props.presentation === 'bottomSheet') {
    return (
      <RNModal
        visible={props.isVisible}
        transparent
        animationType="slide"
        onRequestClose={props.onDismiss}>
        <SafeAreaView style={[sheetStyles.scrim, props.backdropStyle]}>
          <View accessibilityViewIsModal style={sheetStyles.sheet}>
            <ScrollView
              contentContainerStyle={[
                sheetStyles.content,
                props.contentContainerStyle,
              ]}>
              {props.showHandle && (
                <View accessible={false} style={sheetStyles.handle} />
              )}
              {props.headerTitle && (
                <View style={sheetStyles.header}>
                  <View style={sheetStyles.heading} accessibilityRole="header">
                    <Text
                      weight="bold"
                      style={[sheetStyles.title, props.titleStyle]}>
                      {props.headerTitle}
                    </Text>
                  </View>
                  {props.closeIcon && props.closeAccessibilityLabel && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={props.closeAccessibilityLabel}
                      onPress={props.onDismiss}
                      style={sheetStyles.closeButton}>
                      {props.closeIcon}
                    </Pressable>
                  )}
                </View>
              )}
              {props.children}
              {props.closeLabel && (
                <Button
                  styles={sheetStyles.buttonContainer}
                  type={props.closeButtonType ?? 'outline'}
                  title={props.closeLabel}
                  onPress={props.onDismiss}
                />
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </RNModal>
    );
  }
  return (
    <RNModal
      animationType="slide"
      style={Theme.UpdateModalStyles.modal}
      visible={props.isVisible}
      onRequestClose={props.onDismiss}>
      <Column fill>
        <Row padding="16 32" elevation={props.headerElevation}>
          {props.headerRight ? (
            <Icon
              name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
              onPress={props.onDismiss}
              color={Theme.Colors.Icon}
            />
          ) : null}
        </Row>
        {props.children}
      </Column>
    </RNModal>
  );
};

export interface ModalProps {
  children?: React.ReactNode;
  /** Fullscreen remains the default for existing callers. */
  presentation?: 'fullscreen' | 'bottomSheet';
  closeLabel?: string;
  closeButtonType?: 'outline' | 'gradient';
  showHandle?: boolean;
  closeIcon?: React.ReactNode;
  closeAccessibilityLabel?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  isVisible: boolean;
  onDismiss: () => void;
  headerTitle?: string;
  headerElevation?: ElevationLevel;
  headerRight?: React.ReactElement;
}
