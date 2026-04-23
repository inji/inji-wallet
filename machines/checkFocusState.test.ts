import {AppState} from 'react-native';
import {createCheckFocusStateService} from './checkFocusState';
import {isAndroid} from '../shared/constants';

jest.mock('../shared/constants', () => ({
  isAndroid: jest.fn(),
}));

describe('createCheckFocusStateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isAndroid as jest.Mock).mockReturnValue(false);
  });

  it('registers exactly one AppState change listener and cleans it up once', () => {
    const subscriptions: Array<{event: string; remove: jest.Mock}> = [];

    (AppState.addEventListener as jest.Mock).mockImplementation(
      (event: string) => {
        const remove = jest.fn();
        subscriptions.push({event, remove});
        return {remove};
      },
    );

    const callback = jest.fn();
    const cleanup = createCheckFocusStateService(callback);

    expect(AppState.addEventListener).toHaveBeenCalledTimes(1);
    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0].event).toBe('change');

    cleanup();

    expect(subscriptions[0].remove).toHaveBeenCalledTimes(1);
  });

  it('emits the current AppState immediately on setup', () => {
    const callback = jest.fn();

    createCheckFocusStateService(callback);

    expect(callback).toHaveBeenCalledWith({type: 'ACTIVE'});
  });

  it('registers Android blur and focus listeners in addition to change', () => {
    (isAndroid as jest.Mock).mockReturnValue(true);

    const subscriptions: Array<{event: string; remove: jest.Mock}> = [];

    (AppState.addEventListener as jest.Mock).mockImplementation(
      (event: string) => {
        const remove = jest.fn();
        subscriptions.push({event, remove});
        return {remove};
      },
    );

    const callback = jest.fn();
    const cleanup = createCheckFocusStateService(callback);

    expect(subscriptions.map(item => item.event)).toEqual([
      'change',
      'blur',
      'focus',
    ]);

    cleanup();

    subscriptions.forEach(subscription => {
      expect(subscription.remove).toHaveBeenCalledTimes(1);
    });
  });
});
