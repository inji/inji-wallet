import React from 'react';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../components/ui';
import {Theme} from '../../../components/ui/styleUtils';
import Qr from '../../../assets/shareNearby/qr.svg';
import Scan from '../../../assets/shareNearby/scan.svg';
import Check from '../../../assets/shareNearby/check.svg';
import LockWhite from '../../../assets/shareNearby/lock.svg';

const illustration = Theme.ShareNearbyConnectionStyles;

function Phone({
  label,
  isHolder,
  children,
}: {
  label: string;
  isHolder: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={illustration.phoneColumn}>
      <View style={illustration.phone}>
        {isHolder ? (
          <LinearGradient
            colors={Theme.Colors.GradientColorsLight}
            start={Theme.LinearGradientDirection.start}
            end={Theme.LinearGradientDirection.end}
            style={illustration.phoneTop}>
            <View style={illustration.notch} />
          </LinearGradient>
        ) : (
          <View style={[illustration.phoneTop, illustration.verifierTop]}>
            <View style={illustration.notch} />
          </View>
        )}
        <View style={illustration.screen}>{children}</View>
        <View style={illustration.homeBar} />
      </View>
      <Text style={illustration.label}>{label}</Text>
    </View>
  );
}

function GradientCheck() {
  return (
    <LinearGradient
      colors={Theme.Colors.GradientColors}
      start={Theme.LinearGradientDirection.start}
      end={Theme.LinearGradientDirection.end}
      style={illustration.check}>
      <Check />
    </LinearGradient>
  );
}

function CardIcon({isPending}: {isPending?: boolean}) {
  return isPending ? (
    <View style={illustration.pendingCard} />
  ) : (
    <LinearGradient
      colors={Theme.Colors.GradientColors}
      start={Theme.LinearGradientDirection.start}
      end={Theme.LinearGradientDirection.end}
      style={illustration.card}>
      <View style={illustration.cardDot} />
      <View style={illustration.cardLines}>
        <View style={illustration.cardLine} />
        <View style={[illustration.cardLine, illustration.cardLineShort]} />
      </View>
    </LinearGradient>
  );
}

/**
 * You and the verifier: dots while connecting (MDQ-02), a locked link once connected (MDQ-03),
 * and your card on its way while sending (frame 46).
 */
export function ConnectionIllustration({
  phase,
}: {
  phase: 'connecting' | 'connected' | 'sending';
}) {
  const {t} = useTranslation('ShareNearby');
  const isConnected = phase !== 'connecting';
  const isSending = phase === 'sending';
  return (
    <View
      style={illustration.row}
      accessible
      accessibilityLabel={t(
        isSending
          ? 'sending.title'
          : isConnected
          ? 'engagement.waitingForRequest.title'
          : 'engagement.connecting.title',
      )}>
      <Phone label={t('engagement.you')} isHolder>
        {isSending ? (
          <CardIcon />
        ) : isConnected ? (
          <GradientCheck />
        ) : (
          <Qr width={24} height={24} />
        )}
      </Phone>
      {isConnected ? (
        <View style={illustration.link}>
          <LinearGradient
            colors={Theme.Colors.GradientColors}
            start={Theme.LinearGradientDirection.start}
            end={Theme.LinearGradientDirection.end}
            style={illustration.linkLine}
          />
          <LinearGradient
            colors={Theme.Colors.GradientColors}
            start={Theme.LinearGradientDirection.start}
            end={Theme.LinearGradientDirection.end}
            style={illustration.lockBadge}>
            <LockWhite color="white" />
          </LinearGradient>
        </View>
      ) : (
        <View style={illustration.dots}>
          {Theme.ShareNearbyColors.connectionDots.map(colour => (
            <View
              key={colour}
              style={[illustration.dot, {backgroundColor: colour}]}
            />
          ))}
        </View>
      )}
      <Phone label={t('engagement.verifier')} isHolder={false}>
        {isSending ? (
          <CardIcon isPending />
        ) : isConnected ? (
          <View style={illustration.verifierDone}>
            <View style={illustration.verifierCheck}>
              <Check />
            </View>
            <View style={illustration.typing}>
              {[0, 1, 2].map(index => (
                <View key={index} style={illustration.typingDot} />
              ))}
            </View>
          </View>
        ) : (
          <Scan width={24} height={24} />
        )}
      </Phone>
    </View>
  );
}
