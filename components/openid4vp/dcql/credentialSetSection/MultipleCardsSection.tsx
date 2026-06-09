import React from "react";
import {View} from "react-native";
import testIDProps from "../../../../shared/commonUtil";
import {Checkbox, CheckboxSelectionType} from "../../../ui/checkbox/Checkbox";
import {styles} from "./Styles";
import {Text} from "../../../ui";

export default function MultipleCardsSection(props: {
  testId: string,
  optionIndex: number,
  checked: boolean,
  onPress: () => void,
  title: string,
  option: Array<string>,
  renderCard: (credentialQueryId: string) => React.JSX.Element | null
}) {
  return <View

    {...testIDProps(`${props.testId}-option-${props.optionIndex}-combined`)}
    style={styles.simpleCombinedSection}>
    <View style={styles.simpleCombinedSectionHeader}>
      <Checkbox
        testId={`${props.testId}-option-${props.optionIndex}-select-all`}
        selectionType={CheckboxSelectionType.SINGLE}
        checked={props.checked}
        onPress={props.onPress}
      />
      <View style={styles.simpleCombinedSectionTitleWrapper}>
        <Text style={styles.simpleCombinedSectionTitle}>
          {props.title}
        </Text>
      </View>
    </View>
    <View style={styles.simpleCombinedSectionBody}>
      {props.option.map(props.renderCard)}
    </View>
  </View>
}
