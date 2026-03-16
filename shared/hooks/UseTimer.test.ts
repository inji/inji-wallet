describe('UseTimer', () => {
  let mockSetTime: jest.Mock;
  let useEffectCallbacks: Function[];
  let useEffectCleanups: (Function | undefined)[];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockSetTime = jest.fn();
    useEffectCallbacks = [];
    useEffectCleanups = [];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function getUseTimer() {
    let timerResult: [number, () => void];
    const refValues: {current: any}[] = [];
    let refIndex = 0;

    // Override the global React mock for this call
    const origReact = require('react');
    const origUseState = origReact.useState;
    const origUseEffect = origReact.useEffect;
    const origUseRef = origReact.useRef;

    origReact.useState = (init: any) => [init, mockSetTime];
    origReact.useRef = (init: any) => {
      if (refIndex >= refValues.length) {
        refValues.push({current: init});
      }
      return refValues[refIndex++];
    };
    origReact.useEffect = (cb: Function) => {
      useEffectCallbacks.push(cb);
      const cleanup = cb();
      useEffectCleanups.push(cleanup);
    };

    const {useTimer} = require('./UseTimer');
    timerResult = useTimer({initialValue: 5});

    origReact.useState = origUseState;
    origReact.useEffect = origUseEffect;
    origReact.useRef = origUseRef;

    return {timerResult, refValues};
  }

  it('should export useTimer as a function', () => {
    const {useTimer} = require('./UseTimer');
    expect(typeof useTimer).toBe('function');
  });

  it('should accept initialValue parameter', () => {
    const {useTimer} = require('./UseTimer');
    expect(useTimer.length).toBe(1);
  });

  it('should return initial time value', () => {
    const {timerResult} = getUseTimer();
    expect(timerResult[0]).toBe(5);
  });

  it('should return start function', () => {
    const {timerResult} = getUseTimer();
    expect(typeof timerResult[1]).toBe('function');
  });

  it('should set interval when start is called', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const {timerResult} = getUseTimer();
    timerResult[1](); // call start
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    setIntervalSpy.mockRestore();
  });

  it('should decrement timerRef in interval callback', () => {
    let intervalCb: Function;
    jest.spyOn(global, 'setInterval').mockImplementation((cb: any) => {
      intervalCb = cb;
      return 1 as any;
    });

    const {timerResult, refValues} = getUseTimer();
    timerResult[1](); // start
    intervalCb!();

    expect(refValues[0].current).toBe(4); // decremented from 5
    expect(mockSetTime).toHaveBeenCalledWith(4);

    (global.setInterval as any).mockRestore();
  });

  it('should clear interval when timer goes below 0', () => {
    let intervalCb: Function;
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    jest.spyOn(global, 'setInterval').mockImplementation((cb: any) => {
      intervalCb = cb;
      return 42 as any;
    });

    const {timerResult, refValues} = getUseTimer();
    refValues[0].current = 0; // set timerRef to 0
    timerResult[1](); // start
    intervalCb!(); // timer goes to -1

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
    (global.setInterval as any).mockRestore();
  });

  it('should clear existing interval on re-start', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const {timerResult, refValues} = getUseTimer();

    // Simulate existing timer
    refValues[1].current = 99;
    timerResult[1](); // start again should clear first

    expect(clearIntervalSpy).toHaveBeenCalledWith(99);
    clearIntervalSpy.mockRestore();
  });

  it('should return cleanup function from useEffect', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const {refValues} = getUseTimer();

    // The second useEffect (cleanup one) should return a cleanup function
    const cleanupFn = useEffectCleanups.find(fn => typeof fn === 'function');
    expect(cleanupFn).toBeDefined();
    refValues[1].current = 77;
    cleanupFn!();
    expect(clearIntervalSpy).toHaveBeenCalledWith(77);
    clearIntervalSpy.mockRestore();
  });
});
