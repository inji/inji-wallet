import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {HomeRouteProps} from '../../routes/routeTypes';
import {RootRouteProps} from '../../routes';
import {useIssuerScreenController} from './IssuerScreenController';
import {VCMetadata} from '../../shared/VCMetadata';
import {
  ChoiceList,
  Page,
  PageModal,
  PageButton,
  PageHeader,
} from '../../components/revamp/Page';
import {CheckIcon} from '../../components/revamp/Icons';
import {ScaledText} from '../../components/revamp/ScaledText';
import {
  CredentialCardFront,
  ScaledCard,
} from '../../components/revamp/CredentialCard';
import {validUntil} from '../../components/revamp/CredentialParts';
import {useCredentialCard} from '../../components/revamp/useCredentialCard';
import {fonts, radii} from '../../components/revamp/tokens';
import {useRevampTheme} from '../../components/revamp/useRevampTheme';
import testIDProps from '../../shared/commonUtil';

/**
 * Lets the user choose which of their existing cards to replace with the one just downloaded.
 *
 * The list is whatever the machine matched on the incoming credential's specific type — download a
 * National ID and only National IDs appear, download a Health ID and only Health IDs do — so it
 * needs no per-type code. Before this screen existed, "replace" deleted whichever single card
 * `find` returned, which (myVcs being newest-first) was the most recent rather than the oldest.
 */
export const ReplaceCredentialSelectionScreen: React.FC<
  HomeRouteProps | RootRouteProps
> = props => {
  const {t} = useTranslation('IssuersScreen');
  const {c} = useRevampTheme();
  const controller = useIssuerScreenController(props);

  const duplicates: VCMetadata[] = controller.duplicateVcMetadatas;
  const selectedKeys: string[] = controller.selectedDuplicateVcKeys;
  const credentialType = duplicates[0]?.credentialType;
  const areAllChecked =
    duplicates.length > 0 && selectedKeys.length === duplicates.length;

  return (
    <PageModal
      visible={controller.isSelectingCredentialsToReplace}
      onRequestClose={controller.CANCEL_REPLACE}>
      <Page
        testID="replaceCredentialSelectionScreen"
        header={
          <PageHeader
            title={t('errors.replaceCredential.title')}
            onBack={controller.CANCEL_REPLACE}
          />
        }
        footer={
          <PageButton
            testID="confirmReplaceCredential"
            title={t('errors.replaceCredential.confirm', {
              count: selectedKeys.length,
            })}
            // Mirrors the machine's `hasSelectedDuplicates` guard, so the button cannot be
            // pressed into a transition that would be refused anyway.
            disabled={selectedKeys.length === 0}
            onPress={controller.CONFIRM_REPLACE}
          />
        }>
        <ScrollView contentContainerStyle={styles.content}>
          <ScaledText
            testID="replaceCredentialDescription"
            style={[styles.lead, {color: c.inkMuted}]}>
            {t('errors.replaceCredential.description', {
              card: credentialType ?? t('thisCard'),
            })}
          </ScaledText>
          <View style={styles.countRow}>
            <ScaledText
              testID="replaceCredentialSelectedCount"
              style={[styles.count, {color: c.inkMuted}]}>
              {t('errors.replaceCredential.selected', {
                count: selectedKeys.length,
              })}
            </ScaledText>
            <ScaledText
              testID="replaceCredentialCheckAll"
              accessibilityRole="button"
              onPress={
                areAllChecked
                  ? controller.UNCHECK_ALL_DUPLICATES
                  : controller.CHECK_ALL_DUPLICATES
              }
              style={[styles.selectAll, {color: c.azureInk}]}>
              {areAllChecked
                ? t('errors.replaceCredential.clear')
                : t('errors.replaceCredential.selectAll')}
            </ScaledText>
          </View>
          <ChoiceList>
            {duplicates.map(vcMetadata => {
              const vcKey = vcMetadata.getVcKey();
              return (
                <ReplaceRow
                  key={vcKey}
                  vcMetadata={vcMetadata}
                  selected={selectedKeys.includes(vcKey)}
                  onPress={() => controller.TOGGLE_DUPLICATE_SELECTION(vcKey)}
                />
              );
            })}
          </ChoiceList>
        </ScrollView>
      </Page>
    </PageModal>
  );
};

const ReplaceRow: React.FC<{
  vcMetadata: VCMetadata;
  selected: boolean;
  onPress: () => void;
}> = ({vcMetadata, selected, onPress}) => {
  const {t} = useTranslation('IssuersScreen');
  const {c} = useRevampTheme();
  const {data} = useCredentialCard(vcMetadata);
  const until = data ? validUntil(data) : undefined;
  const detail = [
    data?.holderName,
    until ? t('validUntil', {date: until}) : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <Pressable
      {...testIDProps(`replaceCandidate-${vcMetadata.getVcKey()}`)}
      accessibilityRole="checkbox"
      accessibilityState={{checked: selected}}
      onPress={onPress}
      style={[styles.row, selected && {backgroundColor: c.tintAzure}]}>
      <View style={[styles.thumb, {backgroundColor: c.sand}]}>
        {data ? (
          <ScaledCard width={64}>
            <CredentialCardFront data={data} />
          </ScaledCard>
        ) : null}
      </View>
      <View style={styles.rowText}>
        <ScaledText style={[styles.rowTitle, {color: c.ink}]}>
          {data?.title ?? vcMetadata.credentialType}
        </ScaledText>
        {detail ? (
          <ScaledText style={[styles.rowDetail, {color: c.inkMuted}]}>
            {detail}
          </ScaledText>
        ) : null}
      </View>
      {selected ? (
        <CheckIcon color={c.ink} />
      ) : (
        <View style={[styles.box, {borderColor: c.lineStrong}]} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  content: {paddingTop: 8, paddingBottom: 24, gap: 14},
  lead: {fontFamily: fonts.regular, fontSize: 15, lineHeight: 22},
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {fontFamily: fonts.regular, fontSize: 13},
  selectAll: {fontFamily: fonts.semibold, fontSize: 13, padding: 4},
  row: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  thumb: {width: 64, height: 40, borderRadius: 6, overflow: 'hidden'},
  rowText: {flex: 1, gap: 2},
  rowTitle: {fontFamily: fonts.semibold, fontSize: 15, lineHeight: 19},
  rowDetail: {fontFamily: fonts.regular, fontSize: 12, lineHeight: 16},
  box: {width: 20, height: 20, borderRadius: radii.chip / 2, borderWidth: 1.5},
});
