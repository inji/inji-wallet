import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dimensions} from 'react-native';
import {Overlay} from 'react-native-elements';
import {Button, Column, Text, Row} from '../../../components/ui';
import {Theme} from '../../../components/ui/styleUtils';
import {SvgImage} from '../../../components/ui/svg';
import {useKebabPopUp} from '../../../components/KebabPopUpController';
import {VCMetadata} from '../../../shared/VCMetadata';
import {ActorRefFrom} from 'xstate';
import {VCItemEvents} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';

export const RemoveVcWarningOverlay: React.FC<
  RemoveVcWarningOverlayProps
> = props => {
  const controller = useKebabPopUp(props);
  const {t} = useTranslation('RemoveVcWarningOverlay');

  return (
    <Overlay
      isVisible={controller.isRemoveWalletWarning}
      overlayStyle={Theme.BindingVcWarningOverlay.overlay}>
      <Column
        align="space-between"
        crossAlign="center"
        padding={'10'}
        width={Dimensions.get('screen').width * 0.8}
        height={Dimensions.get('screen').height * 0}>
        <Row align="center" crossAlign="center" margin={'0 80 -10 0'}>
          {SvgImage.WarningLogo()}
          <Text
            margin={'0 0 0 -80'}
            color={Theme.Colors.whiteText}
            weight="bold">
            !
          </Text>
        </Row>

        <Column
          crossAlign="center"
          margin="0 10 20 10"
          style={{alignItems: 'center'}}>
          <Text
            testID="alert"
            weight="semibold"
            style={{marginBottom: 16}}
            size="large">
            {t('alert')}
          </Text>

          <Text
            testID="warningMsg"
            align="center"
            size="regular"
            weight="regular"
            color={Theme.Colors.GrayText}>
            {t('removeWarning')}
          </Text>
        </Column>

        <Button
          testID="yesConfirm"
          margin={'30 0 0 0'}
          type="gradient"
          title={t('confirm')}
          onPress={controller.CONFIRM}
        />

        <Button
          testID="no"
          margin={'10 0 0 0'}
          type="clear"
          title={t('cancel')}
          onPress={controller.CANCEL}
        />
      </Column>
    </Overlay>
  );
};

interface RemoveVcWarningOverlayProps {
  testID: string;
  service: ActorRefFrom<typeof VCItemEvents>;
  vcMetadata: VCMetadata;
}
