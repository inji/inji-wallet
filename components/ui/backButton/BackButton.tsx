import React from 'react';
import { I18nManager, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import testIDProps from '../../../shared/commonUtil';
import { Theme } from '../styleUtils';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '../Text';
import { useTranslation } from 'react-i18next';
import { Row } from '../Layout';

export const BackButton: React.FC<BackButtonProps> = (
  props: BackButtonProps,
) => {
  let containerStyle: object = Theme.Styles.backArrowContainer;
  const backIconType = props.type ?? 'arrow';
  const { t } = useTranslation('common');

  if (props.customIconStyle)
    containerStyle = { ...containerStyle, ...props.customIconStyle };

  if (backIconType === 'chevron') {
    return (
      <TouchableOpacity
        onPress={props.onPress}
        {...testIDProps('goBack')}
        style={{ zIndex: 1 }}>
        <Row crossAlign='center' align='center'>
          <Icon
            name={I18nManager.isRTL ? 'chevron-right' : 'chevron-left'}
            type="material-community"
            onPress={props.onPress}
            iconStyle={props.customIconStyle}
            size={30}
          />
          {props.showBackText && <Text>{t('back')}</Text>}
        </Row>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={props.onPress}
      {...testIDProps('goBack')}
      style={{ zIndex: 1 }}>
      <LinearGradient
        start={Theme.LinearGradientDirection.start}
        end={Theme.LinearGradientDirection.end}
        colors={Theme.Colors.GradientColorsLight}
        style={{ borderRadius: 10 }}>
        <Icon
          {...testIDProps('arrow-left')}
          name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
          type="material-community"
          onPress={props.onPress}
          containerStyle={containerStyle}
          color={Theme.Colors.Icon}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

interface BackButtonProps {
  onPress: () => void;
  customIconStyle?: object;
  type?: 'arrow' | 'chevron';
  showBackText?: boolean;
}
