jest.mock('../tuvali', () => ({
  wallet: {
    handleDataEvents: jest.fn(cb => {
      cb({type: 'onDataSent', data: 'payload'});
      return {remove: jest.fn()};
    }),
  },
}));
jest.mock('../tuvali/types/events', () => ({}));

import {subscribe} from './walletEventHandler';
import {wallet} from '../tuvali';

describe('walletEventHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should export subscribe function', () => {
    expect(typeof subscribe).toBe('function');
  });

  it('should call wallet.handleDataEvents with a callback', () => {
    const callback = jest.fn();
    subscribe(callback);
    expect(wallet.handleDataEvents).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should forward events to the provided callback', () => {
    const callback = jest.fn();
    subscribe(callback);
    expect(callback).toHaveBeenCalledWith({
      type: 'onDataSent',
      data: 'payload',
    });
  });

  it('should return the subscription', () => {
    const callback = jest.fn();
    const result = subscribe(callback);
    expect(result).toHaveProperty('remove');
  });
});
