import {useEffect, useState} from 'react';
import {NativeModules} from 'react-native';
import {MAX_QR_DATA_LENGTH} from '../../shared/constants';
import {compactVcForQr} from '../../shared/qr/compactVcForQr';
import {VCFormat} from '../../shared/VCFormat';
import {VCMetadata} from '../../shared/VCMetadata';

const {RNPixelpassModule, RNSecureKeystoreModule} = NativeModules;

/**
 * The credential's own verification QR, as "Show QR" builds it and from the same cache, for the
 * back of the card. Only built once `enabled` (the back is showing).
 *
 * Not for an mdoc: its QR is a live engagement, which the card back gets from `QrCodeOverlay`
 * together with the Bluetooth session that answers it.
 */
export function useCardQr(
  meta: VCMetadata | undefined,
  credential: any,
  enabled: boolean,
) {
  const [qr, setQr] = useState<string | null>(null);
  const supported = !!meta && meta.format !== VCFormat.mso_mdoc;

  useEffect(() => {
    if (!enabled || !supported || qr || !credential?.credential) return;
    let cancelled = false;
    (async () => {
      const cached = await RNSecureKeystoreModule.getData(meta!.id).catch(
        () => null,
      );
      if (cached?.[1] && cached[1].length < MAX_QR_DATA_LENGTH)
        return cached[1];
      const claim169 = credential.credential?.credentialSubject?.claim169;
      const first =
        claim169 && typeof claim169 === 'object'
          ? claim169[Object.keys(claim169)[0]]
          : undefined;
      if (
        typeof first === 'string' &&
        first.trim() &&
        first.length < MAX_QR_DATA_LENGTH
      )
        return first;
      let data = await RNPixelpassModule.generateQRData(
        JSON.stringify(credential.credential),
        '',
      );
      if (data?.length >= MAX_QR_DATA_LENGTH) {
        data = await RNPixelpassModule.generateQRData(
          compactVcForQr(credential.credential),
          '',
        );
      }
      if (data?.length < MAX_QR_DATA_LENGTH) {
        await RNSecureKeystoreModule.storeData(meta!.id, data);
        return data;
      }
      return null;
    })()
      .catch(() => null)
      .then(data => !cancelled && setQr(data ?? null));
    return () => {
      cancelled = true;
    };
  }, [enabled, supported, credential]);

  return {qr, supported};
}
