import {
  getMdocTemplateConfig,
  MdocTemplateConfig,
  templateUrlFor,
} from './MdocTemplates';
import getAllConfigurations from '../../api';

jest.mock('../../api', () => ({__esModule: true, default: jest.fn()}));

const mockWalletConfig: Record<string, string> = {};
jest.mock('../../InitialConfig', () => ({
  INITIAL_CONFIG: {
    get allProperties() {
      return mockWalletConfig;
    },
  },
}));

describe('mdoc template configuration', () => {
  const baseUrl = 'https://inji.github.io/inji-config/mdoc/';
  const mapping = {'org.iso.18013.5.1.mDL': 'coastal.svg'};
  const walletBaseUrl = 'https://abc123.ngrok.app/mdoc/';
  const walletMapping = {'org.iso.18013.5.1.mDL': 'test.svg'};

  beforeEach(() => {
    jest.clearAllMocks();
    mockWalletConfig.mdocTemplateBaseUrl = '';
    mockWalletConfig.mdocTemplates = '';
  });

  it('getMdocTemplateConfig uses Mimoto allProperties when it has both values', async () => {
    mockWalletConfig.mdocTemplateBaseUrl = walletBaseUrl;
    mockWalletConfig.mdocTemplates = JSON.stringify(walletMapping);
    jest.mocked(getAllConfigurations).mockResolvedValue({
      mdocTemplateBaseUrl: baseUrl,
      mdocTemplates: JSON.stringify(mapping),
    });

    const config = await getMdocTemplateConfig();

    expect(config).toEqual({
      baseUrl,
      templateFileByDocType: mapping,
    });
  });

  it('getMdocTemplateConfig falls back to the wallet config when Mimoto has no mdoc template properties', async () => {
    mockWalletConfig.mdocTemplateBaseUrl = walletBaseUrl;
    mockWalletConfig.mdocTemplates = JSON.stringify(walletMapping);
    jest.mocked(getAllConfigurations).mockResolvedValue({
      cacheTTLInMilliSeconds: '3600000',
    });

    const config = await getMdocTemplateConfig();

    expect(config).toEqual({
      baseUrl: walletBaseUrl,
      templateFileByDocType: walletMapping,
    });
  });

  it('getMdocTemplateConfig takes a value Mimoto does not have from the wallet config', async () => {
    mockWalletConfig.mdocTemplateBaseUrl = walletBaseUrl;
    mockWalletConfig.mdocTemplates = JSON.stringify(walletMapping);
    jest.mocked(getAllConfigurations).mockResolvedValue({
      mdocTemplateBaseUrl: baseUrl,
    });

    const config = await getMdocTemplateConfig();

    expect(config).toEqual({
      baseUrl,
      templateFileByDocType: walletMapping,
    });
  });

  it('getMdocTemplateConfig uses the wallet config that is returned while Mimoto is unreachable', async () => {
    mockWalletConfig.mdocTemplateBaseUrl = walletBaseUrl;
    mockWalletConfig.mdocTemplates = JSON.stringify(walletMapping);
    // getAllConfigurations answers with InitialConfig itself when Mimoto cannot be reached
    jest.mocked(getAllConfigurations).mockResolvedValue(mockWalletConfig);

    const config = await getMdocTemplateConfig();

    expect(config).toEqual({
      baseUrl: walletBaseUrl,
      templateFileByDocType: walletMapping,
    });
  });

  it('getMdocTemplateConfig returns undefined when neither Mimoto nor the wallet config has the values', async () => {
    jest.mocked(getAllConfigurations).mockResolvedValue({});

    const config = await getMdocTemplateConfig();

    expect(config).toBeUndefined();
  });

  it('getMdocTemplateConfig ignores a Mimoto mapping that is not valid JSON', async () => {
    jest.mocked(getAllConfigurations).mockResolvedValue({
      mdocTemplateBaseUrl: baseUrl,
      mdocTemplates: '{not json',
    });

    const config = await getMdocTemplateConfig();

    expect(config).toBeUndefined();
  });
});

describe('mdoc template lookup', () => {
  const config: MdocTemplateConfig = {
    baseUrl: 'https://inji.github.io/inji-config/mdoc/',
    templateFileByDocType: {
      'org.iso.18013.5.1.mDL': 'coastal.svg',
      'org.iso.23220.photoID.1': 'aurora.svg',
      'eu.europa.ec.eudi.hiid.1': 'health.svg',
      'org.iso.7367.1.mVRC': 'vehicle.svg',
    },
  };

  it.each([
    ['org.iso.18013.5.1.mDL', 'coastal.svg'],
    ['org.iso.23220.photoID.1', 'aurora.svg'],
    ['eu.europa.ec.eudi.hiid.1', 'health.svg'],
    ['org.iso.7367.1.mVRC', 'vehicle.svg'],
  ])(
    'templateUrlFor returns the template under the base URL for %s',
    (docType, filename) => {
      const url = templateUrlFor(docType, config);

      expect(url).toBe('https://inji.github.io/inji-config/mdoc/' + filename);
    },
  );

  it('templateUrlFor adds the folder slash when the base URL has none', () => {
    const noSlash = {...config, baseUrl: 'https://example.org/mdoc'};

    const url = templateUrlFor('org.iso.18013.5.1.mDL', noSlash);

    expect(url).toBe('https://example.org/mdoc/coastal.svg');
  });

  it.each(['unknown', 'org.iso.18013.5.1.mdl', '__proto__'])(
    'templateUrlFor returns null when no template is configured for %s',
    docType => {
      const url = templateUrlFor(docType, config);

      expect(url).toBeNull();
    },
  );

  it('templateUrlFor returns null without a docType', () => {
    const url = templateUrlFor(undefined, config);

    expect(url).toBeNull();
  });

  it('templateUrlFor uses a plain HTTP base URL as given', () => {
    // a local template server
    const local = {...config, baseUrl: 'http://192.168.1.10:8212/mdoc/'};

    const url = templateUrlFor('org.iso.18013.5.1.mDL', local);

    expect(url).toBe('http://192.168.1.10:8212/mdoc/coastal.svg');
  });
});
