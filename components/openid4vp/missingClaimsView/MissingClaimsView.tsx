import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import {ExpandableListSheetView} from '../../ui/expandableList/ExpandableListSheetView';
import {Text} from '../../ui';
import {Badge} from '../../ui/badge/Badge';
import {Theme} from '../../ui/styleUtils';
import React from 'react';

type MissingClaimsViewProps = {
  claims: string[];
  initialExpanded?: boolean;
};

export function MissingClaimsView({
  claims,
  initialExpanded = false,
}: MissingClaimsViewProps) {
  const {t} = useTranslation('SendVPScreen');

  return (
    <ExpandableListSheetView
      items={claims}
      testID="missing-claims"
      initialExpanded={initialExpanded}
      introText={t('errors.noMatchingCredentials.claimsIntro')}
      title={t('errors.noMatchingCredentials.requestedClaimsTitle')}
      footerText={t('errors.noMatchingCredentials.claimsFooter')}
      closeText={t('errors.noMatchingCredentials.close')}
      showMoreText={hiddenCount =>
        t('errors.noMatchingCredentials.showMore', {count: hiddenCount})
      }
      badge={
        <Badge
          testId="missing-claims-modal-badge"
          text={t('errors.noMatchingCredentials.requiredCount', {
            count: claims.length,
          })}
          textColor={Theme.Colors.BadgeColors.requiredText}
          borderColor={Theme.Colors.BadgeColors.requiredBorder}
          bgColor={Theme.Colors.BadgeColors.requiredBg}
        />
      }
      keyExtractor={(_claim, index, isExpanded) =>
        `${isExpanded ? 'expanded' : 'collapsed'}-claim-${index}`
      }
      renderItem={({item, index, isExpanded, isLast}) => {
        const rowPrefix = isExpanded ? 'expandedClaimRow' : 'missingClaimRow';
        const bulletPrefix = isExpanded
          ? 'expandedClaimBullet'
          : 'missingClaimBullet';
        const textPrefix = isExpanded
          ? 'expandedClaimText'
          : 'missingClaimText';

        return (
          <View
            testID={`${rowPrefix}-${index}`}
            style={[
              styles.rowBase,
              isExpanded ? styles.expandedRow : styles.collapsedRow,
              isLast && styles.lastRow,
            ]}>
            {isExpanded && (
              <Text
                testID={`expandedClaimNumber-${index}`}
                style={styles.expandedRowNumber}>
                {index + 1}
              </Text>
            )}
            <View
              testID={`${bulletPrefix}-${index}`}
              style={[
                styles.bulletBase,
                isExpanded ? styles.expandedBullet : styles.collapsedBullet,
              ]}
            />
            <Text testID={`${textPrefix}-${index}`} style={styles.textBase}>
              {item}
            </Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  rowBase: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.Colors.borderBottomColor,
  },
  collapsedRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  expandedRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  bulletBase: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.Colors.requesterName,
  },
  collapsedBullet: {
    marginRight: 10,
  },
  expandedBullet: {
    marginRight: 10,
  },
  textBase: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: Theme.Colors.textValue,
    flex: 1,
  },
  expandedRowNumber: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: Theme.Colors.DetailsLabel,
    width: 20,
  },
});
