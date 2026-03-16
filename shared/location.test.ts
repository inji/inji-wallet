// Note: Jest with react-native preset resolves .ios.ts by default
// location.ios.ts exports checkLocation and requestLocation (different from location.ts)
import {checkLocation, requestLocation} from './location';

describe('location (iOS)', () => {
  it('checkLocation should call onEnabled immediately on iOS', () => {
    const onEnabled = jest.fn();
    checkLocation(onEnabled);
    expect(onEnabled).toHaveBeenCalled();
  });

  it('requestLocation should not throw', () => {
    expect(() => requestLocation()).not.toThrow();
  });
});
