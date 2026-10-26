import {interpret} from 'xstate';
import {pinInputMachine} from './pinInput';

describe('pinInputMachine CLEAR', () => {
  const start = () => {
    const inputRefs = Array.from({length: 6}, () => ({
      current: {focus: jest.fn()},
    }));
    const service = interpret(
      pinInputMachine.withContext({
        ...pinInputMachine.context,
        inputRefs: inputRefs as any,
      }),
    ).start();
    return {service, inputRefs};
  };

  it('empties every box and goes back to the first one', () => {
    const {service, inputRefs} = start();
    '123456'
      .split('')
      .forEach((digit, index) =>
        service.send({type: 'UPDATE_INPUT', value: digit, index}),
      );
    expect(service.getSnapshot().context.values.join('')).toBe('123456');

    service.send({type: 'CLEAR'});

    const {context} = service.getSnapshot();
    expect(context.values).toEqual([]);
    expect(context.selectedIndex).toBe(0);
    expect(inputRefs[0].current.focus).toHaveBeenCalled();
  });
});
