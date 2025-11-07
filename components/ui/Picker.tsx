import React, {useEffect, useState} from 'react';
import {Dimensions, Pressable} from 'react-native';
import {Icon, ListItem, Overlay} from 'react-native-elements';
import {Column} from './Layout';
import {Text} from './Text';
import testIDProps from '../../shared/commonUtil';
import {Theme} from './styleUtils';

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
        overlayStyle={Theme.Styles.overlay}>
        <Column
          testID={props.testID}
          width={Dimensions.get('window').width * 0.8}>
          {props.items.map((item, index) => {
            const isSelected = selectedIndex === index;
            return (
              <ListItem
                key={String(item.value ?? index)}
                topDivider={index !== 0}
                onPress={() => selectItem(index)}
                containerStyle={
                  isSelected
                    ? Theme.Styles.listItemSelectedContainer
                    : Theme.Styles.listItemUnselectedContainer
                }>
                <ListItem.Content>
                  <ListItem.Title {...testIDProps(item.value as string)}>
                    <Text
                      style={
                        isSelected
                          ? Theme.Styles.listItemSelectedText
                          : Theme.Styles.listItemUnselectedText
                      }>
                      {item.label}
                    </Text>
                  </ListItem.Title>
                </ListItem.Content>

                {isSelected && (
                  <Icon name="check" color={Theme.Colors.ListSelectedIcon} />
                )}
              </ListItem>
            );
          })}
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
