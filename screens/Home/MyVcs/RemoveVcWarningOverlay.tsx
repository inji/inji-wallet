import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ActorRefFrom} from 'xstate';
import {useKebabPopUp} from '../../../components/KebabPopUpController';
import {VCMetadata} from '../../../shared/VCMetadata';
import {VCItemEvents} from '../../../machines/VerifiableCredential/VCItemMachine/VCItemMachine';
import {AlertSheet} from '../../../components/revamp/Page';
import {TrashIcon} from '../../../components/revamp/Icons';
import {ScaledText} from '../../../components/revamp/ScaledText';
import {
  CredentialCardFront,
  ScaledCard,
} from '../../../components/revamp/CredentialCard';
import {CredentialCardData} from '../../../components/revamp/useCredentialCard';
import {fonts, radii} from '../../../components/revamp/tokens';
import {useRevampTheme} from '../../../components/revamp/useRevampTheme';

/** Confirms removing a card, showing which one. */
export const RemoveVcWarningOverlay: React.FC<
  RemoveVcWarningOverlayProps
> = props => {
  const controller = useKebabPopUp(props);
  const {t} = useTranslation('RemoveVcWarningOverlay');
  const {c} = useRevampTheme();
  const card = props.card;

  return (
    <AlertSheet
      testID={props.testID}
      isVisible={controller.isRemoveWalletWarning}
      tone="fail"
      icon={colour => <TrashIcon color={colour} />}
      title={t('alert')}
      message={t('removeWarning')}
      primary={{
        testID: 'yesConfirm',
        title: t('confirm'),
        danger: true,
        onPress: controller.CONFIRM,
      }}
      secondary={{
        testID: 'no',
        title: t('cancel'),
        onPress: controller.CANCEL,
      }}
      onRequestClose={controller.CANCEL}>
      {card ? (
        <View
          style={[styles.card, {borderColor: c.line, backgroundColor: c.card}]}>
          <View style={styles.thumb}>
            <ScaledCard width={72}>
              <CredentialCardFront data={card} />
            </ScaledCard>
          </View>
          <View style={styles.text}>
            <ScaledText style={[styles.title, {color: c.ink}]}>
              {card.title}
            </ScaledText>
            <ScaledText style={[styles.detail, {color: c.inkMuted}]}>
              {[card.issuerName, card.holderName].filter(Boolean).join(' · ')}
            </ScaledText>
          </View>
        </View>
      ) : null}
    </AlertSheet>
  );
};

interface RemoveVcWarningOverlayProps {
  testID: string;
  service: ActorRefFrom<typeof VCItemEvents>;
  vcMetadata: VCMetadata;
  /** The card as the home shows it, to name it in the sheet. */
  card?: CredentialCardData;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.card,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {width: 72, height: 46, borderRadius: 6, overflow: 'hidden'},
  text: {flex: 1, gap: 2},
  title: {fontFamily: fonts.semibold, fontSize: 15, lineHeight: 19},
  detail: {fontFamily: fonts.regular, fontSize: 13, lineHeight: 17},
});
