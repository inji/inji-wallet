import {Theme} from '../../../components/ui/styleUtils';
import React, {useState} from 'react';
import {ActivityIndicator, LayoutChangeEvent, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';

const colors = Theme.ShareNearbyColors;
const engagementStyles = Theme.ShareNearbyEngagementStyles;

export function EngagementCode({
  qrText,
  isShowingQrCode,
  isExpired,
}: {
  qrText: string;
  isShowingQrCode: boolean;
  isExpired: boolean;
}) {
  const {t} = useTranslation('ShareNearby');
  const [qrContainerWidth, setQrContainerWidth] = useState(0);
  const qrCodeSize = Math.min(216, Math.max(0, qrContainerWidth - 40));
  const handleQrContainerLayout = (event: LayoutChangeEvent) =>
    setQrContainerWidth(event.nativeEvent.layout.width);

  return isShowingQrCode ? (
    <View
      style={engagementStyles.measure}
      onLayout={handleQrContainerLayout}
      testID="mdocQrContainer">
      <View
        style={engagementStyles.frame}
        accessible
        accessibilityLabel={t('engagement.codeLabel')}
        testID="mdocQr">
        {qrText && qrCodeSize > 0 && !isExpired ? (
          <QRCode value={qrText} size={qrCodeSize} quietZone={0} ecl="M" />
        ) : (
          <ActivityIndicator color={colors.accent} />
        )}
      </View>
    </View>
  ) : (
    <ActivityIndicator
      size="large"
      color={colors.accent}
      style={engagementStyles.progress}
    />
  );
}
