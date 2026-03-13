import {interpret} from 'xstate';
import {pinInputMachine} from './pinInput';

describe('machines/pinInput', () => {
  describe('pinInputMachine', () => {
    it('should have id pinInput', () => {
      expect(pinInputMachine.id).toBe('pinInput');
    });

    it('should start in idle state', () => {
      expect(pinInputMachine.initialState.value).toBe('idle');
    });

    it('should have context with default values', () => {
      const ctx = pinInputMachine.initialState.context;
      expect(ctx.selectedIndex).toBe(0);
      expect(ctx.error).toBe('');
      expect(ctx.inputRefs).toEqual([]);
      expect(ctx.values).toEqual([]);
    });

    it('should handle FOCUS_INPUT event in idle state', () => {
      const state = pinInputMachine.transition('idle', {
        type: 'FOCUS_INPUT',
        index: 2,
      });
      expect(state.value).toBe('idle');
      expect(state.context.selectedIndex).toBe(2);
    });

    it('should handle UPDATE_INPUT with blank value in idle', () => {
      const state = pinInputMachine.transition('idle', {
        type: 'UPDATE_INPUT',
        value: '',
        index: 0,
      });
      expect(state.value).toBe('idle');
    });

    it('should handle UPDATE_INPUT with value via interpret', done => {
      const machine = pinInputMachine.withContext({
        selectedIndex: 0,
        error: '',
        inputRefs: [
          {current: {focus: jest.fn()}},
          {current: {focus: jest.fn()}},
        ] as any,
        values: ['', ''],
      });
      const service = interpret(machine).start();
      service.send({type: 'UPDATE_INPUT', value: '1', index: 0});
      // selectingNext transitions immediately back to idle via always
      expect(service.state.value).toBe('idle');
      expect(service.state.context.values[0]).toBe('1');
      expect(service.state.context.selectedIndex).toBe(1);
      service.stop();
      done();
    });

    it('should handle KEY_PRESS Backspace via interpret', done => {
      const machine = pinInputMachine.withContext({
        selectedIndex: 1,
        error: '',
        inputRefs: [
          {current: {focus: jest.fn()}},
          {current: {focus: jest.fn()}},
        ] as any,
        values: ['1', ''],
      });
      const service = interpret(machine).start();
      service.send({type: 'KEY_PRESS', key: 'Backspace'});
      // selectingPrev transitions immediately back to idle via always
      expect(service.state.value).toBe('idle');
      expect(service.state.context.selectedIndex).toBe(0);
      service.stop();
      done();
    });

    it('should not go back when at first index', () => {
      const machine = pinInputMachine.withContext({
        selectedIndex: 0,
        error: '',
        inputRefs: [{current: {focus: jest.fn()}}] as any,
        values: [''],
      });
      const service = interpret(machine).start();
      service.send({type: 'KEY_PRESS', key: 'Backspace'});
      expect(service.state.value).toBe('idle');
      expect(service.state.context.selectedIndex).toBe(0);
      service.stop();
    });
  });

  describe('machine config', () => {
    it('should have idle, selectingNext, selectingPrev states', () => {
      const states = Object.keys(pinInputMachine.states);
      expect(states).toContain('idle');
      expect(states).toContain('selectingNext');
      expect(states).toContain('selectingPrev');
    });

    it('should define events FOCUS_INPUT, UPDATE_INPUT, KEY_PRESS', () => {
      // Verify events are handled in idle state
      const idleState = pinInputMachine.states.idle;
      const eventKeys = Object.keys(idleState.on);
      expect(eventKeys).toContain('FOCUS_INPUT');
      expect(eventKeys).toContain('UPDATE_INPUT');
      expect(eventKeys).toContain('KEY_PRESS');
    });
  });

  describe('guard implementations', () => {
    const guards = (pinInputMachine as any).options.guards;

    it('hasNextInput returns true when more inputs remain', () => {
      expect(guards.hasNextInput({inputRefs: [{}, {}], selectedIndex: 0})).toBe(
        true,
      );
    });

    it('hasNextInput returns false at last input', () => {
      expect(guards.hasNextInput({inputRefs: [{}, {}], selectedIndex: 1})).toBe(
        false,
      );
    });

    it('isBlank returns true for empty value', () => {
      expect(guards.isBlank({}, {value: ''})).toBe(true);
    });

    it('isBlank returns false for non-empty value', () => {
      expect(guards.isBlank({}, {value: '5'})).toBe(false);
    });

    it('canGoBack returns true when Backspace at empty non-first index', () => {
      expect(
        guards.canGoBack(
          {values: ['1', ''], selectedIndex: 1},
          {key: 'Backspace'},
        ),
      ).toBe(true);
    });

    it('canGoBack returns false at first index', () => {
      expect(
        guards.canGoBack({values: [''], selectedIndex: 0}, {key: 'Backspace'}),
      ).toBe(false);
    });

    it('canGoBack returns false for non-Backspace key', () => {
      expect(
        guards.canGoBack({values: ['1', ''], selectedIndex: 1}, {key: 'a'}),
      ).toBe(false);
    });

    it('canGoBack returns false when current value is not empty', () => {
      expect(
        guards.canGoBack(
          {values: ['1', '2'], selectedIndex: 1},
          {key: 'Backspace'},
        ),
      ).toBe(false);
    });
  });

  describe('action implementations', () => {
    const actions = (pinInputMachine as any).options.actions;

    it('selectInput assigns event.index', () => {
      expect(actions.selectInput.assignment.selectedIndex({}, {index: 3})).toBe(
        3,
      );
    });

    it('selectNextInput increments selectedIndex', () => {
      expect(
        actions.selectNextInput.assignment.selectedIndex({selectedIndex: 1}),
      ).toBe(2);
    });

    it('selectPrevInput decrements selectedIndex', () => {
      expect(
        actions.selectPrevInput.assignment.selectedIndex({selectedIndex: 2}),
      ).toBe(1);
    });

    it('focusSelected calls focus on the ref at selectedIndex', () => {
      const focusSpy = jest.fn();
      const ctx = {
        selectedIndex: 1,
        inputRefs: [
          {current: {focus: jest.fn()}},
          {current: {focus: focusSpy}},
        ],
      };
      actions.focusSelected(ctx);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('clearInput clears value at selectedIndex', () => {
      const result = actions.clearInput.assignment.values({
        values: ['1', '2', '3'],
        selectedIndex: 1,
      });
      expect(result).toEqual(['1', '', '3']);
    });

    it('updateInput sets value at given index', () => {
      const result = actions.updateInput.assignment.values(
        {values: ['', '', '']},
        {value: '7', index: 1},
      );
      expect(result).toEqual(['', '7', '']);
    });
  });
});
