import React from 'react';
import {TextInput} from 'react-native';
import {Icon} from 'react-native-elements';
import {Row} from './Layout';
import {Theme} from './styleUtils';

export const SearchBar = ({
  searchIconTestID,
  searchBarTestID,
  placeholder,
  search,
  onFocus,
  onChangeText,
  onLayout,
  editable = true,
}: SearchBarProps) => {
  return (
    <Row style={Theme.SearchBarStyles.innerSearchBarContainer}>
      <TextInput
        testID={searchBarTestID}
        style={Theme.SearchBarStyles.searchBar}
        placeholder={placeholder}
        placeholderTextColor={Theme.Colors.SearchBarPlaceholderColor}
        value={search}
        onFocus={onFocus}
        onChangeText={searchText => onChangeText(searchText)}
        onLayout={onLayout}
        editable={editable ?? true}
      />
      <Icon
        testID={searchIconTestID}
        name="search"
        type="material"
        color={Theme.Colors.SearchIcon}
        size={27}
        style={Theme.SearchBarStyles.searchIcon}
      />
    </Row>
  );
};

interface SearchBarProps {
  searchIconTestID: string;
  searchBarTestID: string;
  search: string;
  placeholder: string;
  onFocus: () => void;
  onChangeText: (searchText: string) => void;
  onLayout: () => void;
  editable?: boolean;
}
