import React from 'react';
import {Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';
import {ScaledText} from './ScaledText';
import {VCFormat} from '../../shared/VCFormat';
import {isInactive, statusLabel} from './CredentialCard';
import {displayDate, maskNumber} from './credentialClaims';
import {AlertIcon, ShieldCheckIcon} from './Icons';
import {fonts, narrowTextScale, radii, SLOT_LABEL_MAX_SCALE} from './tokens';
import {RevampColors} from './tokens';
import {useRevampTheme} from './useRevampTheme';
import {CardStatus, CredentialCardData} from './useCredentialCard';

const formatName: Record<string, string> = {
  [VCFormat.ldp_vc]: 'W3C Verifiable Credential',
  [VCFormat.mso_mdoc]: 'ISO mdoc',
  [VCFormat.vc_sd_jwt]: 'SD-JWT Credential',
  [VCFormat.dc_sd_jwt]: 'SD-JWT Credential',
};

const DATE_KEYS = {
  issued: ['issue_date', 'issuanceDate', 'issueDate', 'dateOfIssue'],
  valid: [
    'expiry_date',
    'expiryDate',
    'validUntil',
    'dateOfExpiry',
    'expirationDate',
  ],
};

function claim(claims: Record<string, string>, keys: string[]) {
  const lower = Object.fromEntries(
    Object.entries(claims).map(([k, v]) => [k.toLowerCase(), v]),
  );
  return keys.map(k => lower[k.toLowerCase()]).find(Boolean);
}

const date = (claims: Record<string, string>, keys: string[]) => {
  const value = claim(claims, keys);
  return value ? displayDate(value) : undefined;
};

export const validUntil = (data: CredentialCardData) =>
  date(data.claims, DATE_KEYS.valid);

export const statusColour = (c: RevampColors, s: CardStatus) =>
  s === 'verified'
    ? c.pass
    : s === 'pending' || s === 'expired'
    ? c.warn
    : c.fail;

interface InfoRow {
  label: string;
  value: string;
  mono?: boolean;
  colour?: string;
}

function infoRows(data: CredentialCardData, c: RevampColors): InfoRow[] {
  const rows: (InfoRow | undefined)[] = [
    data.issuerName ? {label: 'Issuer', value: data.issuerName} : undefined,
    data.number
      ? {
          label: data.number.label,
          value: maskNumber(data.number.value),
          mono: true,
        }
      : undefined,
    ...(['issued', 'valid'] as const).map(k => {
      const value = date(data.claims, DATE_KEYS[k]);
      return value
        ? {label: k === 'issued' ? 'Issued on' : 'Valid until', value}
        : undefined;
    }),
    {label: 'Format', value: formatName[data.format] ?? data.format},
    {
      label: 'Signature',
      value: statusLabel[data.status],
      colour: statusColour(c, data.status),
    },
  ];
  return rows.filter((r): r is InfoRow => !!r);
}

export const StatusPill: React.FC<{status: CardStatus; large?: boolean}> = ({
  status,
  large,
}) => {
  const {c} = useRevampTheme();
  const colour = statusColour(c, status);
  return (
    <View
      style={[styles.pill, large && styles.pillLarge, {borderColor: colour}]}>
      {isInactive(status) ? (
        <AlertIcon color={colour} size={large ? 16 : 14} />
      ) : (
        <ShieldCheckIcon color={colour} size={large ? 16 : 14} />
      )}
      <ScaledText
        style={[styles.pillText, large && {fontSize: 14}, {color: colour}]}>
        {statusLabel[status]}
      </ScaledText>
    </View>
  );
};

const revokedOn = (data: CredentialCardData) =>
  data.revokedOn ? displayDate(data.revokedOn) : undefined;

/** The date beside the status: when the card expires, expired or was found revoked. */
function statusDate(data: CredentialCardData): string | undefined {
  if (data.status === 'revoked') {
    const date = revokedOn(data);
    return date ? `Revoked on ${date}` : undefined;
  }
  if (data.status === 'expired') {
    const date = data.expiryDate
      ? displayDate(data.expiryDate)
      : validUntil(data);
    return date ? `Expired on ${date}` : undefined;
  }
  const date = validUntil(data);
  return date ? `Valid until ${date}` : undefined;
}

export const StatusRow: React.FC<{data: CredentialCardData}> = ({data}) => {
  const {c} = useRevampTheme();
  const date = statusDate(data);
  return (
    <View style={styles.statusRow}>
      <StatusPill status={data.status} large />
      {date ? (
        <ScaledText style={[styles.statusDate, {color: c.inkMuted}]}>
          {date}
        </ScaledText>
      ) : null}
    </View>
  );
};

/** The notice under an expired or revoked card's status: what it means and what to do. */
export const StatusNotice: React.FC<{data: CredentialCardData}> = ({data}) => {
  const {c} = useRevampTheme();
  if (!isInactive(data.status)) return null;
  const issuer = data.issuerName ?? 'The issuer';
  const expired = data.status === 'expired';
  const colour = statusColour(c, data.status);
  const revokedDate = revokedOn(data);
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.notice,
        {backgroundColor: expired ? c.tintWarn : c.tintFail},
      ]}>
      <AlertIcon color={colour} size={18} />
      <View style={{flex: 1, gap: 4}}>
        <ScaledText style={[styles.noticeTitle, {color: colour}]}>
          {expired ? 'This credential has expired' : 'Revoked by the issuer'}
        </ScaledText>
        <ScaledText style={[styles.noticeText, {color: c.ink}]}>
          {expired
            ? `Verifiers will reject it. Get an updated copy from ${issuer}.`
            : `${issuer} revoked this credential${
                revokedDate ? ` on ${revokedDate}` : ''
              }, so it can't be shared. Contact them if you think this is a mistake.`}
        </ScaledText>
      </View>
    </View>
  );
};

export const Action: React.FC<{
  label: string;
  primary?: boolean;
  size?: number;
  disabled?: boolean;
  onPress: () => void;
  icon: (colour: string) => React.ReactNode;
}> = ({label, primary, size = 52, disabled, onPress, icon}) => {
  const {c} = useRevampTheme();
  const fontSize = 14 * narrowTextScale(useWindowDimensions().width);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled}}
      style={({pressed}) => [
        styles.action,
        disabled && styles.actionDisabled,
        pressed && {transform: [{scale: 0.96}]},
      ]}>
      <View
        style={[
          styles.actionCircle,
          {
            width: size,
            height: size,
            backgroundColor: primary ? c.primary : c.sand,
          },
        ]}>
        {icon(primary ? c.onPrimary : c.ink)}
      </View>
      <ScaledText
        numberOfLines={1}
        maxFontSizeMultiplier={SLOT_LABEL_MAX_SCALE}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[styles.actionLabel, {color: c.ink, fontSize}]}>
        {label}
      </ScaledText>
    </Pressable>
  );
};

export const CredentialInformation: React.FC<{
  data: CredentialCardData;
}> = ({data}) => {
  const {c} = useRevampTheme();
  return (
    <View style={{gap: 10}}>
      <ScaledText style={[styles.sectionTitle, {color: c.ink}]}>
        Credential Information
      </ScaledText>
      <View
        style={[
          styles.infoCard,
          {backgroundColor: c.card, borderColor: c.line},
        ]}>
        {infoRows(data, c).map((row, i, rows) => (
          <View
            key={row.label}
            style={[
              styles.infoRow,
              i < rows.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: c.line,
              },
            ]}>
            <ScaledText style={[styles.infoLabel, {color: c.inkMuted}]}>
              {row.label}
            </ScaledText>
            <ScaledText
              numberOfLines={1}
              style={[
                row.mono ? styles.infoMono : styles.infoValue,
                {color: row.colour ?? c.ink},
              ]}>
              {row.value}
            </ScaledText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pillLarge: {height: 32, paddingLeft: 10, paddingRight: 12, gap: 6},
  pillText: {fontFamily: fonts.medium, fontSize: 12},
  action: {flex: 1, alignItems: 'center', gap: 8},
  actionDisabled: {opacity: 0.4},
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusDate: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 16.8,
    flexShrink: 1,
    textAlign: 'right',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: radii.surface,
  },
  noticeTitle: {fontFamily: fonts.medium, fontSize: 16, lineHeight: 20},
  noticeText: {fontFamily: fonts.regular, fontSize: 14, lineHeight: 19},
  actionCircle: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {fontFamily: fonts.medium, fontSize: 14},
  sectionTitle: {fontFamily: fonts.medium, fontSize: 18, lineHeight: 25.2},
  infoCard: {
    borderRadius: radii.surface,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
  },
  infoLabel: {fontFamily: fonts.regular, fontSize: 14},
  infoValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  infoMono: {
    fontFamily: fonts.mono,
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'right',
  },
});
