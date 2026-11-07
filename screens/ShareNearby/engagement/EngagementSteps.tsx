import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Theme} from '../../../components/ui/styleUtils';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import Check from '../../../assets/shareNearby/check.svg';
import type {EngagementStage} from './types';

const engagementStyles = Theme.ShareNearbyEngagementStyles;

export function EngagementSteps({stage}: {stage: EngagementStage | 'sharing'}) {
  const {t} = useTranslation('ShareNearby');
  const activeStepIndex =
    stage === 'showingCode' ? 0 : stage === 'connecting' ? 1 : 2;

  return (
    <View
      style={engagementStyles.stepper}
      accessibilityLabel={t(`engagement.step.${stage}`)}>
      {['show', 'connect', 'share'].map((step, index) => {
        const isActiveStep = index === activeStepIndex;
        const isDoneStep = index < activeStepIndex;
        return (
          <React.Fragment key={step}>
            {index > 0 &&
              (index <= activeStepIndex ? (
                <LinearGradient
                  colors={Theme.Colors.GradientColors}
                  start={Theme.LinearGradientDirection.start}
                  end={Theme.LinearGradientDirection.end}
                  style={engagementStyles.connector}
                />
              ) : (
                <View style={engagementStyles.connector} />
              ))}
            <View style={engagementStyles.step}>
              <View
                style={[
                  engagementStyles.circle,
                  isActiveStep && engagementStyles.activeCircle,
                ]}>
                {isActiveStep && (
                  <LinearGradient
                    colors={Theme.Colors.GradientColors}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={engagementStyles.dot}
                  />
                )}
                {isDoneStep && (
                  <LinearGradient
                    colors={Theme.Colors.GradientColors}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={engagementStyles.doneCircle}>
                    <Check width={12} height={12} />
                  </LinearGradient>
                )}
                {!isActiveStep && !isDoneStep && (
                  <Text weight="bold" style={engagementStyles.stepNumber}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                weight={isActiveStep ? 'bold' : 'regular'}
                style={[
                  engagementStyles.stepLabel,
                  (isActiveStep || isDoneStep) &&
                    engagementStyles.activeStepLabel,
                ]}>
                {t(`engagement.steps.${step}`)}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}
