import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {VCMetadata} from '../../shared/VCMetadata';
import {getDisplayObjectForCurrentLanguage} from '../../shared/openId4VCI/Utils';
import {Theme} from '../ui/styleUtils';
import {VCCardSkeleton} from './common/VCCardSkeleton';
import {
  Display,
  getCredentialType,
  getSharedFieldLabels,
} from './common/VCUtils';
import {SdJwtDisclosurePicker} from './common/SdJwtDisclosurePicker';
import {useVcCardData} from './useVcCardData';

const COLORS = Theme.Colors.Design;

/**
 * One matching credential on the OpenID4VP share screen: a small card thumbnail, the card
 * type and issuer, what sharing it sends, and a pick-one selection marker. When an SD-JWT
 * card is selected, its disclosure picker opens beneath it.
 */
export const VPShareCredentialCard: React.FC<VPShareCredentialCardProps> = ({
  vcMetadata,
  selected,
  selectedDisclosures = [],
  onPress,
  onDisclosuresChange,
  testID,
}) => {
  const {t} = useTranslation('SendVPScreen');
  const {controller, vc, wellknown, issuerWellknown, isLoaded} =
    useVcCardData(vcMetadata);

  if (!isLoaded) {
    return <VCCardSkeleton />;
  }

  const display = new Display(wellknown);
  const credentialType = getCredentialType(wellknown);
  const issuerName =
    (issuerWellknown?.display &&
      getDisplayObjectForCurrentLanguage(issuerWellknown.display)?.name) ||
    controller.verifiableCredentialData.issuer;
  const face = controller.verifiableCredentialData.face;
  const disclosedKeys: string[] = vc?.disclosedKeys ?? [];
  const sharedFields = getSharedFieldLabels(
    vc,
    controller.verifiableCredentialData.format,
    wellknown,
    selectedDisclosures,
  );

  // The issuer's large-card art is too light for a thumbnail, so it gets a solid colour:
  // the issuer's own when it also sets a text colour for it, otherwise the design navy.
  const issuerDisplay = wellknown?.display
    ? getDisplayObjectForCurrentLanguage(wellknown.display)
    : undefined;
  const thumbnailColor =
    issuerDisplay?.background_color && issuerDisplay?.text_color
      ? issuerDisplay.background_color
      : COLORS.navy;

  return (
    <View style={[styles.card, selected && styles.cardSelected]}>
      <Pressable
        testID={testID}
        accessibilityRole="radio"
        accessibilityState={{checked: selected}}
        onPress={onPress}
        style={styles.row}>
        <View style={[styles.thumbnail, {backgroundColor: thumbnailColor}]}>
          <Text
            numberOfLines={1}
            style={[
              styles.thumbnailTitle,
              {color: display.getTextColor(COLORS.surface)},
            ]}>
            {credentialType}
          </Text>
          {!!face && (
            <Image source={{uri: face}} style={styles.thumbnailFace} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.type} numberOfLines={2}>
            {credentialType}
          </Text>
          {!!issuerName && (
            <Text style={styles.issuer} numberOfLines={1}>
              {issuerName}
            </Text>
          )}
          <Text style={styles.shares}>
            <Text style={styles.sharesLabel}>{t('shares')} </Text>
            {sharedFields.length > 0
              ? sharedFields.join(', ')
              : t('sharesPickedDetails')}
          </Text>
        </View>

        <View
          style={[styles.radio, selected ? styles.radioOn : styles.radioOff]}>
          {selected && (
            <Icon
              name="check"
              type="material-community"
              size={20}
              color={COLORS.surface}
            />
          )}
        </View>
      </Pressable>

      {selected && disclosedKeys.length > 0 && onDisclosuresChange && (
        <SdJwtDisclosurePicker
          disclosedKeys={disclosedKeys}
          onDisclosuresChange={onDisclosuresChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: COLORS.teal,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 96,
    height: 62,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 6,
    justifyContent: 'space-between',
    marginRight: 14,
  },
  thumbnailTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 8,
  },
  thumbnailFace: {
    width: 22,
    height: 28,
    borderRadius: 3,
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  type: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 17,
    color: COLORS.navy,
  },
  issuer: {
    marginTop: 3,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: COLORS.bodyText,
  },
  shares: {
    marginTop: 4,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.link,
  },
  sharesLabel: {
    fontFamily: 'Montserrat_700Bold',
  },
  radio: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    backgroundColor: COLORS.teal,
  },
  radioOff: {
    borderWidth: 2,
    borderColor: COLORS.mutedIcon,
  },
});

interface VPShareCredentialCardProps {
  vcMetadata: VCMetadata;
  selected: boolean;
  // The SD-JWT disclosures picked for this card.
  selectedDisclosures?: string[];
  onPress: () => void;
  onDisclosuresChange?: (disclosures: string[]) => void;
  testID?: string;
}
