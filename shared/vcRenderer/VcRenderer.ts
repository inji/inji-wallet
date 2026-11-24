import {NativeModules} from 'react-native';
import {MMKVLoader} from 'react-native-mmkv-storage';
import {__AppId} from '../GlobalVariables';
import {isCacheExpired} from '../Utils';
import {VCFormat} from '../VCFormat';
import {createMdocDisplayModel, DecodedMdoc} from './mdoc/MdocDisplayModel';
import {OriginalImages, readOriginalMdoc} from './mdoc/MdocImages';
import {MdocTemplateConfig, templateUrlFor} from './mdoc/MdocTemplates';

const MMKV = new MMKVLoader().initialize();
const CACHE_KEY_PREFIX = 'vc_renderer_svg_';

type CachedSvg = {
  data: string[];
  timestamp: number;
};

class VcRenderer {
  private static instance: VcRenderer;
  private InjiVcRenderer = NativeModules.InjiVcRenderer;

  private constructor() {
    this.InjiVcRenderer.init(__AppId.getValue());
  }

  static getInstance(): VcRenderer {
    if (!VcRenderer.instance) {
      VcRenderer.instance = new VcRenderer();
    }
    return VcRenderer.instance;
  }

  private createCacheKey(vcId: string) {
    return `${CACHE_KEY_PREFIX}${vcId}`;
  }

  /** The docType and images from the original credential, which PixelPass decoding loses. */
  private readOriginalMdoc(decodedMdoc: DecodedMdoc, encodedMdoc: string) {
    try {
      const original = readOriginalMdoc(encodedMdoc);
      return {
        docType: original.docType ?? decodedMdoc.docType,
        images: original.images as Partial<OriginalImages>,
      };
    } catch {
      console.debug('[CredentialSvg] Binary image recovery unavailable');
      return {docType: decodedMdoc.docType, images: {}};
    }
  }

  /** The QR the card shows: the credential itself, as in the field view, not the display model. */
  private credentialQrData(encodedMdoc: string): Promise<string> {
    return NativeModules.RNPixelpassModule.generateQRData(
      JSON.stringify(encodedMdoc),
      '',
    );
  }

  async generateMdocDisplayContent(
    decodedMdoc: DecodedMdoc,
    templateConfig: MdocTemplateConfig,
    encodedMdoc?: string,
  ): Promise<string[]> {
    if (!encodedMdoc)
      throw new Error('Mdoc QR requires the encoded credential');
    const {docType, images} = this.readOriginalMdoc(decodedMdoc, encodedMdoc);
    const templateUrl = templateUrlFor(docType, templateConfig);
    console.debug('[CredentialSvg] Template selection', {
      docType,
      matched: Boolean(templateUrl),
    });
    if (!templateUrl) return [];

    const displayModel = createMdocDisplayModel(
      decodedMdoc,
      templateUrl,
      images,
    );
    // the native renderer only accepts ldp_vc, so only the display model crosses that boundary,
    // never the mdoc; not cached, since the model has no credential id and holds personal data
    return this.InjiVcRenderer.generateCredentialDisplayContent(
      VCFormat.ldp_vc,
      null,
      JSON.stringify(displayModel),
      await this.credentialQrData(encodedMdoc),
    );
  }

  async generateCredentialDisplayContent(
    credentialFormat: string,
    wellKnown: unknown,
    vcJson: string,
  ): Promise<string[]> {
    const vc = JSON.parse(vcJson);
    const vcId = vc.id ?? JSON.stringify(vc);
    const cacheKey = this.createCacheKey(vcId);
    const cachedRaw = await MMKV.getItem(cacheKey);
    if (cachedRaw && typeof cachedRaw === 'string') {
      try {
        const cached: CachedSvg = JSON.parse(cachedRaw);

        if (!isCacheExpired(cached.timestamp)) {
          return cached.data;
        } else {
          await this.clearCache(vcId);
        }
      } catch (e) {
        console.warn('::::failed to parse cached SVG, ignoring::::', e);
        await this.clearCache(vcId);
      }
    }

    try {
      const result: string[] =
        await this.InjiVcRenderer.generateCredentialDisplayContent(
          credentialFormat,
          wellKnown ? JSON.stringify(wellKnown) : null,
          vcJson,
          null,
        );

      if (result && result.length > 0) {
        const payload: CachedSvg = {
          data: result,
          timestamp: Date.now(),
        };
        await MMKV.setItem(cacheKey, JSON.stringify(payload));
      }

      return result;
    } catch (rendererError) {
      await this.clearCache(vcId);
      throw rendererError;
    }
  }

  async clearCache(vcId: string) {
    const cacheKey = this.createCacheKey(vcId);
    MMKV.removeItem(cacheKey);
  }
}

export default VcRenderer;
