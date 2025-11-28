import React, {useEffect, useState} from 'react';
import {Dimensions, Pressable} from 'react-native';
import {Icon, ListItem, Overlay} from 'react-native-elements';
import {Column} from './Layout';
import {Text} from './Text';
import testIDProps from '../../shared/commonUtil';

interface Picker extends React.VFC<PickerProps<unknown>> {
  <T>(props: PickerProps<T>): ReturnType<React.FC>;
}

export const Picker: Picker = (props: PickerProps<unknown>) => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    setSelectedIndex(
      props.items.findIndex(({value}) => value === props.selectedValue),
    );
  }, [props.selectedValue]);

  const toggleContent = () => setIsContentVisible(!isContentVisible);

  const selectItem = (index: number) => {
    setSelectedIndex(index);
    props.onValueChange(props.items[index].value, index);
    toggleContent();
  };

  return (
    <React.Fragment>
      <Pressable onPress={toggleContent}>{props.triggerComponent}</Pressable>
      <Overlay
        isVisible={isContentVisible}
        onBackdropPress={toggleContent}
        overlayStyle={{padding: 1}}>
        <Column
          testID={props.testID}
          width={Dimensions.get('window').width * 0.8}>
          {props.items.map((item, index) => (
            <ListItem
              topDivider={index !== 0}
              onPress={() => selectItem(index)}
              key={index}>
              <ListItem.Content>
                <ListItem.Title {...testIDProps(item.value as string)}>
                  <Text>{item.label}</Text>
                </ListItem.Title>
              </ListItem.Content>
              {selectedIndex === index && <Icon name="check" />}
            </ListItem>
          ))}
        </Column>
      </Overlay>
    </React.Fragment>
  );
};

interface PickerProps<T> {
  testID?: string;
  items: PickerItem<T>[];
  selectedValue: T;
  triggerComponent: React.ReactElement;
  onValueChange: (value: T, index: number) => void;
}

interface PickerItem<T> {
  label: string;
  value: T;
}
