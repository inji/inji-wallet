import {BackendResponseError, request} from './request';

jest.mock('./GlobalVariables', () => ({
  __AppId: {getValue: jest.fn().mockReturnValue('test-app-id')},
}));
jest.mock('./constants', () => ({
  MIMOTO_BASE_URL: 'https://mock-host.com',
  REQUEST_TIMEOUT: 'request timeout',
}));
jest.mock('./openId4VCI/Utils', () => ({
  ErrorMessage: {NETWORK_REQUEST_FAILED: 'Network request failed'},
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('request module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('BackendResponseError', () => {
    it('should create error with name and message', () => {
      const error = new BackendResponseError('ERROR_CODE', 'Error message');
      expect(error.name).toBe('ERROR_CODE');
      expect(error.message).toBe('Error message');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('request function', () => {
    it('should make GET request', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({response: 'ok'}),
      });
      const result = await request('GET', '/api/test');
      expect(result).toEqual({response: 'ok'});
    });

    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({response: 'created'}),
      });
      const result = await request('POST', '/api/test', {key: 'value'});
      expect(result).toEqual({response: 'created'});
      expect(mockFetch).toHaveBeenCalledWith(
        'https://mock-host.com/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({key: 'value'}),
        }),
      );
    });

    it('should add X-AppId header for mimoto paths', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({response: 'ok'}),
      });
      await request('GET', '/v1/mimoto/test');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({'X-AppId': 'test-app-id'}),
        }),
      );
    });

    it('should use full URL when path starts with https://', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({response: 'ok'}),
      });
      await request('GET', 'https://example.com/api');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api',
        expect.any(Object),
      );
    });

    it('should throw on HTTP 400+ errors', async () => {
      mockFetch.mockResolvedValue({
        status: 400,
        json: jest.fn().mockResolvedValue({message: 'Bad request'}),
      });
      await expect(request('GET', '/api/test')).rejects.toThrow('Bad request');
    });

    it('should throw BackendResponseError for structured errors', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({
          errors: [{errorCode: 'ERR001', errorMessage: 'Something went wrong'}],
        }),
      });
      await expect(request('GET', '/api/test')).rejects.toThrow(
        'Something went wrong',
      );
    });

    it('should handle custom headers', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockResolvedValue({response: 'ok'}),
      });
      await request('GET', '/api/test', undefined, undefined, {
        Authorization: 'Bearer token',
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {Authorization: 'Bearer token'},
        }),
      );
    });

    it('should throw on invalid JSON response', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        json: jest.fn().mockRejectedValue(new Error('parse error')),
      });
      await expect(request('GET', '/api/test')).rejects.toThrow();
    });

    it('should handle timeout with AbortController', async () => {
      mockFetch.mockRejectedValue({name: 'AbortError'});
      await expect(
        request('GET', '/api/test', undefined, undefined, undefined, 1000),
      ).rejects.toThrow();
    });

    it('should handle network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      await expect(request('GET', '/api/test')).rejects.toThrow();
    });
  });
});
