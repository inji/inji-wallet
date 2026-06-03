import React, {useState} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../ui';
import {Badge} from '../ui/badge/Badge';
import {Divider} from '../ui/divider/Divider';
import {Theme} from '../ui/styleUtils';
import {DcqlBadgeColors} from '../ui/themes/DefaultTheme';

const COLLAPSED_CLAIM_COUNT = 3;

type MissingClaimsViewProps = {
  claims: string[];
  initialExpanded?: boolean;
};

export function MissingClaimsView({
  claims,
  initialExpanded = false,
}: MissingClaimsViewProps) {
  const {t} = useTranslation('SendVPScreen');
  const [expanded, setExpanded] = useState(initialExpanded);
  const visibleClaims = claims.slice(0, COLLAPSED_CLAIM_COUNT);
  const hiddenCount = claims.length - COLLAPSED_CLAIM_COUNT;

  return (
    <>
      <Text
        testID="missingClaimsIntroText"
        style={styles.introText}>
        {t('errors.noMatchingCredentials.claimsIntro')}
      </Text>

      <View
        testID="missingClaimsCard"
        style={styles.card}>
        {visibleClaims.map((claim, index) => (
          <View
            testID={`missingClaimRow-${index}`}
            key={`claim-${index}`}
            style={[
              styles.row,
              index === visibleClaims.length - 1 && {borderBottomWidth: 0},
            ]}>
            <View
              testID={`missingClaimBullet-${index}`}
              style={styles.bullet}
            />
            <Text
              testID={`missingClaimText-${index}`}
              style={styles.rowText}>
              {claim}
            </Text>
          </View>
        ))}
      </View>

      {hiddenCount > 0 && (
        <TouchableOpacity
          testID="showMoreButton"
          style={styles.showMoreButton}
          onPress={() => setExpanded(true)}>
          <Text style={styles.showMoreText}>
            {t('errors.noMatchingCredentials.showMore', {count: hiddenCount})}
          </Text>
        </TouchableOpacity>
      )}

      {expanded && (
        <Modal
          testID="missingClaimsModalOverlay"
          transparent
          visible={expanded}
          animationType="slide"
          onRequestClose={() => setExpanded(false)}>
          <View style={styles.overlay}>
            <TouchableOpacity
              style={{flex: 1}}
              activeOpacity={1}
              onPress={() => setExpanded(false)}
            />
            <View
              testID="missingClaimsModalSheet"
              style={styles.sheet}>
            <View
              testID="missingClaimsModalHandle"
              style={styles.handle}
            />
            <View style={styles.modalHeader}>
              <Text
                testID="missingClaimsModalTitle"
                style={styles.modalTitle}>
                {t('errors.noMatchingCredentials.requestedClaimsTitle')}
              </Text>
              <Badge
                testId="missingClaimsModalBadge"
                text={t('errors.noMatchingCredentials.requiredCount', {
                  count: claims.length,
                })}
                textColor={DcqlBadgeColors.requiredText}
                borderColor={DcqlBadgeColors.requiredBorder}
                bgColor={DcqlBadgeColors.requiredBg}
              />
            </View>
            <Divider testId="missingClaimsModalDivider" />
            <ScrollView>
              {claims.map((claim, index) => (
                <View
                  testID={`expandedClaimRow-${index}`}
                  key={`expanded-claim-${index}`}
                  style={[
                    styles.modalRow,
                    index === claims.length - 1 && {borderBottomWidth: 0},
                  ]}>
                  <Text
                    testID={`expandedClaimNumber-${index}`}
                    style={styles.modalRowNumber}>
                    {index + 1}
                  </Text>
                  <View
                    testID={`expandedClaimBullet-${index}`}
                    style={styles.modalRowBullet}
                  />
                  <Text
                    testID={`expandedClaimText-${index}`}
                    style={styles.modalRowText}>
                    {claim}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Text
              testID="missingClaimsModalFooter"
              style={styles.modalFooter}>
              {t('errors.noMatchingCredentials.claimsFooter')}
            </Text>
            <TouchableOpacity
              testID="missingClaimsModalCloseButton"
              style={styles.closeButton}
              onPress={() => setExpanded(false)}>
              <Text
                testID="missingClaimsModalCloseText"
                style={styles.closeText}>
                {t('errors.noMatchingCredentials.close')}
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  introText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: Theme.Colors.errorGrayText,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Theme.Colors.whiteBackgroundColor,
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.Colors.borderBottomColor,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.Colors.borderBottomColor,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.Colors.requesterName,
    marginRight: 10,
  },
  rowText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: Theme.Colors.textValue,
    flex: 1,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 2,
  },
  showMoreText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 13,
    color: Theme.Colors.secondaryText,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Theme.Colors.whiteBackgroundColor,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%' as any,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.Colors.borderBottomColor,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: Theme.Colors.textValue,
    flex: 1,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Theme.Colors.borderBottomColor,
  },
  modalRowNumber: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: Theme.Colors.DetailsLabel,
    width: 20,
  },
  modalRowBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.Colors.requesterName,
    marginRight: 10,
  },
  modalRowText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: Theme.Colors.textValue,
    flex: 1,
  },
  modalFooter: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: Theme.Colors.errorGrayText,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.Colors.borderBottomColor,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15,
    color: Theme.Colors.textValue,
  },
});
