describe('useOverlayVisibleAfterTimeout', () => {
  let mockSetVisible: jest.Mock;
  let mockSetSavingTimeout: jest.Mock;
  let effectCallback: Function;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    mockSetVisible = jest.fn();
    mockSetSavingTimeout = jest.fn();
    effectCallback = null as any;

    let callCount = 0;
    jest.spyOn(require('react'), 'useState').mockImplementation((init: any) => {
      callCount++;
      if (callCount % 2 === 1) return [init, mockSetVisible];
      return [init, mockSetSavingTimeout];
    });
    jest
      .spyOn(require('react'), 'useEffect')
      .mockImplementation((cb: Function) => {
        effectCallback = cb;
      });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should export useOverlayVisibleAfterTimeout', () => {
    const {
      useOverlayVisibleAfterTimeout,
    } = require('./useOverlayVisibleAfterTimeout');
    expect(typeof useOverlayVisibleAfterTimeout).toBe('function');
  });

  it('should return false by default', () => {
    const {
      useOverlayVisibleAfterTimeout,
    } = require('./useOverlayVisibleAfterTimeout');
    const result = useOverlayVisibleAfterTimeout();
    expect(result).toBe(false);
  });

  it('should set timeout when visibleStart is true', () => {
    const {
      useOverlayVisibleAfterTimeout,
    } = require('./useOverlayVisibleAfterTimeout');
    useOverlayVisibleAfterTimeout(true, 500);
    effectCallback();
    expect(mockSetSavingTimeout).toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(mockSetVisible).toHaveBeenCalledWith(true);
  });

  it('should clear timeout and set visible false when visibleStart is false', () => {
    const {
      useOverlayVisibleAfterTimeout,
    } = require('./useOverlayVisibleAfterTimeout');
    useOverlayVisibleAfterTimeout(false, 500);
    effectCallback();
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });
});
