import {NativeModules} from 'react-native';
import {MMKVLoader} from 'react-native-mmkv-storage';
import {CACHE_TTL} from '../constants';
import {__AppId} from '../GlobalVariables';

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

  private makeCacheKey(vcId: string) {
    return `${CACHE_KEY_PREFIX}${vcId}`;
  }

  async renderVC(
    credentialFormat: string,
    wellKnown: string,
    vcJson: string,
  ): Promise<string[]> {
    const vc = JSON.parse(vcJson);
    const vcId = vc.id ?? JSON.stringify(vc);
    const cacheKey = this.makeCacheKey(vcId);
    const cachedRaw = await MMKV.getItem(cacheKey);
    if (cachedRaw && typeof cachedRaw === 'string') {
      try {
        const cached: CachedSvg = JSON.parse(cachedRaw);
        const withinTTL = Date.now() - cached.timestamp < CACHE_TTL;

        if (withinTTL) {
          return cached.data;
        }
      } catch (e) {
        console.warn('::::failed to parse cached SVG, ignoring::::', e);
      }
    }

    try {
      const result: string[] = await this.InjiVcRenderer.renderVC(
        credentialFormat,
        wellKnown,
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
      throw rendererError;
    }
  }

  async clearCache(vcId: string) {
    const cacheKey = this.makeCacheKey(vcId);
    await MMKV.removeItem(cacheKey);
  }
}

export default VcRenderer;
