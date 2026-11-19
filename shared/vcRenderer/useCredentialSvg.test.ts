import {act, renderHook, waitFor} from '@testing-library/react-native';
import {useCredentialSvg} from './useCredentialSvg';
import VcRenderer from './VcRenderer';
import {VCProcessor} from '../../components/VC/common/VCProcessor';
import {getMdocTemplateConfig} from './mdoc/MdocTemplates';

// Global screen snapshot setup stubs effects; these tests exercise real effects.
jest.unmock('react');

jest.mock('./mdoc/MdocTemplates', () => ({
  getMdocTemplateConfig: jest.fn(),
}));
jest.mock('../../components/VC/common/VCProcessor', () => ({
  VCProcessor: {processForRendering: jest.fn()},
}));
const mockMdocRender = jest.fn();
const mockJsonRender = jest.fn();
jest.mock('./VcRenderer', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      generateMdocDisplayContent: mockMdocRender,
      generateCredentialDisplayContent: mockJsonRender,
    })),
  },
}));

describe('credential SVG loading', () => {
  const credential = {credential: 'signed-mdoc'} as any;
  const decoded = {issuerSigned: {nameSpaces: {}}};
  const url = 'https://mimoto.example/templates.json';
  const templateConfig = {
    baseUrl: 'https://inji.github.io/inji-config/mdoc/',
    templateFileByDocType: {'org.iso.18013.5.1.mDL': 'coastal.svg'},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getMdocTemplateConfig as jest.Mock).mockResolvedValue(templateConfig);
    (VCProcessor.processForRendering as jest.Mock).mockResolvedValue(decoded);
    mockMdocRender.mockResolvedValue(['<svg/>']);
  });

  it('renders mdoc without an issuer renderMethod', async () => {
    const {result} = renderHook(() =>
      useCredentialSvg(credential, 'mso_mdoc', null),
    );
    await waitFor(() =>
      expect(result.current).toEqual({
        svgTemplate: ['<svg/>'],
        loadingSvg: false,
        svgRendererError: null,
      }),
    );
    expect(mockMdocRender).toHaveBeenCalledWith(
      decoded,
      templateConfig,
      'signed-mdoc',
    );
    expect(mockJsonRender).not.toHaveBeenCalled();
  });

  it('preserves the field view when no mdoc templates are configured', async () => {
    (getMdocTemplateConfig as jest.Mock).mockResolvedValue(undefined);
    const {result} = renderHook(() =>
      useCredentialSvg(credential, 'mso_mdoc', null),
    );
    await waitFor(() =>
      expect(result.current).toEqual({
        svgTemplate: null,
        loadingSvg: false,
        svgRendererError: null,
      }),
    );
    expect(VcRenderer.getInstance).not.toHaveBeenCalled();
  });

  it.each([new Error('fetch failed'), {errorCode: 'INVALID_TEMPLATE'}])(
    'falls back after renderer failure %p',
    async error => {
      mockMdocRender.mockRejectedValue(error);
      const {result} = renderHook(() =>
        useCredentialSvg(credential, 'mso_mdoc', null),
      );
      await waitFor(() =>
        expect(result.current).toEqual({
          svgTemplate: null,
          loadingSvg: false,
          svgRendererError:
            'errorCode' in error ? error.errorCode : 'Unknown error',
        }),
      );
    },
  );

  it('does not display an obsolete render after switching credentials', async () => {
    let finish!: (result: string[]) => void;
    mockMdocRender.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = resolve;
        }),
    );
    const {result, rerender} = renderHook(
      ({vc}) => useCredentialSvg(vc, 'mso_mdoc', null),
      {
        initialProps: {vc: credential},
      },
    );
    await waitFor(() => expect(mockMdocRender).toHaveBeenCalledTimes(1));
    rerender({vc: {credential: 'new-mdoc'}});
    await waitFor(() => expect(result.current.svgTemplate).toEqual(['<svg/>']));
    await act(async () => {
      finish(['<svg>obsolete</svg>']);
    });
    expect(result.current.svgTemplate).toEqual(['<svg/>']);
  });

  it('keeps the JSON-LD renderer contract', async () => {
    const vc = {credential: {renderMethod: {template: {id: url}}}} as any;
    mockJsonRender.mockResolvedValue(['<svg>jsonld</svg>']);
    const {result} = renderHook(() => useCredentialSvg(vc, 'ldp_vc', null));
    await waitFor(() =>
      expect(result.current.svgTemplate).toEqual(['<svg>jsonld</svg>']),
    );
    expect(mockJsonRender).toHaveBeenCalledWith(
      'ldp_vc',
      null,
      JSON.stringify(vc.credential),
    );
  });
});
