import { useFocusEffect } from '@react-navigation/native';
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Dimensions, ScrollView, View } from 'react-native';
import { ButtonProps as RNEButtonProps } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Column, Row, Text } from '.';
import { Header } from './Header';
import { Theme } from './styleUtils';
import testIDProps from '../../shared/commonUtil';
import { Modal } from './Modal';
import { isIOS } from '../../shared/constants';
import { BackButton } from './backButton/BackButton';

export const ErrorView: React.FC<ErrorProps> = props => {
  const { t } = useTranslation('common');
  const insets = useSafeAreaInsets();
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
    additionalContent,
    textButtonType = 'clear',
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
    const compactHeader = !!additionalContent;

    const headerSection = (
      <View style={[{ alignItems: 'center', marginHorizontal: 1 }, customStyles]}>
        <Row
          align="center"
          style={[
            Theme.ErrorStyles.image,
            customImageStyles,
            compactHeader ? { paddingBottom: 10, marginTop: -20 } : undefined,
          ]}>
          {image}
        </Row>
        <Text style={Theme.ErrorStyles.title} testID={`${testID}Title`}>
          {title}
        </Text>
      </View>
    );

    const buttonsSection = (
      <Column
        crossAlign="center"
        style={{ paddingBottom: Math.max(insets.bottom, isIOS() ? 30 : 20) }}>
        <Row style={{ marginHorizontal: 30, marginBottom: 15 }}>
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
        {textButtonType === 'gradient' ? (
          <Row style={{ marginHorizontal: 30 }}>
            {textButtonText && (
              <Button
                fill
                onPress={textButtonEvent}
                title={t(textButtonText)}
                type="gradient"
                testID={textButtonTestID}
              />
            )}
          </Row>
        ) : (
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
        )}
      </Column>
    );

    if (alignActionsOnEnd) {
      return (
        <Fragment>
          <ScrollView>
            {headerSection}
            {additionalContent ? (
              <View
                style={{ flex: 1 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text
                    style={[
                      Theme.ErrorStyles.message,
                      compactHeader ? { marginBottom: 10 } : undefined,
                    ]}
                    testID={`${testID}Message`}>
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
                {additionalContent}
              </View>
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </ScrollView>
          {buttonsSection}
        </Fragment>
      );
    }

    return (
      <Fragment>
        <View
          style={[{ alignItems: 'center', marginHorizontal: 1 }, customStyles]}>
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
          {additionalContent}
          <View style={{ paddingBottom: insets.bottom, alignItems: 'center' }}>
            {primaryButtonText && (
              <Button
                onPress={primaryButtonEvent}
                title={t(primaryButtonText)}
                type={'gradient'}
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
          </View>
        </View>
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
      showHeader={!!(goBackButtonVisible && goBack)}
      arrowLeft={!!(goBackButtonVisible && goBack)}
      backButtonProps={{type: 'chevron', showBackText: true}}
      isVisible={isVisible}
      showClose={showClose}
      onDismiss={onDismiss}
      {...testIDProps(testID)}>
      <Column
        fill
        safe
        align={alignActionsOnEnd ? 'flex-start' : 'space-evenly'}>
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
        <Column
          fill
          safe
          align={alignActionsOnEnd ? 'flex-start' : 'space-evenly'}>
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
  textButtonType?: RNEButtonProps['type'] | 'gradient';
  exitAppWithTimer?: boolean;
  additionalContent?: React.ReactNode;
}
