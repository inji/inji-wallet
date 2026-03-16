jest.mock('../tuvali', () => ({
  verifier: {
    handleDataEvents: jest.fn(cb => {
      cb({type: 'onDataReceived', data: 'test'});
      return {remove: jest.fn()};
    }),
  },
}));
jest.mock('../tuvali/types/events', () => ({}));

import {subscribe} from './verifierEventHandler';
import {verifier} from '../tuvali';

describe('verifierEventHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should export subscribe function', () => {
    expect(typeof subscribe).toBe('function');
  });

  it('should call verifier.handleDataEvents with a callback', () => {
    const callback = jest.fn();
    subscribe(callback);
    expect(verifier.handleDataEvents).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it('should forward events to the provided callback', () => {
    const callback = jest.fn();
    subscribe(callback);
    expect(callback).toHaveBeenCalledWith({
      type: 'onDataReceived',
      data: 'test',
    });
  });

  it('should return the subscription from handleDataEvents', () => {
    const callback = jest.fn();
    const result = subscribe(callback);
    expect(result).toHaveProperty('remove');
  });
});
