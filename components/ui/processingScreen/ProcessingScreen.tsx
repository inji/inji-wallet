import React from 'react';
import {Dimensions, SafeAreaView, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Text} from '../Text';
import {Modal} from '../Modal';
import {Button} from '../Button';
import {SvgImage} from '../svg';
import {Theme} from '../styleUtils';

const injiLogoGif = require('../../../assets/gif/logo.gif');

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  label,
  completed,
}) => {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressIcon}>{SvgImage.circleArrowRight()}</View>
      <Text
        size="small"
        weight={'semibold'}
        color={styles.progressText.color}
        style={styles.progressText}>
        {label}
      </Text>
      <View style={styles.progressCheck}>
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
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  title,
  subTitle,
  progressSteps,
  action,
}) => {
  return (
    <Modal isVisible={true} showHeader={false} modalStyle={styles.modalBg}>
      <SafeAreaView style={styles.container}>
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <FastImage
              source={injiLogoGif}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text weight={'bold'} size={'large'} style={styles.title}>
              {title}
            </Text>
            <Text size={'small'} weight={'extraLight'} style={styles.subTitle}>
              {subTitle}
            </Text>
            <View style={styles.progressContainer}>
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
}

const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 340);
const CARD_PADDING = SCREEN_HEIGHT * 0.03;
const CARD_MARGIN_HORIZONTAL = 40;

const styles = StyleSheet.create({
  modalBg: {
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  cardWrapper: {
    flex: 1,
    top: 160,
    alignItems: 'center',
    width: '100%',
    marginTop: 0,
    marginBottom: 80,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: CARD_PADDING,
    marginHorizontal: CARD_MARGIN_HORIZONTAL,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 1,
  },
  logo: {
    width: CARD_WIDTH * 0.7,
    height: CARD_WIDTH * 0.55,
    marginBottom: -5,
  },
  title: {
    marginTop: 0,
    marginBottom: 6,
    textAlign: 'center',
  },
  subTitle: {
    color: '#888',
    marginBottom: SCREEN_HEIGHT * 0.025,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 7,
    marginBottom: 0,
    paddingHorizontal: CARD_WIDTH * 0.15,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressIcon: {
    marginRight: 8,
  },
  progressText: {
    flex: 1,
    color: '#B0B0B0',
    fontWeight: '400',
  },
  progressCheck: {
    marginLeft: 8,
  },
  actionWrapper: {
    flex: 1,
    position: 'absolute',
    bottom: 62,
  },
});
