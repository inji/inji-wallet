import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Overlay} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {Text} from '../../components/ui';
import {Badge} from '../../components/ui/badge/Badge';
import {DcqlBadgeColors} from '../../components/ui/themes/DefaultTheme';

interface WhyWeNeedDocumentsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export const WhyWeNeedDocumentsOverlay: React.FC<
  WhyWeNeedDocumentsOverlayProps
> = ({isVisible, onClose}) => {
  const {t} = useTranslation('SendVPScreen');

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlayContainer}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('infoOverlay.title')}</Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Icon name="close" type="material" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Body text */}
        <Text style={styles.bodyText}>{t('infoOverlay.body')}</Text>

        {/* Required Credentials card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, styles.iconContainerRequired]}>
              <Icon
                name="error-outline"
                type="material"
                size={20}
                color={DcqlBadgeColors.requiredText}
              />
            </View>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>
                {t('infoOverlay.requiredCredentials.title')}
              </Text>
              <Badge
                text={t('dcqlSection.required')}
                textColor={DcqlBadgeColors.requiredText}
                borderColor={DcqlBadgeColors.requiredBorder}
                bgColor={DcqlBadgeColors.requiredBg}
              />
            </View>
          </View>
          <Text style={styles.cardDescription}>
            {t('infoOverlay.requiredCredentials.description')}
          </Text>
          <View style={styles.requiredFootnote}>
            <Text style={styles.requiredFootnoteText}>
              {t('infoOverlay.requiredCredentials.footnote')}
            </Text>
          </View>
        </View>

        {/* Optional Credentials card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, styles.iconContainerOptional]}>
              <Icon
                name="check-circle-outline"
                type="material"
                size={20}
                color="#6B7280"
              />
            </View>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>
                {t('infoOverlay.optionalCredentials.title')}
              </Text>
              <Badge
                text={t('dcqlSection.notRequired')}
                textColor={DcqlBadgeColors.optionalText}
                borderColor={DcqlBadgeColors.optionalBorder}
                bgColor={DcqlBadgeColors.optionalBg}
              />
            </View>
          </View>
          <Text style={styles.cardDescription}>
            {t('infoOverlay.optionalCredentials.description')}
          </Text>
          <View style={styles.optionalFootnote}>
            <Text style={styles.optionalFootnoteText}>
              {t('infoOverlay.optionalCredentials.footnote')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  bodyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  iconContainerRequired: {
    backgroundColor: DcqlBadgeColors.requiredBg,
  },
  iconContainerOptional: {
    backgroundColor: '#F3F4F6',
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 10,
  },
  requiredFootnote: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  requiredFootnoteText: {
    fontSize: 12,
    color: '#1D4ED8',
    lineHeight: 17,
  },
  optionalFootnote: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 10,
  },
  optionalFootnoteText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
});
