import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {TitleLineHeight} from './MdocSharePrimitives';
const {brand: B} = Theme.Tokens;

/**
 * M4 — approval accepted; waiting for DeviceAuth signing (the keystore biometric prompt shows
 * over this screen) and the encrypted send. Deliberately has no close action: the response
 * may already be on its way.
 */
export const MdocSendingStep: React.FC<MdocSendingStepProps> = props => {
  const {t} = useTranslation('VcDetails');
  return (
    <View
      testID="mdocSendingStep"
      style={styles.container}
      accessibilityLiveRegion="polite">
      <View style={styles.spinnerHalo}>
        <ActivityIndicator size="large" color={B.onNavy} />
      </View>
      <Text
        testID="mdocSendingTitle"
        weight="bold"
        size="large"
        align="center"
        color={B.onNavy}
        style={TitleLineHeight.large}>
        {t('mdocShare.sendingTitle', {count: props.count})}
      </Text>
      <Text align="center" color={B.mist} margin="6 0 0 0">
        {t('mdocShare.sendingMessage', {verifier: props.verifierName})}
      </Text>
    </View>
  );
};

export interface MdocSendingStepProps {
  count: number;
  verifierName: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: B.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  spinnerHalo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: B.navyFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
});
