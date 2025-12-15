import React, {useEffect, useState} from 'react';
import {TextInput} from 'react-native';
import {usePinInput} from '../machines/pinInput';
import {Row} from './ui';
import {Theme} from './ui/styleUtils';

export const PinInput: React.FC<PinInputProps> = props => {
  const {state, send, events} = usePinInput(props.length);
  const {inputRefs, values} = state.context;
  const {UPDATE_INPUT, FOCUS_INPUT, KEY_PRESS} = events;
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const current = values.join('');
    props.onChange?.(current);

    if (
      props.autosubmit &&
      props.onDone &&
      values.filter(Boolean).length === inputRefs.length
    ) {
      props.onDone(current);
    }
  }, [values]);

  return (
    <Row
      width={`${(100 / 6) * props.length}%`}
      testID={props.testID}
      removeClippedSubviews={true}>
      {inputRefs.map((input, index) => (
        <TextInput
          contextMenuHidden={true}
          selectTextOnFocus
          keyboardType="numeric"
          maxLength={1}
          secureTextEntry
          selectionColor={Theme.Colors.inputSelection}
          style={
            index > focusedIndex
              ? Theme.PinInputStyle.input
              : Theme.PinInputStyle.onEnteringPin
          }
          key={index}
          ref={input}
          value={values[index]}
          // KNOWN ISSUE: https://github.com/facebook/react-native/issues/19507
          onKeyPress={({nativeEvent}) => send(KEY_PRESS(nativeEvent.key))}
          onChangeText={(value: string) =>
            send(UPDATE_INPUT(value.replace(/\D/g, ''), index))
          }
          onFocus={() => {
            setFocusedIndex(index);
            send(FOCUS_INPUT(index));
          }}
        />
      ))}
    </Row>
  );
};

interface PinInputProps {
  testID?: string;
  length: number;
  onDone?: (value: string) => void;
  onChange?: (value: string) => void;
  autosubmit?: boolean;
}
