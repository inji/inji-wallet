import {NativeModules} from 'react-native';
import {MMKVLoader} from 'react-native-mmkv-storage';
import {__AppId} from '../GlobalVariables';
import {isCacheExpired} from '../Utils';

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

  async generateCredentialDisplayContent(
    credentialFormat: string,
    wellKnown: string,
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
      const result: string[] = await this.InjiVcRenderer.generateCredentialDisplayContent(
        credentialFormat,
        wellKnown ? JSON.stringify(wellKnown) : null,
        vcJson,
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
