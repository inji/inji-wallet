import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {Text} from '../ui';
import {BottomSheet} from '../ui/BottomSheet';
import {PillButton} from '../ui/PillButton';
import {ShieldIcon} from '../ui/ShieldIcon';
import {Theme} from '../ui/styleUtils';
import testIDProps from '../../shared/commonUtil';

const {colors: C, brand: B, elevation: E} = Theme.Tokens;

/** First step of adding a credential: pick how to add it. */
export const AddToWalletSheet: React.FC<AddToWalletSheetProps> = props => {
  const {t} = useTranslation('AddToWallet');

  return (
    <BottomSheet
      testID="addToWalletSheet"
      isVisible={props.isVisible}
      onRequestClose={props.onCancel}
      onClosed={props.onClosed}>
      <Text
        testID="addToWalletTitle"
        weight="bold"
        color={C.ink}
        style={styles.title}>
        {t('title')}
      </Text>
      <Text color={C.inkMuted} style={styles.subtitle}>
        {t('subtitle')}
      </Text>

      <AddOption
        testID="scanToAddOption"
        title={t('scanToAdd.title')}
        description={t('scanToAdd.description')}
        icon="qrcode-scan"
        onPress={props.onScanToAdd}
      />

      <View style={styles.note}>
        <ShieldIcon mark="check" size={18} color={C.pass} />
        <Text size="extraSmall" color={C.inkMuted} style={styles.noteText}>
          {t('signedNote')}
        </Text>
      </View>

      <PillButton
        testID="addToWalletCancel"
        variant="linkInk"
        title={t('common:cancel')}
        onPress={props.onCancel}
        style={styles.cancel}
      />
    </BottomSheet>
  );
};

const AddOption: React.FC<AddOptionProps> = props => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={props.title}
    {...testIDProps(props.testID)}
    onPress={props.onPress}
    style={({pressed}) => [styles.option, pressed && styles.optionPressed]}>
    <View style={styles.optionIcon}>
      <Icon
        name={props.icon}
        type="material-community"
        size={22}
        color={B.onNavy}
      />
    </View>
    <View style={styles.optionBody}>
      <Text weight="semibold" color={C.ink} style={styles.optionTitle}>
        {props.title}
      </Text>
      <Text
        size="extraSmall"
        color={C.inkMuted}
        style={styles.optionDescription}>
        {props.description}
      </Text>
    </View>
    <Icon name="chevron-right" type="material" size={24} color={C.ink} />
  </Pressable>
);

interface AddToWalletSheetProps {
  isVisible: boolean;
  onScanToAdd: () => void;
  onCancel: () => void;
  onClosed?: () => void;
}

interface AddOptionProps {
  testID: string;
  title: string;
  description: string;
  /** MaterialCommunityIcons name. */
  icon: string;
  onPress: () => void;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...E.card,
  },
  optionPressed: {
    backgroundColor: C.sand,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: B.navy,
  },
  optionBody: {
    flex: 1,
    marginRight: 8,
  },
  optionTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  optionDescription: {
    marginTop: 4,
    lineHeight: 17,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    marginLeft: 10,
    lineHeight: 17,
  },
  cancel: {
    marginTop: 12,
  },
});
