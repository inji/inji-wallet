describe('useOverlayVisibleAfterTimeout', () => {
  let mockSetVisible: jest.Mock;
  let effectCallback: any;
  let cleanupCallback: any;
  let timeoutRef: {current: ReturnType<typeof setTimeout> | null};
  let mockClearTimeout: jest.SpyInstance;
  let mockSetTimeout: jest.SpyInstance;
  let useOverlayVisibleAfterTimeout: any;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    mockSetVisible = jest.fn();
    effectCallback = null;
    cleanupCallback = null;
    timeoutRef = {current: null};

    // Spy on clearTimeout and setTimeout to track calls
    mockClearTimeout = jest.spyOn(global, 'clearTimeout');
    mockSetTimeout = jest.spyOn(global, 'setTimeout');

    jest.spyOn(require('react'), 'useState').mockImplementation((init: any) => {
      return [init, mockSetVisible];
    });
    jest.spyOn(require('react'), 'useRef').mockReturnValue(timeoutRef);
    jest
      .spyOn(require('react'), 'useEffect')
      .mockImplementation((cb: any) => {
        effectCallback = () => {
          cleanupCallback = cb();
        };
      });

    useOverlayVisibleAfterTimeout = require('./useOverlayVisibleAfterTimeout').useOverlayVisibleAfterTimeout;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should export useOverlayVisibleAfterTimeout', () => {
    expect(typeof useOverlayVisibleAfterTimeout).toBe('function');
  });

  it('should return false by default', () => {
    const result = useOverlayVisibleAfterTimeout();
    expect(result).toBe(false);
  });

  it('should set timeout when visibleStart is true', () => {
    useOverlayVisibleAfterTimeout(true, 500);
    effectCallback();
    expect(timeoutRef.current).not.toBeNull();
    jest.advanceTimersByTime(500);
    expect(mockSetVisible).toHaveBeenCalledWith(true);
  });

  it('should clear timeout and set visible false when visibleStart is false', () => {
    useOverlayVisibleAfterTimeout(false, 500);
    effectCallback();
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });

  it('should clear existing timeout when timeoutRef.current is already set', () => {

    // Simulate a timeout already being set
    const existingTimeoutId = 12345 as any;
    timeoutRef.current = existingTimeoutId;

    // Call effect with visibleStart true
    useOverlayVisibleAfterTimeout(true, 500);
    effectCallback();

    // Verify clearTimeout was called for the existing timeout
    expect(mockClearTimeout).toHaveBeenCalledWith(existingTimeoutId);
    // Verify a new timeout was set
    expect(mockSetTimeout).toHaveBeenCalled();
  });

  it('should clear timeout and set timeoutRef.current to null when visibleStart is false', () => {

    // Simulate a timeout already being set
    const existingTimeoutId = 12345 as any;
    timeoutRef.current = existingTimeoutId;

    // Call effect with visibleStart false
    useOverlayVisibleAfterTimeout(false, 500);
    effectCallback();

    // Verify clearTimeout was called
    expect(mockClearTimeout).toHaveBeenCalledWith(existingTimeoutId);
    // Verify setVisible(false) was called
    expect(mockSetVisible).toHaveBeenCalledWith(false);
    // Verify timeoutRef.current is set to null
    expect(timeoutRef.current).toBeNull();
  });

  it('should execute cleanup function and clear timeout on unmount', () => {

    // Setup: Create active timeout
    const activeTimeoutId = 67890 as any;
    timeoutRef.current = activeTimeoutId;

    useOverlayVisibleAfterTimeout(true, 500);
    effectCallback();

    // Execute cleanup function (simulating unmount)
    if (cleanupCallback) {
      cleanupCallback();
    }

    // Verify clearTimeout was called in cleanup
    expect(mockClearTimeout).toHaveBeenCalledWith(activeTimeoutId);
    // Verify timeoutRef.current is null after cleanup
    expect(timeoutRef.current).toBeNull();
  });

  it('should use default parameters when not provided', () => {

    // Call without parameters (should use defaults: visibleStart = false, ms = 1000)
    useOverlayVisibleAfterTimeout();
    effectCallback();

    // Should set visible to false (default visibleStart is false)
    expect(mockSetVisible).toHaveBeenCalledWith(false);
    // Timeout should not be set since visibleStart is false
    expect(mockSetTimeout).not.toHaveBeenCalled();
  });

  it('should handle multiple dependency changes while timeout is pending', () => {

    // First call: start timeout
    const firstTimeoutId = 11111 as any;
    timeoutRef.current = firstTimeoutId;
    mockSetTimeout.mockReturnValueOnce(firstTimeoutId);

    useOverlayVisibleAfterTimeout(true, 500);
    effectCallback();

    mockSetTimeout.mockClear();
    mockClearTimeout.mockClear();

    // Second call: change ms parameter (should clear first timeout)
    const secondTimeoutId = 22222 as any;
    timeoutRef.current = firstTimeoutId; // Simulate active timeout
    mockSetTimeout.mockReturnValueOnce(secondTimeoutId);

    useOverlayVisibleAfterTimeout(true, 1000);
    effectCallback();

    // Verify first timeout was cleared
    expect(mockClearTimeout).toHaveBeenCalledWith(firstTimeoutId);
    // Verify new timeout was set with new duration
    expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('should transition from visibleStart true to false during active timeout', () => {

    // First: Start with timeout
    const firstTimeoutId = 55555 as any;
    timeoutRef.current = firstTimeoutId;
    mockSetTimeout.mockReturnValueOnce(firstTimeoutId);

    useOverlayVisibleAfterTimeout(true, 500);
    effectCallback();

    expect(mockSetTimeout).toHaveBeenCalled();

    mockSetTimeout.mockClear();
    mockClearTimeout.mockClear();
    mockSetVisible.mockClear();

    // Second: Change to visibleStart false
    timeoutRef.current = firstTimeoutId;
    useOverlayVisibleAfterTimeout(false, 500);
    effectCallback();

    // Verify timeout was cleared
    expect(mockClearTimeout).toHaveBeenCalledWith(firstTimeoutId);
    // Verify visible was set to false
    expect(mockSetVisible).toHaveBeenCalledWith(false);
    // Verify no new timeout was created
    expect(mockSetTimeout).not.toHaveBeenCalled();
  });

  it('should not set timeout when visibleStart is false even after cleanup', () => {

    useOverlayVisibleAfterTimeout(false, 500);
    effectCallback();

    // Execute cleanup
    if (cleanupCallback) {
      cleanupCallback();
    }

    // Verify timeout was never created
    expect(mockSetTimeout).not.toHaveBeenCalled();
    // Verify setVisible(false) was called at least once
    expect(mockSetVisible).toHaveBeenCalledWith(false);
  });

  it('should advance time and fire timeout callback with jest.advanceTimersByTime', () => {

    useOverlayVisibleAfterTimeout(true, 1500);
    effectCallback();

    mockSetVisible.mockClear();

    // Advance partway through timeout
    jest.advanceTimersByTime(1000);
    expect(mockSetVisible).not.toHaveBeenCalledWith(true);

    // Advance to complete timeout
    jest.advanceTimersByTime(500);
    expect(mockSetVisible).toHaveBeenCalledWith(true);
  });
});
