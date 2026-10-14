import React from 'react';
import {Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';
import {ScaledText} from './ScaledText';
import {VCFormat} from '../../shared/VCFormat';
import {statusLabel} from './CredentialCard';
import {displayDate, maskNumber} from './credentialClaims';
import {ShieldCheckIcon} from './Icons';
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
  s === 'verified' ? c.pass : s === 'pending' ? c.warn : c.fail;

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
      value: data.status === 'verified' ? 'Valid' : statusLabel[data.status],
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
      <ShieldCheckIcon color={colour} size={large ? 16 : 14} />
      <ScaledText
        style={[styles.pillText, large && {fontSize: 14}, {color: colour}]}>
        {statusLabel[status]}
      </ScaledText>
    </View>
  );
};

export const Action: React.FC<{
  label: string;
  primary?: boolean;
  size?: number;
  onPress: () => void;
  icon: (colour: string) => React.ReactNode;
}> = ({label, primary, size = 52, onPress, icon}) => {
  const {c} = useRevampTheme();
  const fontSize = 14 * narrowTextScale(useWindowDimensions().width);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({pressed}) => [
        styles.action,
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
  onViewAll: () => void;
}> = ({data, onViewAll}) => {
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
      <Pressable
        onPress={onViewAll}
        style={styles.linkRow}
        accessibilityRole="link">
        <ScaledText style={[styles.link, {color: c.azureInk}]}>
          View all details
        </ScaledText>
      </Pressable>
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
  linkRow: {alignSelf: 'flex-end', paddingVertical: 4},
  link: {fontFamily: fonts.medium, fontSize: 14},
});
