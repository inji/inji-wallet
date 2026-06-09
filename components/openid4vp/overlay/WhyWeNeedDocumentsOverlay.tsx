import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Icon, Overlay} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {Text} from '../../ui';
import {Badge} from '../../ui/badge/Badge';
import {Divider} from '../../ui/divider/Divider';
import {Theme} from "../../ui/styleUtils";

type CredentialCardBadgeStyle = {
  textColor: string;
  borderColor: string;
  bgColor: string;
  iconBgColor: string;
  footerContainerStyle: ViewStyle;
  footerTextStyle: TextStyle;
};

type CredentialCardProps = {
  title: string;
  badgeText: string;
  badgeStyle: CredentialCardBadgeStyle;
  titleIcon: React.ReactNode;
  bodyText: string;
  footerText: string;
};

interface WhyWeNeedDocumentsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export const WhyWeNeedDocumentsOverlay: React.FC<
  WhyWeNeedDocumentsOverlayProps
> = ({isVisible, onClose}) => {
  const {t} = useTranslation('SendVPScreen');

  const renderCredentialCard = ({
    title,
    badgeText,
    badgeStyle,
    titleIcon,
    bodyText,
    footerText,
  }: CredentialCardProps) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: badgeStyle.iconBgColor},
          ]}>
          {titleIcon}
        </View>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Badge
            text={badgeText}
            textColor={badgeStyle.textColor}
            borderColor={badgeStyle.borderColor}
            bgColor={badgeStyle.bgColor}
          />
        </View>
      </View>
      <Text style={styles.cardDescription}>{bodyText}</Text>
      <View style={badgeStyle.footerContainerStyle}>
        <Text style={badgeStyle.footerTextStyle}>{footerText}</Text>
      </View>
    </View>
  );

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
      <Divider testId={'why-we-need-docs-header-body-divider'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Body text */}
        <Text style={styles.bodyText}>{t('infoOverlay.body')}</Text>

        {/* Required Credentials card */}
        {renderCredentialCard({
          title: t('infoOverlay.requiredCredentials.title'),
          badgeText: t('dcqlSection.required'),
          badgeStyle: {
            textColor: Theme.Colors.BadgeColors.requiredText,
            borderColor: Theme.Colors.BadgeColors.requiredBorder,
            bgColor: Theme.Colors.BadgeColors.requiredBg,
            iconBgColor: Theme.Colors.BadgeColors.requiredBg,
            footerContainerStyle: styles.requiredFootnote,
            footerTextStyle: styles.requiredFootnoteText,
          },
          titleIcon: (
            <Icon
              name="error-outline"
              type="material"
              size={20}
              color={Theme.Colors.BadgeColors.requiredText}
            />
          ),
          bodyText: t('infoOverlay.requiredCredentials.description'),
          footerText: t('infoOverlay.requiredCredentials.footnote'),
        })}

        {/* Optional Credentials card */}
        {renderCredentialCard({
          title: t('infoOverlay.optionalCredentials.title'),
          badgeText: t('dcqlSection.notRequired'),
          badgeStyle: {
            textColor: Theme.Colors.BadgeColors.optionalText,
            borderColor: Theme.Colors.BadgeColors.optionalBorder,
            bgColor: Theme.Colors.BadgeColors.optionalBg,
            iconBgColor: '#F3F4F6',
            footerContainerStyle: styles.optionalFootnote,
            footerTextStyle: styles.optionalFootnoteText,
          },
          titleIcon: (
            <Icon
              name="check-circle-outline"
              type="material"
              size={20}
              color="#6B7280"
            />
          ),
          bodyText: t('infoOverlay.optionalCredentials.description'),
          footerText: t('infoOverlay.optionalCredentials.footnote'),
        })}
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
    padding: 2,
    fontSize: 20,
    fontFamily: 'Montserrat_600SemiBold',
    fontWeight: '600',
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
    marginTop: 10,
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
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  optionalFootnoteText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
});
