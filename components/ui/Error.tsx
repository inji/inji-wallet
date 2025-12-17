import {useFocusEffect} from '@react-navigation/native';
import React, {Fragment, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BackHandler, Dimensions, View} from 'react-native';
import {ButtonProps as RNEButtonProps} from 'react-native-elements';
import {Button, Column, Row, Text} from '.';
import {Header} from './Header';
import {Theme} from './styleUtils';
import testIDProps from '../../shared/commonUtil';
import {Modal} from './Modal';
import {isIOS} from '../../shared/constants';

export const ErrorView: React.FC<ErrorProps> = props => {
  const {t} = useTranslation('common');
  const {
    testID,
    customStyles = {},
    customImageStyles = {},
    goBackType,
    isModal = false,
    isVisible,
    showClose = true,
    alignActionsOnEnd = false,
    title,
    message,
    additionalMessage,
    helpText,
    image,
    goBack,
    goBackButtonVisible = false,
    tryAgain,
    onDismiss,
    primaryButtonText,
    primaryButtonEvent,
    testIDTextButton,
    textButtonText,
    textButtonEvent,
    primaryButtonTestID,
    textButtonTestID,
  } = props;

  const [triggerExitFlow, setTriggerExitFlow] = useState(false);

  useEffect(() => {
    if (props.exitAppWithTimer) {
      const timeout = setTimeout(
        () => {
          setTriggerExitFlow(true);
        },
        isIOS() ? 4000 : 2000,
      );

      return () => clearTimeout(timeout);
    }
  }, [props.exitAppWithTimer]);

  useEffect(() => {
    if (triggerExitFlow) {
      props.textButtonEvent();
      BackHandler.exitApp();
    }
  }, [triggerExitFlow]);

  const errorContent = () => {
    return (
      <Fragment>
        <View
          style={[{alignItems: 'center', marginHorizontal: 1}, customStyles]}>
          <View>
            <Row
              align="center"
              style={[Theme.ErrorStyles.image, customImageStyles]}>
              {image}
            </Row>
            <Text style={Theme.ErrorStyles.title} testID={`${testID}Title`}>
              {title}
            </Text>
            <Text style={Theme.ErrorStyles.message} testID={`${testID}Message`}>
              {message}
            </Text>
            {additionalMessage && (
              <Text
                style={Theme.ErrorStyles.additionalMessage}
                testID={`${testID}AdditionalMessage`}>
                {additionalMessage}
              </Text>
            )}
          </View>
          {!alignActionsOnEnd && (
            <Fragment>
              {primaryButtonText && (
                <Button
                  onPress={primaryButtonEvent}
                  title={t(primaryButtonText)}
                  type={
                    primaryButtonText === 'tryAgain' ? 'outline' : 'gradient'
                  }
                  width={
                    primaryButtonText === 'tryAgain'
                      ? Dimensions.get('screen').width * 0.54
                      : undefined
                  }
                  testID={primaryButtonTestID}
                />
              )}
              {textButtonText && (
                <Button
                  onPress={textButtonEvent}
                  width={Dimensions.get('screen').width * 0.54}
                  title={t(textButtonText)}
                  type="clear"
                  testID={textButtonTestID}
                />
              )}
            </Fragment>
          )}
        </View>
        {alignActionsOnEnd && (
          <Column fill crossAlign="center" align="flex-end" margin="0 0 30 0">
            <Row style={{marginHorizontal: 30, marginBottom: 15}}>
              {primaryButtonText && (
                <Button
                  fill
                  onPress={primaryButtonEvent}
                  title={t(primaryButtonText)}
                  type="gradient"
                  testID={primaryButtonTestID}
                />
              )}
            </Row>
            <Row>
              {textButtonText && (
                <Button
                  onPress={textButtonEvent}
                  title={t(textButtonText)}
                  type="clear"
                  testID={textButtonTestID}
                />
              )}
            </Row>
          </Column>
        )}
      </Fragment>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        onDismiss && onDismiss();
        return true;
      };

      const disableBackHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => disableBackHandler.remove();
    }, []),
  );

  return isModal ? (
    <Modal
      isVisible={isVisible}
      showClose={showClose}
      onDismiss={onDismiss}
      {...testIDProps(testID)}>
      <Column
        fill
        safe
        align={alignActionsOnEnd ? 'space-around' : 'space-evenly'}>
        {errorContent()}
      </Column>
    </Modal>
  ) : (
    <View
      style={{
        ...Theme.ModalStyles.modal,
        backgroundColor: Theme.Colors.whiteBackgroundColor,
      }}
      {...testIDProps(testID)}>
      <Column fill safe>
        {goBack && <Header testID="errorHeader" goBack={goBack} />}
        <Column fill safe align="space-evenly">
          {errorContent()}
        </Column>
      </Column>
    </View>
  );
};

export interface ErrorProps {
  testID: string;
  customStyles?: {};
  customImageStyles?: {};
  goBackType?: RNEButtonProps['type'] | 'gradient';
  isModal?: boolean;
  isVisible: boolean;
  showClose?: boolean;
  alignActionsOnEnd?: boolean;
  title: string;
  message: string;
  additionalMessage?: string;
  helpText?: string;
  image: React.ReactElement;
  goBack?: () => void;
  goBackButtonVisible?: boolean;
  tryAgain?: null | (() => void);
  onDismiss?: () => void;
  primaryButtonText?: string;
  primaryButtonEvent?: () => void;
  testIDTextButton?: string | null;
  textButtonText?: string;
  textButtonEvent?: () => void;
  primaryButtonTestID?: string;
  textButtonTestID?: string;
  exitAppWithTimer?: boolean;
}
