import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {useTranslation} from 'react-i18next';
import {format, isToday} from 'date-fns';
import {Text} from '../ui';
import {Theme} from '../ui/styleUtils';
import {withAlpha} from '../ui/themes/designTokens';
import {
  MdocShareButton,
  SectionLabel,
  ShieldIcon,
  ShrinkWrappedText,
  TitleLineHeight,
  useElementLabel,
} from './MdocSharePrimitives';
import {
  describeElementValue,
  MdocCredentialTypeMismatch,
  MdocShareResult,
  MdocShareSummary,
} from './mdocShareUtils';
import type {MdocPresentmentConsentElement} from '../../shared/mdoc/iso18013PresentmentInterop';

const {colors: C} = Theme.Tokens;
// The spec has no fail tint token; derive it from `fail` so it follows the theme.
const FAIL_TINT = withAlpha(C.fail, 0.12);
const FAIL_RING = withAlpha(C.fail, 0.06);

/**
 * M5 (shared) and M6 (declined / did not complete). Declined is the user's own choice;
 * failure covers every other way the session ended without a confirmed DeviceResponse.
 */
export const MdocShareResultStep: React.FC<
  MdocShareResultStepProps
> = props => {
  const {t} = useTranslation('VcDetails');
  const isSuccess = props.result === 'success';
  const verifier = props.verifierName || String(t('mdocShare.theVerifier'));

  return (
    <View style={styles.container}>
      {isSuccess ? (
        <SharedBody {...props} verifier={verifier} />
      ) : (
        <EndedBody {...props} verifier={verifier} />
      )}
      <View
        style={[
          styles.footer,
          isSuccess && styles.footerDivider,
          {paddingBottom: props.bottomInset},
        ]}>
        <MdocShareButton
          testID="mdocResultDone"
          title={t('mdocShare.done')}
          onPress={props.onDone}
        />
        {isSuccess ? (
          <MdocShareButton
            testID="mdocResultViewActivity"
            variant="linkSubtle"
            title={t('mdocShare.viewInActivity')}
            onPress={props.onViewActivity}
          />
        ) : (
          <MdocShareButton
            testID="mdocResultShowQrAgain"
            variant="linkSubtle"
            title={t('mdocShare.showQrAgain')}
            onPress={props.onShowQrAgain}
          />
        )}
      </View>
    </View>
  );
};

type BodyProps = MdocShareResultStepProps & {verifier: string};

/** M5: what was sent, one detail per row, then purposes / channel / time. */
const SharedBody: React.FC<BodyProps> = props => {
  const {t} = useTranslation('VcDetails');
  const elementLabel = useElementLabel();
  const {shared, agreedPurposes, withheld} = props.summary;
  const when = isToday(props.closedAt)
    ? t('mdocShare.todayAt', {time: format(props.closedAt, 'p')})
    : format(props.closedAt, 'd MMM yyyy, p');

  return (
    <ScrollView contentContainerStyle={styles.sharedContent}>
      <View style={styles.sharedHeader}>
        <View style={styles.sharedBadge}>
          <Icon name="check" type="material" size={32} color={C.pass} />
        </View>
        <View style={styles.flex}>
          <Text
            testID="mdocResultTitle"
            weight="bold"
            color={C.ink}
            style={styles.sharedTitle}>
            {t('mdocShare.sharedTitle')}
          </Text>
          <Text
            testID="mdocResultMessage"
            size="small"
            color={C.inkMuted}
            margin="4 0 0 0">
            {t('mdocShare.sharedMessage', {
              verifier: props.verifier,
              count: shared.length,
              credential: props.credentialName,
            })}
          </Text>
        </View>
      </View>

      {shared.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text
              weight="bold"
              color={C.ink}
              style={[styles.flex, styles.sectionTitle]}>
              {t('mdocShare.whatWasShared')}
            </Text>
            <View style={styles.credentialIcon}>
              <Icon name="badge" type="material" size={10} color={C.warn} />
            </View>
            <ShrinkWrappedText size="smaller" color={C.inkMuted}>
              {props.credentialName}
            </ShrinkWrappedText>
          </View>
          {shared.map((element, index) => (
            <SharedRow
              key={`${element.namespace}-${element.element}`}
              index={index}
              element={element}
              label={elementLabel(element.element)}
              value={props.elementValues?.[element.element]}
              isLast={index === shared.length - 1}
            />
          ))}
        </>
      )}

      {withheld.length > 0 && (
        <View testID="mdocResultWithheld" style={styles.withheldRow}>
          <Icon
            name="lock-outline"
            type="material-community"
            size={16}
            color={C.inkMuted}
          />
          <Text size="small" color={C.inkMuted} style={styles.withheldText}>
            <Text size="small" weight="bold" color={C.ink}>
              {t('mdocShare.notSharedLabel')}
            </Text>{' '}
            {withheld.map(elementLabel).join(', ')}
          </Text>
        </View>
      )}

      <View testID="mdocResultSummary" style={styles.summaryBox}>
        {agreedPurposes.length > 0 && (
          <SummaryRow label={t('mdocShare.summaryPurposes')}>
            {agreedPurposes.map((purpose, index) => (
              <Text
                key={`${purpose}-${index}`}
                testID={`mdocResultPurpose-${index}`}
                size="small"
                color={C.ink}
                margin={index > 0 ? '4 0 0 0' : undefined}>
                {purpose}
              </Text>
            ))}
          </SummaryRow>
        )}
        <SummaryRow label={t('mdocShare.summarySharedVia')}>
          <Text size="small" color={C.ink}>
            {t('mdocShare.sharedViaBluetooth')}
          </Text>
        </SummaryRow>
        <SummaryRow label={t('mdocShare.summaryWhen')}>
          <Text testID="mdocResultWhen" size="small" color={C.ink}>
            {when}
          </Text>
        </SummaryRow>
      </View>
    </ScrollView>
  );
};

const SharedRow: React.FC<{
  index: number;
  element: MdocPresentmentConsentElement;
  label: string;
  value: unknown;
  isLast: boolean;
}> = ({index, element, label, value, isLast}) => {
  const {t} = useTranslation('VcDetails');
  const display = describeElementValue(element.element, value);
  const valueText =
    display.kind === 'text'
      ? display.text
      : display.kind === 'boolean'
      ? t(display.value ? 'mdocShare.valueYes' : 'mdocShare.valueNo')
      : display.kind === 'image'
      ? t('mdocShare.photoValue')
      : '';
  const stored = element.intentToRetain;
  return (
    <View
      testID={`mdocResultShared-${index}`}
      style={[styles.sharedRow, !isLast && styles.sharedRowDivider]}>
      <View style={styles.rowIcon}>
        <Icon
          name={elementIcon(element.element)}
          type="material-community"
          size={22}
          color={C.azureInk}
        />
        <View style={styles.rowCheck}>
          <Icon name="check" type="material" size={11} color={C.canvas} />
        </View>
      </View>
      <View style={styles.flex}>
        <Text weight="bold" color={C.ink} style={styles.rowTitle}>
          {label}
        </Text>
        {!!valueText && (
          <Text
            testID={`mdocResultSharedValue-${index}`}
            size="small"
            color={C.inkMuted}
            numLines={1}>
            {valueText}
          </Text>
        )}
      </View>
      <View
        testID={`mdocResultSharedTag-${index}`}
        style={[styles.tag, stored ? styles.tagStored : styles.tagViewed]}>
        <ShrinkWrappedText
          size="smaller"
          weight="semibold"
          color={stored ? C.warn : C.pass}>
          {t(stored ? 'mdocShare.stored' : 'mdocShare.viewedOnly')}
        </ShrinkWrappedText>
      </View>
    </View>
  );
};

const SummaryRow: React.FC<{label: string; children: React.ReactNode}> = ({
  label,
  children,
}) => (
  <View style={styles.summaryRow}>
    <Text size="small" color={C.inkMuted} style={styles.summaryLabel}>
      {label}
    </Text>
    <View style={styles.flex}>{children}</View>
  </View>
);

/** M6: declined or did not complete. */
const EndedBody: React.FC<BodyProps> = props => {
  const {t} = useTranslation('VcDetails');
  const isDeclined = props.result === 'declined';
  const typeMismatch = isDeclined ? null : props.typeMismatch ?? null;
  const title = isDeclined
    ? t('mdocShare.declinedTitle')
    : typeMismatch
    ? t('mdocShare.typeMismatchTitle')
    : t('mdocShare.failedTitle');
  const message = isDeclined
    ? t('mdocShare.declinedMessage', {verifier: props.verifier})
    : typeMismatch
    ? t('mdocShare.typeMismatchMessage', {
        verifier: props.verifier,
        credential: props.credentialName,
      })
    : t('mdocShare.failedMessage', {verifier: props.verifier});

  return (
    <ScrollView contentContainerStyle={styles.endedContent}>
      {isDeclined ? (
        <View style={[styles.ring, styles.ringDeclined]}>
          <View style={[styles.badge, styles.badgeDeclined]}>
            <ShieldIcon mark="x" size={44} color={C.fail} />
          </View>
        </View>
      ) : (
        <View style={[styles.ring, styles.ringDanger]}>
          <View style={[styles.badge, styles.badgeDanger]}>
            <Icon name="close" type="material" size={34} color={C.fail} />
          </View>
        </View>
      )}
      <Text
        testID="mdocResultTitle"
        weight="bold"
        size="large"
        align="center"
        color={isDeclined ? C.fail : C.ink}
        margin="20 0 6 0"
        style={isDeclined ? styles.declinedTitle : TitleLineHeight.large}>
        {title}
      </Text>
      <Text
        testID="mdocResultMessage"
        align="center"
        color={isDeclined ? C.inkMuted : C.inkMuted}
        style={[styles.message, isDeclined && styles.declinedMessage]}>
        {message}
      </Text>

      {typeMismatch ? (
        <View testID="mdocResultTypeMismatch" style={styles.mismatchCard}>
          <SectionLabel>{t('mdocShare.typeMismatchRequested')}</SectionLabel>
          <Text
            testID="mdocResultRequestedTypes"
            size="smaller"
            weight="semibold"
            color={C.ink}>
            {typeMismatch.requestedDocTypes.join('\n')}
          </Text>
          <View style={styles.mismatchSection}>
            <SectionLabel>
              {t('mdocShare.typeMismatchThisCredential')}
            </SectionLabel>
            <Text
              testID="mdocResultWalletType"
              size="smaller"
              weight="semibold"
              color={C.fail}>
              {typeMismatch.walletDocType}
            </Text>
          </View>
        </View>
      ) : (
        <View testID="mdocResultConnectionClosed" style={styles.infoBox}>
          <Icon
            name="bluetooth-disabled"
            type="material"
            size={20}
            color={C.pass}
            containerStyle={styles.infoIcon}
          />
          <Text size="small" color={C.ink} style={styles.flex}>
            {t('mdocShare.connectionClosedInfo')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

/** MaterialCommunityIcons outline glyph for a shared detail; generic card when unknown. */
function elementIcon(element: string): string {
  if (element.startsWith('age_over_') || element === 'age_in_years') {
    return 'shield-check-outline';
  }
  if (element.startsWith('resident_') || element.startsWith('address')) {
    return 'home-outline';
  }
  if (element.endsWith('_name') || element.endsWith('_names')) {
    return 'account-outline';
  }
  return ELEMENT_ICONS[element] ?? 'card-text-outline';
}

const ELEMENT_ICONS: Record<string, string> = {
  portrait: 'image-outline',
  photo: 'image-outline',
  birth_date: 'calendar-blank-outline',
  date_of_birth: 'calendar-blank-outline',
  issue_date: 'calendar-blank-outline',
  expiry_date: 'clock-outline',
  driving_privileges: 'car-outline',
  document_number: 'pound',
  email: 'email-outline',
  sex: 'gender-male-female',
  gender: 'gender-male-female',
  nationality: 'flag-outline',
  issuing_country: 'flag-outline',
  issuing_authority: 'card-account-details-outline',
  birth_place: 'map-marker-outline',
};

export interface MdocShareResultStepProps {
  result: MdocShareResult;
  verifierName?: string;
  credentialName: string;
  summary: MdocShareSummary;
  /** Element identifier → value from the credential, shown under each shared detail. */
  elementValues?: Record<string, unknown>;
  /** Set when a failure was the reader asking for a different credential type. */
  typeMismatch?: MdocCredentialTypeMismatch | null;
  closedAt: Date;
  bottomInset: number;
  onDone: () => void;
  onViewActivity: () => void;
  onShowQrAgain: () => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.canvas,
  },
  flex: {
    flex: 1,
  },
  sharedContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  sharedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  sharedBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.tintPass,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sharedTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  credentialIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: C.warn,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  sharedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  sharedRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.tintAzure,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowCheck: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: C.canvas,
    backgroundColor: C.pass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  tagStored: {
    backgroundColor: C.tintWarn,
  },
  tagViewed: {
    backgroundColor: C.tintPass,
  },
  withheldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  withheldText: {
    flex: 1,
    marginLeft: 8,
  },
  summaryBox: {
    backgroundColor: C.sand,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  summaryLabel: {
    width: 110,
  },
  endedContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
    alignItems: 'center',
  },
  ring: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDanger: {
    backgroundColor: FAIL_RING,
  },
  ringDeclined: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: FAIL_RING,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDanger: {
    backgroundColor: FAIL_TINT,
  },
  badgeDeclined: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: FAIL_TINT,
  },
  declinedTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  message: {
    maxWidth: 320,
  },
  declinedMessage: {
    fontSize: 15,
    lineHeight: 22,
  },
  mismatchCard: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    padding: 14,
    marginTop: 24,
  },
  mismatchSection: {
    marginTop: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    backgroundColor: C.tintPass,
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
});
