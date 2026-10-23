import {VCItemServices} from './VCItemServices';
import {verifyCredentialData} from '../../../shared/openId4VCI/Utils';

jest.mock('../../../shared/openId4VCI/Utils', () => ({
  verifyCredentialData: jest.fn(),
  getMatchingCredentialIssuerMetadata: jest.fn(),
}));
jest.mock('../../../shared/api', () => ({
  __esModule: true,
  default: jest.fn(),
  API_URLS: {},
  CACHED_API: {},
}));
jest.mock('../../../shared/CloudBackupAndRestoreUtils', () => ({}));
jest.mock('../../../shared/cryptoutil/cryptoUtil', () => ({}));
jest.mock('../../../shared/request', () => ({request: jest.fn()}));
jest.mock('../../../shared/vcjs/verifyCredential', () => ({
  VERIFICATION_TIMEOUT_IN_MS: 5000,
}));

const verified = {isVerified: true, verificationErrorCode: ''};
const context = {verifiableCredential: {credential: {}}, format: 'ldp_vc'};

describe('VCItemServices verifyCredential', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('checks one card at a time, starting each timeout on its own turn', async () => {
    const pending: Array<(value: unknown) => void> = [];
    (verifyCredentialData as jest.Mock).mockImplementation(
      () => new Promise(resolve => pending.push(resolve)),
    );
    const {verifyCredential} = VCItemServices({});

    const first = verifyCredential(context);
    const second = verifyCredential(context);
    await Promise.resolve();
    expect(verifyCredentialData).toHaveBeenCalledTimes(1);

    // Waiting in line longer than the timeout must not fail the second card.
    jest.advanceTimersByTime(4000);
    pending[0](verified);
    await expect(first).resolves.toEqual(verified);

    jest.advanceTimersByTime(4000);
    expect(verifyCredentialData).toHaveBeenCalledTimes(2);
    pending[1](verified);
    await expect(second).resolves.toEqual(verified);
  });

  it('moves on to the next card when one fails', async () => {
    (verifyCredentialData as jest.Mock)
      .mockRejectedValueOnce(new Error('ERR_NETWORK'))
      .mockResolvedValueOnce(verified);
    const {verifyCredential} = VCItemServices({});

    const first = verifyCredential(context);
    const second = verifyCredential(context);

    await expect(first).rejects.toThrow('ERR_NETWORK');
    await expect(second).resolves.toEqual(verified);
  });
});
