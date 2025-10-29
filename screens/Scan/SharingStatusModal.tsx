import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../components/ui/styleUtils';
import { Modal } from '../../components/ui/Modal';
import { Pressable, Dimensions, BackHandler, View, Image } from 'react-native';
import { Button, Column, Row, Text } from '../../components/ui';
import testIDProps from '../../shared/commonUtil';
import { SvgImage } from '../../components/ui/svg';
import { isIOS } from '../../shared/constants';

export const SharingStatusModal: React.FC<SharingStatusModalProps> = props => {
  const { t } = useTranslation('ScanScreen');
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = !!props.verifierLogo && !logoFailed;
  const resetAndExit = () => {
    BackHandler.exitApp();
    props.goToHome();
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;

    if (props.isVisible && props.buttonStatus === 'none') {
      timeoutId = setTimeout(
        () => {
          resetAndExit();
        },
        isIOS() ? 4000 : 2000,
      );
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [props.isVisible, props.buttonStatus]);
  return (
    <React.Fragment>
      <Modal
        isVisible={props.isVisible}
        showClose={false}
        {...testIDProps(props.testId)}>
        <Column
          margin="64 0"
          crossAlign="center"
          style={Theme.SelectVcOverlayStyles.sharedSuccessfully}>
          {props.image}
          <Text
            testID="sharingStatusTitle"
            margin="20 0"
            style={Theme.TextStyles.bold}
            size={'large'}>
            {props.title}
          </Text>
          <Text
            testID="sharingStatusMessage"
            align="center"
            margin="0 33 0 33"
            style={Theme.TextStyles.regular}
            color={Theme.Colors.statusMessage}>
            {props.message}
          </Text>
          <Text
            testID="sharingStatusAdditionalMessage"
            margin="20 0"
            style={Theme.TextStyles.bold}
            size={'large'}>
            {props.additionalMessage}
          </Text>
          {(props.verifierLogo || props.verifierName) && <Row
            align="center"
            style={Theme.SelectVcOverlayStyles.sharedSuccessfullyVerifierInfo}
          >
            {showLogo && (
              <Image
                source={{ uri: props.verifierLogo }}
                style={Theme.SelectVcOverlayStyles.sharedSuccessfullyVerifierLogo}
                resizeMode="contain"
                onError={() => setLogoFailed(true)}
              />
            )}
            <View style={{ alignItems: 'flex-start' }}>
              <Text
                style={Theme.TextStyles.bold}
              >
                {props.verifierName}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#666',
                  marginTop: 2,
                }}
              >
                {`Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </Text>
            </View>
          </Row>}
        </Column>
        {props.buttonStatus === 'homeAndHistoryIcons' ? (
          <Row
            align="space-evenly"
            style={{ marginBottom: Dimensions.get('screen').height * 0.06 }}>
            <Column>
              <Pressable
                accessible={false}
                testID="successfullyVcSharedHomeIcon"
                style={{ height: 75, justifyContent: 'space-between' }}
                onPress={props.goToHome}>
                {SvgImage.SuccessHomeIcon()}
                <Text align="center" weight="bold">
                  {t('status.accepted.home')}
                </Text>
              </Pressable>
            </Column>

            <Column>
              <Pressable
                accessible={false}
                testID="successfullyVcSharedHistoryIcon"
                style={{ height: 75, justifyContent: 'space-between' }}
                onPress={props.goToHistory}>
                {SvgImage.SuccessHistoryIcon()}
                <Text align="center" weight="bold">
                  {t('status.accepted.history')}
                </Text>
              </Pressable>
            </Column>
          </Row>
        ) : null}
        {props.gradientButtonTitle && (
          <Column
            style={{ marginBottom: Dimensions.get('screen').height * 0.012 }}>
            <Button
              testID="failedVcSharedRetryButton"
              type="gradient"
              title={props.gradientButtonTitle}
              onPress={props.onGradientButton}
            />
          </Column>
        )}
        {props.clearButtonTitle && (
          <Column align="center">
            <Button
              testID="failedVcSharedHomeButton"
              type="clear"
              styles={{ marginBottom: 9 }}
              title={props.clearButtonTitle}
              onPress={props.onClearButton}
            />
          </Column>
        )}
      </Modal>
    </React.Fragment>
  );
};

interface SharingStatusModalProps {
  isVisible: boolean;
  testId: string;
  buttonStatus?: 'homeAndHistoryIcons' | 'none';
  title: String;
  message: String;
  additionalMessage?: String;
  image: React.ReactElement;
  gradientButtonTitle?: String;
  clearButtonTitle?: String;
  goToHome?: () => void;
  goToHistory?: () => void;
  onGradientButton?: () => void;
  onClearButton?: () => void;
  verifierName?: string;
  verifierLogo?: string;
}
