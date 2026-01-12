import React from 'react';
import {SafeAreaView, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Text} from '../Text';
import {Modal} from '../Modal';
import {Button} from '../Button';
import {SvgImage} from '../svg';
import {Theme} from '../styleUtils';
import testIDProps from '../../../shared/commonUtil';

import injiLogoGif from '../../../assets/gif/logo.gif';

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  label,
  completed,
  testID,
}) => {
  return (
    <View
      style={styles.progressRow}
      {...testIDProps(`progress-indicator-${testID}`)}>
      <View
        style={styles.progressIcon}
        {...testIDProps(`${testID}-circle-arrow-right`)}>
        {SvgImage.circleArrowRight()}
      </View>
      <Text
        size="small"
        weight={'semibold'}
        color={styles.progressText.color}
        style={styles.progressText}
        {...testIDProps(`${testID}-label`)}>
        {label}
      </Text>
      <View
        style={styles.progressCheck}
        {...testIDProps(`${testID}-${completed ? 'done' : 'undone'}-icon`)}>
        {SvgImage.doneIcon(
          completed ? Theme.Colors.VerifiedIcon : Theme.Colors.disabled,
        )}
      </View>
    </View>
  );
};

export interface ProgressIndicatorProps {
  label: string;
  completed: boolean;
  testID: string;
}

export const ProcessingModal: React.FC<ProcessingScreenProps> = ({
  title,
  subTitle,
  progressSteps,
  action,
  isVisible,
  testID,
}) => {
  return (
    <Modal isVisible={isVisible} showHeader={false} modalStyle={styles.modalBg}>
      <SafeAreaView style={styles.container}>
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <FastImage
              testID={`inji-logo-gif-${testID}`}
              source={injiLogoGif}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              weight={'bold'}
              size={'large'}
              style={styles.title}
              testID={`${testID}-title`}>
              {title}
            </Text>
            <Text
              size={'small'}
              weight={'extraLight'}
              style={styles.subTitle}
              testID={`${testID}-subtitle`}>
              {subTitle}
            </Text>
            <View
              style={styles.progressContainer}
              {...testIDProps(`progress-steps-${testID}`)}>
              {progressSteps.map((progressStep, idx) => (
                <React.Fragment key={idx}>{progressStep}</React.Fragment>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.actionWrapper}>{action}</View>
      </SafeAreaView>
    </Modal>
  );
};

export interface ProcessingScreenProps {
  title: string;
  subTitle: string;
  progressSteps: React.ReactElement<typeof ProgressIndicator>[];
  action: React.ReactElement<typeof Button>;
  isVisible: boolean;
  testID: string;
}

const styles = Theme.ProcessingModalStyles;
