import React from 'react';
import {Pressable, StatusBar, View} from 'react-native';
import {Column, Row, Text} from './ui';
import {Theme} from './ui/styleUtils';
import {Icon} from 'react-native-elements';
import testIDProps from '../shared/commonUtil';
import ErrorToastIcon from '../assets/Error_Toast_Icon.svg';
import InfoToastIcon from '../assets/Info_Toast_Icon.svg';
import SuccessToastIcon from '../assets/Success_Toast_Icon.svg';

export const BannerNotification: React.FC<BannerNotificationProps> = props => {
  return (
    <View {...testIDProps(props.testId)} style={Theme.BannerStyles.wrapper}>
      <Row
        style={[Theme.BannerStyles.container, Theme.BannerStyles[props.type]]}>
        <Row fill>
          {props.type === BannerStatusType.SUCCESS && <SuccessToastIcon />}
          {props.type === BannerStatusType.ERROR && <ErrorToastIcon />}
          {props.type === BannerStatusType.IN_PROGRESS && <InfoToastIcon />}
          <Text
            testID={`${props.testId}Text`}
            color={Theme.Colors.PopupText}
            weight="semibold"
            style={Theme.BannerStyles.text}>
            {props.message}
          </Text>
        </Row>
        <Column>
          <Pressable
            style={Theme.BannerStyles.dismiss}
            {...testIDProps('close')}
            onPress={props.onClosePress}>
            <Icon name="close" color={Theme.Colors.PopupText} size={19} />
          </Pressable>
        </Column>
      </Row>
    </View>
  );
};

export enum BannerStatusType {
  IN_PROGRESS = 'inProgress',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type BannerStatus =
  | BannerStatusType.IN_PROGRESS
  | BannerStatusType.SUCCESS
  | BannerStatusType.ERROR;

export interface BannerNotificationProps {
  message: string;
  onClosePress: () => void;
  testId: string;
  type: BannerStatusType;
}
