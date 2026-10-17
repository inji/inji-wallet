import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import testIDProps from '../../shared/commonUtil';
import type {
  MdocPresentmentConsentElement,
  MdocPresentmentConsentRequest,
} from '../../shared/mdoc/iso18013PresentmentInterop';
import {
  MdocShareButton,
  MdocShareHeader,
  MdocTag,
  ShieldIcon,
  ShrinkWrappedText,
  TitleLineHeight,
  useElementLabel,
} from './MdocSharePrimitives';
import {
  agreedPurposeTitles,
  allRequiredPurposesSelected,
  buildDisclosurePlan,
  buildPurposesResponse,
  buildWithheldPlan,
  formatElementLabel,
  isRequiredFlag,
  MdocDisclosureRow,
  MdocRequestPurpose,
  purposeElements,
  purposeKey,
  purposeText,
  purposeTitle,
  PurposesResponse,
  togglePurposeSelection,
} from './mdocShareUtils';

const {colors: C, elevation: E} = Theme.Tokens;

/**
 * M3 — the verifier's DeviceRequest arrived; the user picks purposes and approves or declines
 * before any DeviceResponse is built. Unticking a purpose withholds the details only it needs.
 */
export const MdocConsentStep: React.FC<MdocConsentStepProps> = props => {
  const {t} = useTranslation('VcDetails');
  const elementLabel = useElementLabel();
  const {request} = props;
  const verifier = props.verifierName || t('mdocShare.unknownVerifier');
  const purposesList = useMemo(
    () => request.requestInfo?.purposes ?? [],
    [request],
  );
  const defaultPurpose = t('mdocShare.defaultPurpose');
  const fallbackPurpose = request.requestInfo?.purpose
    ? formatElementLabel(request.requestInfo.purpose)
    : request.purpose?.trim() || defaultPurpose;
  const notStated = t('mdocShare.notStatedByVerifier');
  const legalBasis = purposeText(request.requestInfo?.legal_basis) || notStated;
  const sharedWith = purposeText(request.requestInfo?.shared_with) || notStated;

  const [unselectedPurposes, setUnselectedPurposes] = useState<Set<string>>(
    new Set(),
  );
  // A deselection from one verifier's request must not leak into the next one.
  useEffect(() => {
    setUnselectedPurposes(new Set());
  }, [request]);

  const rows = useMemo(
    () =>
      buildDisclosurePlan(
        request,
        purposesList,
        unselectedPurposes,
        defaultPurpose,
      ),
    [request, purposesList, unselectedPurposes, defaultPurpose],
  );
  const withheld = useMemo(
    () => buildWithheldPlan(request, rows),
    [request, rows],
  );
  const requiredSelected = allRequiredPurposesSelected(
    purposesList,
    unselectedPurposes,
  );
  const canApprove = requiredSelected && rows.length > 0;

  function togglePurpose(index: number) {
    setUnselectedPurposes(
      togglePurposeSelection(purposesList, unselectedPurposes, index),
    );
  }

  function handleApprove() {
    props.onAllow(
      buildPurposesResponse(purposesList, unselectedPurposes),
      agreedPurposeTitles(
        purposesList,
        unselectedPurposes,
        defaultPurpose,
        fallbackPurpose,
      ),
      rows.map(row => row.element),
    );
  }

  return (
    <View style={styles.container}>
      <MdocShareHeader
        variant="light"
        title={t('mdocShare.consentTitle')}
        titleTestID="mdocConsentHeader"
        onClose={props.isBusy ? undefined : props.onDeny}
        closeLabel={t('mdocShare.decline')}
        closeTestID="mdocConsentClose"
        right={
          <View style={styles.bleBadge}>
            <Icon
              name="bluetooth"
              type="material"
              size={14}
              color={C.azureInk}
            />
            <ShrinkWrappedText
              size="smaller"
              weight="semibold"
              color={C.azureInk}>
              {t('mdocShare.bleBadge')}
            </ShrinkWrappedText>
          </View>
        }
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}>
        <View style={styles.verifierCard}>
          <View style={styles.verifierIcon}>
            <ShieldIcon mark="plus" size={28} color={C.ink} />
          </View>
          <View style={styles.flex}>
            <Text
              testID="mdocConsentVerifierName"
              weight="bold"
              size="medium"
              color={C.ink}
              numLines={2}
              style={TitleLineHeight.medium}>
              {verifier}
            </Text>
            <Text
              testID="mdocConsentCredential"
              size="smaller"
              color={C.inkMuted}
              margin="2 0 0 0">
              {t('mdocShare.verifierSubtitle', {
                credential: props.credentialName,
              })}
            </Text>
          </View>
        </View>

        <Text
          weight="bold"
          size="medium"
          color={C.ink}
          style={TitleLineHeight.medium}>
          {t('mdocShare.purposesTitle')}
        </Text>
        <Text size="smaller" color={C.inkMuted} margin="4 0 12 0">
          {t('mdocShare.purposesSubtitle')}
        </Text>

        {purposesList.length > 0 ? (
          purposesList.map((p, index) => {
            const key = purposeKey(p, index);
            return (
              <PurposeCard
                key={key}
                index={index}
                purpose={p}
                title={purposeTitle(p, defaultPurpose)}
                selected={!unselectedPurposes.has(key)}
                disabled={props.isBusy}
                elementLabel={elementLabel}
                onToggle={() => togglePurpose(index)}
              />
            );
          })
        ) : (
          <View style={[styles.purposeCard, styles.purposeCardSelected]}>
            <Icon name="check-box" type="material" size={24} color={C.pass} />
            <Text
              testID="mdocConsentPurpose"
              weight="bold"
              color={C.ink}
              style={styles.purposeBody}>
              {fallbackPurpose}
            </Text>
          </View>
        )}

        <View style={styles.detailsHeader}>
          <Text
            weight="bold"
            size="medium"
            color={C.ink}
            style={[styles.flex, TitleLineHeight.medium]}>
            {t('mdocShare.detailsTitle')}
          </Text>
          <ShrinkWrappedText
            testID="mdocConsentDetailsCount"
            size="smaller"
            color={C.inkMuted}>
            {t('mdocShare.detailsCount', {count: rows.length})}
          </ShrinkWrappedText>
        </View>
        <View style={styles.fromRow}>
          <View style={styles.fromIcon}>
            <Icon name="badge" type="material" size={11} color={C.warn} />
          </View>
          <Text size="smaller" color={C.ink} style={styles.flex}>
            {t('mdocShare.fromCredential', {
              credential: props.credentialName,
            })}
          </Text>
        </View>

        {(rows.length > 0 ||
          withheld.unneeded.length > 0 ||
          withheld.notHeld.length > 0) && (
          <View testID="mdocConsentDetails" style={styles.detailsCard}>
            {rows.map((row, index) => (
              <DisclosureRow
                key={`${row.element.namespace}-${row.element.element}`}
                index={index}
                row={row}
                isLast={
                  index === rows.length - 1 &&
                  withheld.unneeded.length === 0 &&
                  withheld.notHeld.length === 0
                }
                label={elementLabel(row.element.element)}
              />
            ))}
            {withheld.unneeded.map((element, index) => (
              <WithheldRow
                key={`${element.namespace}-${element.element}`}
                testID={`mdocConsentWithheld-${index}`}
                label={elementLabel(element.element)}
                reason={t('mdocShare.notSharedUnneeded')}
                isLast={
                  index === withheld.unneeded.length - 1 &&
                  withheld.notHeld.length === 0
                }
              />
            ))}
            {withheld.notHeld.length > 0 && (
              <WithheldRow
                testID="mdocConsentNotHeld"
                label={t('mdocShare.notHeldTitle', {
                  count: withheld.notHeld.length,
                })}
                reason={t('mdocShare.notHeldReason', {
                  details: withheld.notHeld.map(elementLabel).join(', '),
                  credential: props.credentialName,
                })}
                isLast={true}
              />
            )}
          </View>
        )}

        <View testID="mdocConsentLegal" style={styles.legalCard}>
          <LegalRow label={t('mdocShare.legalBasis')} value={legalBasis} />
          <LegalRow label={t('mdocShare.sharedWith')} value={sharedWith} />
        </View>
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: props.bottomInset}]}>
        {!canApprove && (
          <Text
            testID="mdocConsentRequiredHint"
            size="smaller"
            align="center"
            color={C.fail}
            margin="0 0 10 0">
            {requiredSelected
              ? t('mdocShare.nothingToShareHint')
              : t('mdocShare.requiredPurposeHint')}
          </Text>
        )}
        <View style={styles.footerButtons}>
          <MdocShareButton
            testID="mdocConsentDeny"
            variant="outline"
            title={t('mdocShare.decline')}
            disabled={props.isBusy}
            onPress={props.onDeny}
            style={styles.declineButton}
          />
          <MdocShareButton
            testID="mdocConsentAllow"
            variant="primary"
            title={t('mdocShare.approveAndShare', {count: rows.length})}
            disabled={!canApprove}
            loading={props.isBusy}
            onPress={handleApprove}
            style={styles.approveButton}
          />
        </View>
      </View>
    </View>
  );
};

const PurposeCard: React.FC<{
  index: number;
  purpose: MdocRequestPurpose;
  title: string;
  selected: boolean;
  disabled: boolean;
  elementLabel: (element: string) => string;
  onToggle: () => void;
}> = props => {
  const {t} = useTranslation('VcDetails');
  const details = purposeText(props.purpose.details);
  const retention = purposeText(props.purpose.retention);
  const chips = purposeElements(props.purpose).map(props.elementLabel);
  const required = isRequiredFlag(props.purpose.is_required);
  const selected = required || props.selected;
  return (
    <Pressable
      {...testIDProps(`mdocConsentPurpose-${props.index}`)}
      accessibilityLabel={props.title}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: selected,
        disabled: required || props.disabled,
      }}
      disabled={required || props.disabled}
      onPress={props.onToggle}
      style={[styles.purposeCard, selected && styles.purposeCardSelected]}>
      <Icon
        name={selected ? 'check-box' : 'check-box-outline-blank'}
        type="material"
        size={24}
        color={selected ? C.pass : C.lineStrong}
        containerStyle={required && styles.lockedCheckbox}
      />
      <View style={styles.purposeBody}>
        <View style={styles.purposeTitleRow}>
          <Text weight="bold" color={C.ink} style={styles.flex}>
            {props.title}
          </Text>
          {required && (
            <MdocTag
              label={t('mdocShare.required')}
              tone="neutral"
              icon="lock-outline"
              testID={`mdocConsentPurposeRequired-${props.index}`}
            />
          )}
        </View>
        {!!details && (
          <Text size="smaller" color={C.inkMuted} margin="4 0 0 0">
            {details}
          </Text>
        )}
        {!!retention && (
          <View
            testID={`mdocConsentPurposeRetention-${props.index}`}
            style={styles.retentionRow}>
            <Icon name="schedule" type="material" size={14} color={C.warn} />
            <Text
              size="smaller"
              weight="semibold"
              color={C.warn}
              style={styles.retentionText}>
              {retention}
            </Text>
          </View>
        )}
        {chips.length > 0 && (
          <View style={styles.chipRow}>
            {chips.map((label, chipIndex) => (
              <View
                key={`${label}-${chipIndex}`}
                testID={`mdocConsentPurposeChip-${props.index}-${chipIndex}`}
                style={styles.chip}>
                <ShrinkWrappedText size="smaller" color={C.ink}>
                  {label}
                </ShrinkWrappedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const DisclosureRow: React.FC<{
  index: number;
  row: MdocDisclosureRow;
  label: string;
  isLast: boolean;
}> = ({index, row, label, isLast}) => {
  const {t} = useTranslation('VcDetails');
  return (
    <View
      testID={`mdocConsentElement-${index}`}
      style={[styles.elementRow, !isLast && styles.elementRowDivider]}>
      <View style={styles.elementIcon}>
        <Icon name="check" type="material" size={16} color={C.pass} />
      </View>
      <View style={styles.flex}>
        <Text weight="bold" color={C.ink}>
          {label}
        </Text>
        {row.usedFor.length > 0 && (
          <Text size="smaller" color={C.azureInk} margin="2 0 0 0">
            {t('mdocShare.usedFor', {purposes: row.usedFor.join(', ')})}
          </Text>
        )}
      </View>
      {row.element.intentToRetain && (
        <MdocTag
          label={t('mdocShare.willBeStored')}
          tone="warning"
          testID={`mdocConsentElementStored-${index}`}
        />
      )}
    </View>
  );
};

const WithheldRow: React.FC<{
  testID: string;
  label: string;
  reason: string;
  isLast: boolean;
}> = ({testID, label, reason, isLast}) => (
  <View
    testID={testID}
    style={[styles.elementRow, !isLast && styles.elementRowDivider]}>
    <View style={[styles.elementIcon, styles.withheldIcon]}>
      <Icon name="remove" type="material" size={14} color={C.lineStrong} />
    </View>
    <View style={styles.flex}>
      <Text weight="bold" color={C.lineStrong}>
        {label}
      </Text>
      <Text size="smaller" color={C.lineStrong} margin="2 0 0 0">
        {reason}
      </Text>
    </View>
  </View>
);

const LegalRow: React.FC<{label: string; value: string}> = ({label, value}) => (
  <View style={styles.legalRow}>
    <Text size="smaller" color={C.inkMuted} style={styles.legalLabel}>
      {label}
    </Text>
    <Text size="smaller" color={C.ink} style={styles.flex}>
      {value}
    </Text>
  </View>
);

export interface MdocConsentStepProps {
  request: MdocPresentmentConsentRequest;
  verifierName?: string;
  credentialName: string;
  /** True while a Decline/Approve is already being processed — blocks a second tap. */
  isBusy: boolean;
  bottomInset: number;
  onAllow: (
    purposesResponse: PurposesResponse,
    agreedPurposes: string[],
    sharedElements: MdocPresentmentConsentElement[],
  ) => void;
  onDeny: () => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  bleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.tintAzure,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.sand,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  verifierIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  purposeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: C.card,
    ...E.card,
  },
  purposeCardSelected: {
    borderWidth: 1.5,
    borderColor: C.pass,
  },
  lockedCheckbox: {
    opacity: 0.5,
  },
  purposeBody: {
    flex: 1,
    marginLeft: 12,
  },
  purposeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  retentionText: {
    flex: 1,
    marginLeft: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    backgroundColor: C.sand,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  fromRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  fromIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.warn,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  elementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  elementRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  elementIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: C.tintPass,
  },
  withheldIcon: {
    backgroundColor: C.card,
    borderWidth: 1.5,
    borderColor: C.line,
  },
  legalCard: {
    backgroundColor: C.sand,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  legalRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  legalLabel: {
    width: 110,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.canvas,
  },
  footerButtons: {
    flexDirection: 'row',
  },
  declineButton: {
    flex: 1,
    marginRight: 10,
  },
  approveButton: {
    flex: 1.6,
  },
});
