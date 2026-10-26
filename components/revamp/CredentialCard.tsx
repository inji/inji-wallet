import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Image, StyleSheet, View} from 'react-native';
import {ScaledText} from './ScaledText';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import {DEFAULT_ECL} from '../../shared/constants';
import {VCFormat} from '../../shared/VCFormat';
import {QrCodeOverlay} from '../QrCodeOverlay';
import {Guilloche} from './Guilloche';
import {CardStatus, CredentialCardData} from './useCredentialCard';
import {maskNumber, mrzLines} from './credentialClaims';
import {cardFields} from './cardFields';
import {useCardQr} from './useCardQr';
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  colors as revampColors,
  fonts,
  radii,
} from './tokens';

/**
 * The card is a fixed layout drawn to scale, so its text can only grow so far with the system font
 * size before rows collide. Text outside the card follows the user's setting fully.
 */
const CARD_TEXT_MAX_SCALE = 1.3;

/** Used when the issuer's metadata gives the credential type no colour of its own. */
const DEFAULT_BACKGROUND = '#0a3970';

function isLight(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

/** Expired and revoked cards can't be shared, and are shown greyed out with a stamp. */
export const isInactive = (status: CardStatus) =>
  status === 'expired' || status === 'revoked';

/** The design's greys for an inactive card, in place of the issuer's colours. */
const INACTIVE_BACKGROUND = '#e4e4e1';
const INACTIVE_TEXT = '#6b6b6b';

function cardColours(data: CredentialCardData) {
  const inactive = isInactive(data.status);
  const bg = inactive
    ? INACTIVE_BACKGROUND
    : data.background ?? DEFAULT_BACKGROUND;
  const light = isLight(bg);
  const fg = inactive
    ? INACTIVE_TEXT
    : data.text ?? (light ? '#0a3970' : '#fcfcfa');
  return {
    bg,
    fg,
    tone: (light ? 'light' : 'dark') as 'light' | 'dark',
    edge: light ? 'rgba(10,57,112,0.12)' : 'rgba(252,252,250,0.1)',
    wash: light ? 'rgba(10,57,112,0.08)' : 'rgba(252,252,250,0.12)',
    /** The badge ring: the card's own colour, or its text colour when the card is pale. */
    brand: light ? fg : bg,
  };
}

export const statusLabel: Record<CardStatus, string> = {
  verified: 'Valid',
  pending: 'Pending',
  expired: 'Expired',
  revoked: 'Revoked',
};

/** The issuer's badge: its logo, or the design's shield, on a white disc in a ring of the card's colour. */
const IssuerBadge: React.FC<{logoUrl?: string; colour: string}> = ({
  logoUrl,
  colour,
}) => (
  <View style={styles.badge}>
    <Svg
      width={46}
      height={46}
      viewBox="0 0 48 48"
      style={StyleSheet.absoluteFill}>
      <Circle cx={24} cy={24} r={24} fill={colour} />
      <Circle cx={24} cy={24} r={21} fill="#ffffff" />
      <Circle
        cx={24}
        cy={24}
        r={18.5}
        fill="none"
        stroke={colour}
        strokeWidth={0.8}
        strokeDasharray="1.2 1.6"
        opacity={0.7}
      />
      {logoUrl ? null : (
        <>
          <Path
            d="M24 11.5l10 3.8v7.5c0 6.6-4.4 11.4-10 13.7-5.6-2.3-10-7.1-10-13.7v-7.5z"
            fill={colour}
          />
          <Path
            d="M24 17.5l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6z"
            fill="#2ed9e8"
          />
        </>
      )}
    </Svg>
    {logoUrl ? (
      <Image
        source={{uri: logoUrl}}
        style={styles.badgeLogo}
        resizeMode="contain"
      />
    ) : null}
  </View>
);

const ShieldCheck: React.FC<{color: string}> = ({color}) => (
  <Svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="m9 12 2 2 4-4" />
  </Svg>
);

/** The card is drawn the same in both schemes, so its status marks use the light scheme's colours. */
const stampColour = (status: CardStatus) =>
  status === 'expired' ? revampColors.light.warn : revampColors.light.fail;

const StatusStamp: React.FC<{status: CardStatus}> = ({status}) => {
  const colour = stampColour(status);
  return (
    <View pointerEvents="none" style={styles.stampWrap}>
      <View style={[styles.stamp, {borderColor: colour}]}>
        <ScaledText
          maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
          style={[styles.stampText, {color: colour}]}>
          {statusLabel[status].toUpperCase()}
        </ScaledText>
      </View>
    </View>
  );
};

export const CredentialCardFront = React.memo(function CredentialCardFront({
  data,
}: {
  data: CredentialCardData;
}) {
  const {frontExtra} = useMemo(
    () =>
      cardFields(
        data.claims,
        data.labels ?? {},
        data.number?.key ? [data.number.key] : [],
      ),
    [data],
  );
  const inactive = isInactive(data.status);
  const {bg, fg, tone, edge, brand} = cardColours(data);
  return (
    <View style={[styles.card, {backgroundColor: bg, borderColor: edge}]}>
      <Guilloche
        w={CARD_WIDTH}
        h={CARD_HEIGHT}
        cx={300}
        cy={30}
        r={170}
        tone={tone}
        opacity={tone === 'dark' ? 0.85 : 0.8}
      />
      {data.face && !inactive ? (
        <Image
          source={{uri: data.face}}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : null}
      {data.face && inactive ? (
        <View style={[styles.photo, styles.inactive]}>
          <Image
            source={{uri: data.face}}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>
      ) : null}
      <View style={styles.frontBody}>
        <View style={styles.topRow}>
          <View style={{flex: 1, minWidth: 0, gap: 4}}>
            <ScaledText
              maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
              numberOfLines={1}
              style={[styles.title, {color: fg}]}>
              {data.title}
            </ScaledText>
            {data.issuerName ? (
              <ScaledText
                maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
                numberOfLines={1}
                style={[styles.issuer, {color: fg}]}>
                {data.issuerName}
              </ScaledText>
            ) : null}
          </View>
          <IssuerBadge logoUrl={data.issuerLogoUrl} colour={brand} />
        </View>
        <View style={{marginLeft: data.face ? 98 : 0, gap: 4, minWidth: 0}}>
          {data.holderName ? (
            <ScaledText
              maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
              numberOfLines={1}
              style={[styles.holder, {color: fg}]}>
              {data.holderName}
            </ScaledText>
          ) : null}
          {data.number ? (
            <ScaledText
              maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
              numberOfLines={1}
              style={[styles.mono, {color: fg}]}>
              {data.number.label} {maskNumber(data.number.value)}
            </ScaledText>
          ) : null}
          {frontExtra ? (
            <ScaledText
              maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
              numberOfLines={1}
              style={[styles.extra, {color: fg}]}>
              {frontExtra}
            </ScaledText>
          ) : null}
          {inactive ? null : (
            <View style={styles.statusRow}>
              <ShieldCheck color={fg} />
              <ScaledText
                maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
                style={[styles.statusText, {color: fg}]}>
                {statusLabel[data.status]}
              </ScaledText>
            </View>
          )}
        </View>
      </View>
      {inactive ? <StatusStamp status={data.status} /> : null}
    </View>
  );
});

/** Machine-readable-zone style strip built from the card's own data, as on a travel document. */
function mrz(data: CredentialCardData): [string, string] {
  const own = mrzLines(data.claims);
  if (own) return own;
  const clean = (s = '') => s.toUpperCase().replace(/[^A-Z0-9]+/g, '<');
  const pad = (s: string) => (s + '<'.repeat(30)).slice(0, 30);
  const [given, ...rest] = (data.holderName ?? '').split(' ');
  return [
    pad(clean(data.title).slice(0, 6) + clean(data.number?.value ?? '')),
    pad(clean(rest.join(' ')) + '<<' + clean(given)),
  ];
}

const QrGlyph: React.FC = () => (
  <Svg
    width={40}
    height={40}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#0a3970"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Rect x={3} y={3} width={7} height={7} rx={1} />
    <Rect x={14} y={3} width={7} height={7} rx={1} />
    <Rect x={3} y={14} width={7} height={7} rx={1} />
    <Path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
  </Svg>
);

export const CredentialCardBack = React.memo(function CredentialCardBack({
  data,
  showing,
}: {
  data: CredentialCardData;
  showing: boolean;
}) {
  const {bg, fg, tone, edge, wash} = cardColours(data);
  const {
    back: {wide, pair},
  } = useMemo(
    () =>
      cardFields(
        data.claims,
        data.labels ?? {},
        data.number?.key ? [data.number.key] : [],
      ),
    [data],
  );
  const isMdoc = data.format === VCFormat.mso_mdoc;
  // CredIssuer's own QR (its Claim 169 QR) comes first: it is the one verifiers can read. The
  // wallet-generated QR is only built when there is none, or its image failed to load.
  const issuerQr = isMdoc ? undefined : data.issuerQr;
  const issuerQrUrl = issuerQr?.url ?? null;
  const isFetchingIssuerQr = !!issuerQr?.isFetching;
  const {qr: plainQr} = useCardQr(
    data.vcMetadata,
    data.credential,
    showing && !issuerQrUrl && !isFetchingIssuerQr,
  );
  const [mdocQr, setMdocQr] = useState<string | null>(null);
  const qr = isMdoc ? (showing ? mdocQr : null) : plainQr;
  const [l1, l2] = mrz(data);
  return (
    <View style={[styles.card, {backgroundColor: bg, borderColor: edge}]}>
      <Guilloche
        w={CARD_WIDTH}
        h={CARD_HEIGHT}
        cx={42}
        cy={30}
        r={170}
        tone={tone}
        opacity={tone === 'dark' ? 0.85 : 0.8}
      />
      <View style={styles.backBody}>
        <View style={styles.backTop}>
          <ScaledText
            maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
            numberOfLines={1}
            style={[styles.issuer, {color: fg, flex: 1}]}>
            {data.issuerName ?? data.title}
          </ScaledText>
          <ScaledText
            maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
            style={[styles.backAction, {color: fg}]}>
            Scan to verify
          </ScaledText>
        </View>
        <View style={styles.backMiddle}>
          <View
            style={styles.qrBox}
            accessibilityRole="image"
            accessibilityLabel="Verification QR code">
            {issuerQrUrl ? (
              <Image
                source={{uri: issuerQrUrl}}
                style={styles.issuerQr}
                resizeMode="contain"
                onError={() => issuerQr?.onLoadError(issuerQrUrl)}
              />
            ) : qr && !isFetchingIssuerQr ? (
              // A wallet QR built earlier must not show while CredIssuer's is still being looked up.
              <QRCode value={qr} size={92} ecl={DEFAULT_ECL} />
            ) : showing && (data.credential || isFetchingIssuerQr) ? (
              <ActivityIndicator color="#0a3970" />
            ) : (
              <QrGlyph />
            )}
          </View>
          <View style={{flex: 1, minWidth: 0, gap: 8}}>
            {wide ? (
              <View style={{gap: 2}}>
                <ScaledText
                  maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
                  style={[styles.backLabel, {color: fg}]}>
                  {wide.label}
                </ScaledText>
                <ScaledText
                  maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
                  numberOfLines={2}
                  style={[styles.backValue, {color: fg}]}>
                  {wide.value}
                </ScaledText>
              </View>
            ) : null}
            <View style={{flexDirection: 'row', gap: 8}}>
              {pair.map(f => (
                <View key={f.label} style={{flex: 1, minWidth: 0, gap: 2}}>
                  <ScaledText
                    maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
                    numberOfLines={1}
                    style={[styles.backLabel, {color: fg}]}>
                    {f.label}
                  </ScaledText>
                  <ScaledText
                    maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
                    numberOfLines={1}
                    style={[styles.backValue, {color: fg}]}>
                    {f.value}
                  </ScaledText>
                </View>
              ))}
            </View>
          </View>
        </View>
        {isMdoc && showing && data.vcMetadata ? (
          // Builds the engagement QR and runs the Bluetooth session a verifier scanning it connects
          // to, with the consent and result screens; stops when the card is turned back.
          <View style={styles.hidden}>
            <QrCodeOverlay
              verifiableCredential={data.credential}
              meta={data.vcMetadata}
              credentialName={data.title}
              issuerLogoUrl={data.issuerLogoUrl}
              showInlineQr={false}
              forceVisible={false}
              onQrData={setMdocQr}
            />
          </View>
        ) : null}
        <View style={[styles.mrz, {backgroundColor: wash}]}>
          <ScaledText
            maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
            numberOfLines={1}
            style={[styles.mrzText, {color: fg}]}>
            {l1}
          </ScaledText>
          <ScaledText
            maxFontSizeMultiplier={CARD_TEXT_MAX_SCALE}
            numberOfLines={1}
            style={[styles.mrzText, {color: fg}]}>
            {l2}
          </ScaledText>
        </View>
      </View>
    </View>
  );
});

/** Draws a card (or a flipping pair of faces) at `width`, scaled from its design size. */
export const ScaledCard: React.FC<{
  width: number;
  children: React.ReactNode;
}> = ({width, children}) => {
  const k = width / CARD_WIDTH;
  return (
    <View style={{width, height: CARD_HEIGHT * k}}>
      <View
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          transformOrigin: 'top left',
          transform: [{scale: k}],
        }}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  frontBody: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  topRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  title: {
    fontFamily: fonts.semibold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  issuer: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14.4,
    opacity: 0.85,
  },
  badge: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#080d13',
    shadowOpacity: 0.28,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  badgeLogo: {width: 28, height: 28, borderRadius: 14},
  photo: {position: 'absolute', left: 10, bottom: 0, width: 104, height: 125},
  holder: {fontFamily: fonts.medium, fontSize: 17, lineHeight: 20},
  mono: {fontFamily: fonts.mono, fontSize: 12, lineHeight: 16, opacity: 0.9},
  extra: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.85,
  },
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2},
  statusText: {fontFamily: fonts.medium, fontSize: 12, lineHeight: 14.4},
  // Greys the photo too on Android; iOS doesn't support the grayscale filter.
  inactive: {filter: [{grayscale: 1}]},
  stampWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    borderWidth: 2.5,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    transform: [{rotate: '-6deg'}],
  },
  stampText: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 2.5,
  },
  backBody: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  backAction: {fontFamily: fonts.medium, fontSize: 12, lineHeight: 14.4},
  backMiddle: {flexDirection: 'row', gap: 14, alignItems: 'flex-start'},
  issuerQr: {width: 92, height: 92},
  qrBox: {
    width: 104,
    height: 104,
    padding: 6,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#080d13',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 1},
    elevation: 2,
  },
  backLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14.4,
    opacity: 0.75,
  },
  backValue: {fontFamily: fonts.medium, fontSize: 14, lineHeight: 17},
  hidden: {position: 'absolute', width: 0, height: 0, overflow: 'hidden'},
  mrz: {
    marginTop: 'auto',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mrzText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 1,
  },
});
