import React from 'react';
import {FaceScanner} from '../components/FaceScanner/FaceScanner';
import {Column} from '../components/ui';
import {Theme} from '../components/ui/styleUtils';
import {VerifiableCredential} from '../machines/VerifiableCredential/VCMetaMachine/vc';
import {Modal} from '../components/ui/Modal';
import {useTranslation} from 'react-i18next';
import {AlertSheet, ChoiceList} from '../components/revamp/Page';
import {WarningIcon} from '../components/revamp/Icons';
import {ScaledText} from '../components/revamp/ScaledText';
import {fonts} from '../components/revamp/tokens';
import {useRevampTheme} from '../components/revamp/useRevampTheme';
import {StyleSheet, View} from 'react-native';

export const VerifyIdentityOverlay: React.FC<
  VerifyIdentityOverlayProps
> = props => {
  const {t} = useTranslation('VerifyIdentityOverlay');
  const credential = props.credential;

  const modalProps = {
    isVisible: props.isVerifyingIdentity,
    onDismiss: props.onCancel,
    animationType: 'slide',
    arrowLeft: true,
    headerTitle: t('faceAuth'),
    presentationStyle: 'overFullScreen',
    showClose: true,
    showHeader: true,
  };

  if (props.isLivenessEnabled) {
    modalProps.arrowLeft = false;
    modalProps.headerTitle = '';
    modalProps.showClose = false;
    modalProps.showHeader = false;
  }

  return (
    <>
      <Modal {...modalProps}>
        <Column
          fill
          style={Theme.VerifyIdentityOverlayStyles.content}
          align="center">
          {credential != null && (
            <FaceScanner
              vcImages={props.verifiableCredentialData
                .map(data => data.face)
                .filter(face => face !== undefined)}
              onValid={props.onFaceValid}
              onInvalid={props.onFaceInvalid}
              isLiveness={props.isLivenessEnabled}
              onCancel={props.onCancel}
            />
          )}
        </Column>
      </Modal>

      <AlertSheet
        testID="shareWithSelfieError"
        isVisible={props.isInvalidIdentity}
        tone="warn"
        icon={colour => <WarningIcon color={colour} />}
        title={t('ScanScreen:postFaceCapture.captureFailureTitle')}
        message={t('ScanScreen:postFaceCapture.captureFailureMessage')}
        primary={{
          testID: 'retry',
          title: t('ScanScreen:postFaceCapture.retakeSelfie'),
          onPress: props.onRetryVerification,
        }}
        secondary={{
          testID: 'home',
          title: t('ScanScreen:postFaceCapture.cancelSharing'),
          onPress: props.onNavigateHome,
        }}
        dismissOnBackdropPress={false}
        onRequestClose={props.onNavigateHome}>
        <FaceTips />
      </AlertSheet>
    </>
  );
};

export interface VerifyIdentityOverlayProps {
  credential?: [VerifiableCredential | Credential];
  verifiableCredentialData: any;
  isVerifyingIdentity: boolean;
  onCancel: () => void;
  onFaceValid: () => void;
  onFaceInvalid: () => void;
  isInvalidIdentity: boolean;
  onNavigateHome: () => void;
  onRetryVerification: () => void;
  isLivenessEnabled: boolean;
}

const FaceTips: React.FC = () => {
  const {t} = useTranslation('ScanScreen');
  const {c} = useRevampTheme();
  const tips = ['faceTipLight', 'faceTipGlasses', 'faceTipFrame'];
  return (
    <ChoiceList>
      {tips.map(tip => (
        <View key={tip} style={tipStyles.row}>
          <View style={[tipStyles.dot, {backgroundColor: c.azureInk}]} />
          <ScaledText style={[tipStyles.text, {color: c.ink}]}>
            {t(`postFaceCapture.${tip}`)}
          </ScaledText>
        </View>
      ))}
    </ChoiceList>
  );
};

const tipStyles = StyleSheet.create({
  row: {
    minHeight: 46,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {width: 6, height: 6, borderRadius: 3},
  text: {flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 19},
});
