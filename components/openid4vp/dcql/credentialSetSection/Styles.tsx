import {StyleSheet} from "react-native";
import {Theme} from "../../../ui/styleUtils";

export const styles = StyleSheet.create({
  dottedBorderContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Theme.Colors.dottedBorderColor,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  simpleCombinedSection: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.Colors.inputSelection,
    marginHorizontal: 8,
    marginBottom: 8,
    backgroundColor: Theme.Colors.whiteBackgroundColor,
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  simpleCombinedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  simpleCombinedSectionTitleWrapper: {
    flex: 1,
    marginLeft: 8,
  },
  simpleCombinedSectionTitle: Theme.TextStyles.sectionHeader,
  simpleCombinedSectionBody: {
    paddingHorizontal: 4,
  },
});
