import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, Animated, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {MdocShareHeader} from './MdocSharePrimitives';

const {colors: C, brand: B} = Theme.Tokens;

type StepState = 'done' | 'active' | 'pending';

/**
 * M2 — a reader attached over BLE and the session is being set up. Scan + connection are
 * known facts at this point; the remaining two finish together when the DeviceRequest lands
 * (which moves the flow on to consent), so they show as in progress / pending until then.
 */
export const MdocConnectingStep: React.FC<MdocConnectingStepProps> = props => {
  const {t} = useTranslation('VcDetails');
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [ring]);

  const steps: Array<{label: string; state: StepState}> = [
    {label: t('mdocShare.stepQrScanned'), state: 'done'},
    {label: t('mdocShare.stepBluetoothConnected'), state: 'done'},
    {label: t('mdocShare.stepSecureSession'), state: 'active'},
    {label: t('mdocShare.stepReceivingRequest'), state: 'pending'},
  ];

  return (
    <View style={styles.container}>
      <MdocShareHeader
        variant="dark"
        title={props.title}
        onClose={props.onCancel}
        closeLabel={t('mdocShare.close')}
      />
      <View style={styles.body}>
        <View style={styles.pulseArea}>
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ring.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 0],
                }),
                transform: [
                  {
                    scale: ring.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.innerRing}>
            <View style={styles.core}>
              <Icon
                name="bluetooth"
                type="material"
                size={30}
                color={B.onNavy}
              />
            </View>
          </View>
        </View>
        <Text
          testID="mdocConnectingTitle"
          weight="bold"
          size="large"
          align="center"
          color={B.onNavy}>
          {t('mdocShare.connectingTitle')}
        </Text>
        <Text align="center" color={B.mist} margin="6 0 24 0">
          {t('mdocShare.connectingMessage')}
        </Text>
        <View style={styles.checklist} accessibilityLiveRegion="polite">
          {steps.map((step, index) => (
            <View
              key={step.label}
              testID={`mdocConnectingStep-${index}-${step.state}`}
              style={[
                styles.stepRow,
                step.state === 'active' && styles.stepRowActive,
              ]}>
              <StepIndicator state={step.state} />
              <Text
                size="smaller"
                weight={step.state === 'pending' ? 'regular' : 'semibold'}
                color={step.state === 'pending' ? B.mist : B.onNavy}
                style={styles.stepLabel}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const StepIndicator: React.FC<{state: StepState}> = ({state}) => {
  if (state === 'done') {
    return (
      <View style={[styles.indicator, styles.indicatorDone]}>
        <Icon name="check" type="material" size={14} color={B.onNavy} />
      </View>
    );
  }
  if (state === 'active') {
    return (
      <View style={styles.indicator}>
        <ActivityIndicator size="small" color={B.cyan} />
      </View>
    );
  }
  return <View style={[styles.indicator, styles.indicatorPending]} />;
};

export interface MdocConnectingStepProps {
  title: string;
  onCancel: () => void;
}

const PULSE_SIZE = 180;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: B.navy,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  pulseArea: {
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ring: {
    position: 'absolute',
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    borderRadius: PULSE_SIZE / 2,
    backgroundColor: B.cyanTint,
    borderWidth: 1,
    borderColor: B.navyLine,
  },
  innerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: B.navyFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: B.navyLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklist: {
    backgroundColor: B.navyFill,
    borderColor: B.navyLine,
    borderWidth: 1,
    borderRadius: 16,
    padding: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  stepRowActive: {
    backgroundColor: B.navyFill,
  },
  stepLabel: {
    flex: 1,
    marginLeft: 12,
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorDone: {
    backgroundColor: C.pass,
  },
  indicatorPending: {
    borderWidth: 1.5,
    borderColor: B.navyLine,
  },
});
