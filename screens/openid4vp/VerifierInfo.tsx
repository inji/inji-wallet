import React from "react";
import {TouchableOpacity, View} from "react-native";
import {Icon} from "react-native-elements";
import {AdaptiveImage} from "../../components/ui/AdaptiveImage";
import {Text} from "../../components/ui";
import {Theme} from "../../components/ui/styleUtils";

type VerifierInfoProps = {
  logoUri?: string | null;
  name?: string | null;
  showInfo?: boolean;
  onInfoPress?: () => void;
  subLabel?: string;
  subLabelColor?: string;
  flat?: boolean;
};

export function VerifierInfo({
  logoUri,
  name,
  showInfo = true,
  onInfoPress,
  subLabel,
  subLabelColor,
  flat = false,
}: VerifierInfoProps) {
  const containerStyle = flat
    ? {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }
    : Theme.DcqlStyles.verifierBanner;

  return (
    <View style={containerStyle}>
      {logoUri ? (
        <AdaptiveImage
          testID="verifier-logo"
          uri={logoUri}
          style={Theme.DcqlStyles.verifierBannerLogo}
        />
      ) : null}
      <View style={Theme.DcqlStyles.verifierBannerInfoCol}>
        {subLabel ? (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={Theme.DcqlStyles.verifierBannerName}>{name}</Text>
            <Icon
              name="verified-user"
              type="material"
              size={12}
              color="#1976D2"
              containerStyle={{marginLeft: 4}}
            />
          </View>
        ) : (
          <Text style={Theme.DcqlStyles.verifierBannerName}>{name}</Text>
        )}
        {subLabel ? (
          <Text
            style={[
              Theme.DcqlStyles.verifierBannerTrustedText,
              {color: subLabelColor ?? Theme.Colors.Icon},
            ]}>
            {subLabel}
          </Text>
        ) : (
          <View style={Theme.DcqlStyles.verifierBannerTrustedBadge}>
            <Icon
              name="verified-user"
              type="material"
              size={12}
              color="#1976D2"
            />
            <Text style={Theme.DcqlStyles.verifierBannerTrustedText}>
              Trusted
            </Text>
          </View>
        )}
      </View>
      {showInfo ? (
        <TouchableOpacity onPress={onInfoPress} disabled={!onInfoPress}>
          <Icon
            name="info-outline"
            type="material"
            size={18}
            color={Theme.Colors.GrayIcon}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
