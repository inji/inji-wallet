import React from 'react';
import {
  I18nManager,
  Modal as RNModal,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {Column, Row, Text} from '.';
import {useSendVcScreen} from '../../screens/Scan/SendVcScreenController';
import {DeviceInfoList} from '../DeviceInfoList';
import {ElevationLevel, Theme} from './styleUtils';
import testIDProps from '../../shared/commonUtil';
import {BackButton} from './backButton/BackButton';

export const Modal: React.FC<ModalProps> = ({
  testID,
  isVisible,
  requester,
  showClose = true,
  showHeader = true,
  modalStyle = Theme.ModalStyles.defaultModal,
  onDismiss,
  headerTitle,
  headerElevation,
  headerLabel,
  headerLabelColor,
  headerRight,
  headerLeft,
  arrowLeft,
  onShow,
  children,
}) => {
  const controller = useSendVcScreen();

  return (
    <RNModal
      {...testIDProps(testID)}
      animationType="slide"
      style={modalStyle}
      visible={isVisible}
      onShow={onShow}
      onRequestClose={onDismiss}>
      <Column {...(showHeader ? {fill: true, safe: true} : {fill: true})}>
        {showHeader ? (
          <Row elevation={headerElevation}>
            <View style={modalStyle}>
              {headerRight && !arrowLeft ? (
                <Icon
                  {...testIDProps('closeModal')}
                  name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
                  onPress={onDismiss}
                  color={Theme.Colors.Icon}
                />
              ) : null}
              {arrowLeft && onDismiss ? (
                <BackButton onPress={onDismiss} />
              ) : null}
              <Row
                fill
                align={headerLeft ? 'flex-start' : 'center'}
                margin={arrowLeft ? '16 0 0 -15' : '16 0 0 10'}>
                <Column>
                  <Text testID={testID} style={Theme.TextStyles.header}>
                    {headerTitle || headerLeft}
                  </Text>
                  {!requester ? (
                    <Text
                      weight="semibold"
                      style={Theme.TextStyles.small}
                      color={
                        headerLabelColor
                          ? headerLabelColor
                          : Theme.Colors.textLabel
                      }>
                      {headerLabel}
                    </Text>
                  ) : (
                    <Text
                      weight="semibold"
                      style={Theme.TextStyles.small}
                      color={Theme.Colors.IconBg}>
                      <DeviceInfoList deviceInfo={controller.receiverInfo} />
                    </Text>
                  )}
                </Column>
              </Row>
              {headerRight != null ||
                arrowLeft ||
                (showClose && (
                  <TouchableOpacity
                    {...testIDProps('close')}
                    onPress={onDismiss}>
                    <Icon name="close" color={Theme.Colors.Details} size={27} />
                  </TouchableOpacity>
                ))}
              {headerRight}
            </View>
          </Row>
        ) : null}
        {children}
      </Column>
    </RNModal>
  );
};

export interface ModalProps {
  testID?: string;
  isVisible: boolean;
  requester?: boolean;
  showClose?: boolean;
  showHeader?: boolean;
  modalStyle?: Object;
  onDismiss?: () => void;
  headerTitle?: string;
  headerElevation?: ElevationLevel;
  headerLabel?: string;
  headerLabelColor?: string;
  headerRight?: React.ReactElement;
  headerLeft?: React.ReactElement;
  arrowLeft?: boolean;
  onShow?: () => void;
  children?: React.ReactNode;
}
