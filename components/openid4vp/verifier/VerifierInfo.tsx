import React from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-elements';
import {AdaptiveImage} from '../../ui/AdaptiveImage';
import {Text} from '../../ui';
import {Theme} from '../../ui/styleUtils';
import {useTranslation} from 'react-i18next';

type VerifierInfoProps = {
  logoUri?: string | null;
  name?: string | null;
  subLabel?: string;
  subLabelColor?: string;
  flat?: boolean;
};

export function VerifierInfo({
                               logoUri,
                               name,
                               subLabel,
                               subLabelColor,
                               flat = false,
                             }: VerifierInfoProps) {
  const {t} = useTranslation('SendVPScreen');
  const containerStyle = flat
    ? {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 12,
      paddingVertical: 10,
    }
    : {
      ...Theme.DcqlStyles.verifierBanner,
      alignItems: 'center' as const,
    };

  return (
    <View style={containerStyle}>
      {logoUri ? (
        <AdaptiveImage
          testID="verifier-logo"
          uri={logoUri}
          style={Theme.DcqlStyles.verifierBannerLogo}
        />
      ) : null}
      <View
        style={[Theme.DcqlStyles.verifierBannerInfoCol, {justifyContent: 'center'}]}>
        <View style={{flexDirection: 'row', alignItems: 'center', columnGap: 6}}>
          <Text style={Theme.DcqlStyles.verifierBannerName}>{name}</Text>
          {subLabel && (<View style={Theme.DcqlStyles.verifierBannerTrustedBadge}>
            <Icon
              name="verified-user"
              type="material"
              size={12}
              color="#1976D2"
            />
          </View>)}
        </View>
        {subLabel ? (
          <Text
            style={[
              Theme.DcqlStyles.verifierBannerTrustedText,
              {color: subLabelColor ?? Theme.Colors.Icon},
            ]}>
            {subLabel}
          </Text>
        ) : null}
      </View>
      {!subLabel && <View style={Theme.DcqlStyles.verifierBannerTrustedBadge}>
        <Icon
          name="verified-user"
          type="material"
          size={12}
          color="#1976D2"
        />
        {!subLabel && (
          <Text style={Theme.DcqlStyles.verifierBannerTrustedText}>
            {t('verifierInfo.trusted')}
          </Text>
        )}
      </View>}

    </View>
  );
}
