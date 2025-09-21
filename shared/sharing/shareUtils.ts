import RNShare, {ShareOptions} from 'react-native-share';
import VcRenderer from '../vcRenderer/VcRenderer';
import Share from 'react-native-share';

export async function shareImageToAllSupportedApps(
  sharingOptions: ShareOptions,
): Promise<Boolean> {
  try {
    const shareStatusResult = await RNShare.open(sharingOptions);
    return shareStatusResult['success'];
  } catch (err) {
    console.error('Exception while sharing image::', err);
    return false;
  }
}

export const sharePdfToAllSupportedApps = async (
  svgBase64: string[],
): Promise<void> => {
  try {
    const pdfBase64: string = await VcRenderer.getInstance().convertSvgToPdf(
      svgBase64,
    );

    await Share.open({
      title: 'Share Verifiable Credential',
      url: `data:application/pdf;base64,${pdfBase64}`,
      type: 'application/pdf',
      failOnCancel: false,
    });
  } catch (e) {
    console.error('Export PDF failed:', e);
  }
};
