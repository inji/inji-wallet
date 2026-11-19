jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
  }));
});

import {NativeModules} from 'react-native';

// Set up NativeModules for VcRenderer
NativeModules.InjiVcRenderer = {
  generateCredentialDisplayContent: jest.fn(() =>
    Promise.resolve(['<svg>page1</svg>', '<svg>page2</svg>']),
  ),
  init: jest.fn(),
};
NativeModules.RNPixelpassModule = {
  generateQRData: jest.fn(() => Promise.resolve('NCFPIXELPASSQR')),
};

jest.mock('../GlobalVariables', () => ({
  __AppId: {
    getValue: jest.fn(() => 'test-app-id'),
    setValue: jest.fn(),
  },
}));

jest.mock('../Utils', () => ({
  isCacheExpired: jest.fn(() => true),
}));

const mockMMKV = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

jest.mock('react-native-mmkv-storage', () => ({
  MMKVLoader: jest.fn().mockImplementation(() => ({
    initialize: jest.fn(() => mockMMKV),
  })),
}));

import VcRenderer from './VcRenderer';
import {isCacheExpired} from '../Utils';

jest.mock('./mdoc/MdocTemplates', () => ({
  templateUrlFor: jest.fn(() => 'https://mimoto.example/coastal.svg'),
}));

const templateConfig = {
  baseUrl: 'https://mimoto.example/',
  templateFileByDocType: {demo: 'coastal.svg'},
};

describe('VcRenderer', () => {
  let renderer: any;

  beforeEach(() => {
    jest.clearAllMocks();
    renderer = VcRenderer.getInstance();
  });

  describe('singleton pattern', () => {
    it('getInstance returns same instance', () => {
      const a = VcRenderer.getInstance();
      const b = VcRenderer.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('clearCache', () => {
    it('clears the SVG cache for a given vcId', async () => {
      await renderer.clearCache('vc-123');
      expect(mockMMKV.removeItem).toHaveBeenCalledWith(
        'vc_renderer_svg_vc-123',
      );
    });
  });

  it('renders an ephemeral mdoc model through native without persistent caching', async () => {
    const result = await renderer.generateMdocDisplayContent(
      {
        nameSpaces: {
          demo: [{elementIdentifier: 'name', elementValue: 'Holder'}],
        },
      },
      templateConfig,
      'encoded-mdoc',
    );
    expect(result).toEqual(['<svg>page1</svg>', '<svg>page2</svg>']);
    expect(
      NativeModules.InjiVcRenderer.generateCredentialDisplayContent,
    ).toHaveBeenCalledWith(
      'ldp_vc',
      null,
      JSON.stringify({
        claims: {demo: {name: 'Holder'}},
        portraits: {
          demo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=',
        },
        signatures: {
          demo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=',
        },
        renderMethod: [
          {
            type: 'TemplateRenderMethod',
            renderSuite: 'svg-mustache',
            template: {id: 'https://mimoto.example/coastal.svg'},
          },
        ],
      }),
      'NCFPIXELPASSQR',
    );
    expect(mockMMKV.setItem).not.toHaveBeenCalled();
    expect(mockMMKV.getItem).not.toHaveBeenCalled();
  });

  it('generateMdocDisplayContent builds the QR from the encoded credential the same way the field view QR does', async () => {
    const decoded = {
      nameSpaces: {demo: [{elementIdentifier: 'name', elementValue: 'Holder'}]},
    };

    await renderer.generateMdocDisplayContent(
      decoded,
      templateConfig,
      'encoded-mdoc',
    );

    expect(NativeModules.RNPixelpassModule.generateQRData).toHaveBeenCalledWith(
      JSON.stringify('encoded-mdoc'),
      '',
    );
  });

  it('generateMdocDisplayContent rejects without calling native when the encoded credential is missing', async () => {
    const decoded = {
      nameSpaces: {demo: [{elementIdentifier: 'name', elementValue: 'Holder'}]},
    };

    const render = renderer.generateMdocDisplayContent(decoded, templateConfig);

    await expect(render).rejects.toThrow(
      'Mdoc QR requires the encoded credential',
    );
    expect(
      NativeModules.InjiVcRenderer.generateCredentialDisplayContent,
    ).not.toHaveBeenCalled();
  });

  describe('generateCredentialDisplayContent', () => {
    it('is a method on the instance', () => {
      expect(typeof renderer.generateCredentialDisplayContent).toBe('function');
    });

    it('should return cached data if available and not expired', async () => {
      jest.mocked(isCacheExpired).mockReturnValue(false);
      mockMMKV.getItem.mockResolvedValue(
        JSON.stringify({data: ['<svg>cached</svg>'], timestamp: Date.now()}),
      );
      const result = await renderer.generateCredentialDisplayContent(
        'ldp_vc',
        '{}',
        JSON.stringify({id: 'test-vc', type: 'VerifiableCredential'}),
      );
      expect(result).toEqual(['<svg>cached</svg>']);
    });

    it('should fetch from native when cache is expired', async () => {
      jest.mocked(isCacheExpired).mockReturnValue(true);
      mockMMKV.getItem.mockResolvedValue(
        JSON.stringify({data: ['<svg>old</svg>'], timestamp: 1000}),
      );
      const result = await renderer.generateCredentialDisplayContent(
        'ldp_vc',
        '{"display":[]}',
        JSON.stringify({id: 'test-vc-2', type: 'VerifiableCredential'}),
      );
      expect(result).toEqual(['<svg>page1</svg>', '<svg>page2</svg>']);
    });

    it('generateCredentialDisplayContent leaves QR data to the native renderer for JSON-LD credentials', async () => {
      mockMMKV.getItem.mockResolvedValue(null);
      const vcJson = JSON.stringify({id: 'ldp-qr-vc'});

      await renderer.generateCredentialDisplayContent('ldp_vc', null, vcJson);

      expect(
        NativeModules.InjiVcRenderer.generateCredentialDisplayContent,
      ).toHaveBeenCalledWith('ldp_vc', null, vcJson, null);
    });

    it('should fetch from native when no cache', async () => {
      mockMMKV.getItem.mockResolvedValue(null);
      const result = await renderer.generateCredentialDisplayContent(
        'mso_mdoc',
        null,
        JSON.stringify({id: 'mdoc-1'}),
      );
      expect(result).toEqual(['<svg>page1</svg>', '<svg>page2</svg>']);
      expect(mockMMKV.setItem).toHaveBeenCalled();
    });

    it('should handle corrupt cache gracefully', async () => {
      mockMMKV.getItem.mockResolvedValue('not-valid-json');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = await renderer.generateCredentialDisplayContent(
        'ldp_vc',
        '{}',
        JSON.stringify({id: 'corrupt-cache-vc'}),
      );
      expect(result).toEqual(['<svg>page1</svg>', '<svg>page2</svg>']);
      consoleSpy.mockRestore();
    });

    it('should throw when native renderer fails', async () => {
      mockMMKV.getItem.mockResolvedValue(null);
      NativeModules.InjiVcRenderer.generateCredentialDisplayContent.mockRejectedValueOnce(
        new Error('Renderer failed'),
      );
      await expect(
        renderer.generateCredentialDisplayContent(
          'ldp_vc',
          '{}',
          JSON.stringify({id: 'fail-vc'}),
        ),
      ).rejects.toThrow('Renderer failed');
    });

    it('should use vc content as id if vc.id is missing', async () => {
      mockMMKV.getItem.mockResolvedValue(null);
      await renderer.generateCredentialDisplayContent(
        'ldp_vc',
        '{}',
        JSON.stringify({type: 'NoIdVC'}),
      );
      expect(mockMMKV.setItem).toHaveBeenCalled();
    });

    it('should pass null wellKnown when empty string', async () => {
      mockMMKV.getItem.mockResolvedValue(null);
      await renderer.generateCredentialDisplayContent(
        'ldp_vc',
        '',
        JSON.stringify({id: 'vc-null-wk'}),
      );
      expect(
        NativeModules.InjiVcRenderer.generateCredentialDisplayContent,
      ).toHaveBeenCalledWith('ldp_vc', null, expect.any(String), null);
    });

    it('should throw when vcJson is undefined', async () => {
      mockMMKV.getItem.mockResolvedValue(null);
      await expect(
        renderer.generateCredentialDisplayContent(
          'ldp_vc',
          '{}',
          undefined as any,
        ),
      ).rejects.toThrow();
    });
  });
});
