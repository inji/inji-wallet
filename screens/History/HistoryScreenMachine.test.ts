import {
  HistoryTabEvents,
  HistoryTabMachine,
  createHistoryTabMachine,
} from './HistoryScreenMachine';
import {interpret} from 'xstate';

describe('HistoryScreenMachine', () => {
  it('should start in idle state', () => {
    const service = interpret(HistoryTabMachine).start();
    expect(service.state.matches('idle')).toBe(true);
    service.stop();
  });

  it('createHistoryTabMachine should return machine with provided serviceRefs', () => {
    const mockServiceRefs = {vcMeta: {}, auth: {}} as any;
    const machine = createHistoryTabMachine(mockServiceRefs);
    expect(machine.context.serviceRefs).toBe(mockServiceRefs);
  });
});
