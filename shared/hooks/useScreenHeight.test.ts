describe('useScreenHeight', () => {
  let mockSetKeyboardHeight: jest.Mock;
  let effectCallback: Function;
  let keyboardListeners: Record<string, Function>;

  beforeEach(() => {
    jest.resetModules();
    mockSetKeyboardHeight = jest.fn();
    effectCallback = null as any;
    keyboardListeners = {};

    jest.spyOn(require('react'), 'useState').mockImplementation((init: any) => {
      return [init, mockSetKeyboardHeight];
    });
    jest
      .spyOn(require('react'), 'useEffect')
      .mockImplementation((cb: Function) => {
        effectCallback = cb;
      });

    const {Keyboard} = require('react-native');
    Keyboard.addListener = jest.fn((event: string, handler: Function) => {
      keyboardListeners[event] = handler;
      return {remove: jest.fn()};
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return isSmallScreen and screenHeight', () => {
    const {useScreenHeight} = require('./useScreenHeight');
    const result = useScreenHeight();
    expect(result).toHaveProperty('isSmallScreen');
    expect(result).toHaveProperty('screenHeight');
  });

  it('should register keyboard listeners in useEffect', () => {
    const {Keyboard} = require('react-native');
    const {useScreenHeight} = require('./useScreenHeight');
    useScreenHeight();
    effectCallback();
    expect(Keyboard.addListener).toHaveBeenCalledWith(
      'keyboardDidShow',
      expect.any(Function),
    );
    expect(Keyboard.addListener).toHaveBeenCalledWith(
      'keyboardDidHide',
      expect.any(Function),
    );
  });

  it('keyboardDidShow sets keyboard height + 150', () => {
    const {useScreenHeight} = require('./useScreenHeight');
    useScreenHeight();
    effectCallback();
    keyboardListeners['keyboardDidShow']({endCoordinates: {height: 300}});
    expect(mockSetKeyboardHeight).toHaveBeenCalledWith(450);
  });

  it('keyboardDidHide sets keyboard height to 0', () => {
    const {useScreenHeight} = require('./useScreenHeight');
    useScreenHeight();
    effectCallback();
    keyboardListeners['keyboardDidHide']();
    expect(mockSetKeyboardHeight).toHaveBeenCalledWith(0);
  });

  it('cleanup removes listeners', () => {
    const removeSpy1 = jest.fn();
    const removeSpy2 = jest.fn();
    const {Keyboard} = require('react-native');
    let callIdx = 0;
    Keyboard.addListener = jest.fn(() => {
      callIdx++;
      return {remove: callIdx === 1 ? removeSpy1 : removeSpy2};
    });

    const {useScreenHeight} = require('./useScreenHeight');
    useScreenHeight();
    const cleanup = effectCallback();
    if (cleanup) cleanup();
    expect(removeSpy1).toHaveBeenCalled();
    expect(removeSpy2).toHaveBeenCalled();
  });
});
