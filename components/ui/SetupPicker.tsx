import React, {useEffect, useState} from 'react';
import {Dimensions, View} from 'react-native';
import {Icon, ListItem} from 'react-native-elements';
import {Column} from './Layout';
import {Text} from './Text';
import {Theme} from './styleUtils';
import testIDProps from '../../shared/commonUtil';

interface Picker extends React.VFC<PickerProps<unknown>> {
  <T>(props: PickerProps<T>): ReturnType<React.FC>;
}

export const SetupPicker: Picker = (props: PickerProps<unknown>) => {
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
    <Column
      testID={props.testID}
      width={Dimensions.get('window').width * 0.8}
      backgroundColor={Theme.Colors.whiteBackgroundColor}>
      {props.items.map((item, index) => {
        const isSelected = selectedIndex === index;
        return (
          <ListItem
            bottomDivider
            topDivider={index !== 0}
            onPress={() => selectItem(index)}>
            <ListItem.Content>
              <ListItem.Title
                {...testIDProps(item.value)}
                style={{paddingTop: 3}}>
                <Text
                  color={isSelected ? Theme.Colors.Icon : null}
                  weight={isSelected ? 'semibold' : 'regular'}>
                  {item.label}
                </Text>
              </ListItem.Title>
            </ListItem.Content>
            {isSelected ? (
              <View style={Theme.Styles.listItemSelectedCircle} />
            ) : (
              <Icon
                name="radio-button-unchecked"
                color={Theme.Colors.GrayIcon}
              />
            )}
          </ListItem>
        );
      })}
    </Column>
  );
};

interface PickerProps<T> {
  testID?: string;
  items: PickerItem<T>[];
  selectedValue: T;
  onValueChange: (value: T, index: number) => void;
}

interface PickerItem<T> {
  label: string;
  value: T;
}
