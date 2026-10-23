import {useRef, createRef, MutableRefObject} from 'react';
import {useMachine} from '@xstate/react';
import {EventFrom} from 'xstate';
import {createModel} from 'xstate/lib/model';
import {TextInput} from 'react-native';

const model = createModel(
  {
    selectedIndex: 0,
    error: '',
    inputRefs: [] as PinInputRef[],
    values: [] as string[],
  },
  {
    events: {
      FOCUS_INPUT: (index: number) => ({index}),
      UPDATE_INPUT: (value: string, index: number) => ({value, index}),
      KEY_PRESS: (key: string) => ({key}),
      CLEAR: () => ({}),
    },
  },
);

export const pinInputMachine = model.createMachine(
  {
    predictableActionArguments: true,
    preserveActionOrder: true,
    tsTypes: {} as import('./pinInput.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'pinInput',
    initial: 'idle',
    states: {
      idle: {
        on: {
          CLEAR: {
            actions: ['clearAll', 'focusSelected'],
          },
          FOCUS_INPUT: {
            actions: ['selectInput'],
          },
          UPDATE_INPUT: [
            {
              cond: 'isBlank',
              actions: ['updateInput'],
            },
            {
              cond: 'hasNextInput',
              target: 'selectingNext',
              actions: ['updateInput'],
            },
            {
              actions: ['updateInput'],
            },
          ],
          KEY_PRESS: {
            cond: 'canGoBack',
            target: 'selectingPrev',
          },
        },
        after: {
          // allowance to wait for route transition to end
          INITIAL_FOCUS_DELAY: {
            actions: ['focusSelected'],
          },
        },
      },
      selectingNext: {
        entry: ['selectNextInput', 'focusSelected'],
        always: 'idle',
      },
      selectingPrev: {
        entry: ['selectPrevInput', 'clearInput', 'focusSelected'],
        always: 'idle',
      },
    },
  },
  {
    actions: {
      selectInput: model.assign({
        selectedIndex: (_, event) => event.index,
      }),

      selectNextInput: model.assign({
        selectedIndex: ({selectedIndex}) => selectedIndex + 1,
      }),

      selectPrevInput: model.assign({
        selectedIndex: ({selectedIndex}) => selectedIndex - 1,
      }),

      focusSelected: ({selectedIndex, inputRefs}) => {
        inputRefs[selectedIndex].current.focus();
      },

      clearAll: model.assign({
        values: () => [],
        selectedIndex: () => 0,
      }),

      clearInput: model.assign({
        values: ({values, selectedIndex}) => {
          const newValues = [...values];
          newValues[selectedIndex] = '';
          return newValues;
        },
      }),

      updateInput: model.assign({
        values: ({values}, event) => {
          const newValues = [...values];
          newValues[event.index] = event.value;
          return newValues;
        },
      }),
    },

    guards: {
      hasNextInput: ({inputRefs, selectedIndex}) => {
        return selectedIndex + 1 < inputRefs.length;
      },

      isBlank: (_, event) => {
        return !event.value;
      },

      canGoBack: ({values, selectedIndex}, event) => {
        return (
          selectedIndex - 1 >= 0 &&
          !values[selectedIndex] &&
          event.key === 'Backspace'
        );
      },
    },

    delays: {
      INITIAL_FOCUS_DELAY: 100,
    },
  },
);

export function usePinInput(length: number) {
  const machine = useRef(
    pinInputMachine.withContext({
      ...pinInputMachine.context,
      inputRefs: Array(length)
        .fill(null)
        .map(() => createRef()),
    }),
  );

  const [state, send] = useMachine(machine.current);

  return {
    state,
    send,
    events: model.events,
  };
}

export type PinInputRef = MutableRefObject<TextInput>;
