describe('useOverlayVisibleAfterTimeout', () => {
  let mockSetVisible: jest.Mock;
  let effectCallback: Function;
  let timeoutRef: {current: ReturnType<typeof setTimeout> | null};

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    mockSetVisible = jest.fn();
    effectCallback = null as any;
    timeoutRef = {current: null};

    jest.spyOn(require('react'), 'useState').mockImplementation((init: any) => {
      return [init, mockSetVisible];
    });
    jest.spyOn(require('react'), 'useRef').mockReturnValue(timeoutRef);
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
    expect(timeoutRef.current).not.toBeNull();
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
