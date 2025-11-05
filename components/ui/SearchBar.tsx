import React from 'react';
import {TextInput, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {Row} from './Layout';
import {Theme} from './styleUtils';
import {SvgImage} from './svg';

export const SearchBar = ({
  isVcSearch = false,
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
      {isVcSearch ? (
        <View
          testID={searchIconTestID}
          style={Theme.SearchBarStyles.vcSearchIcon}>
          {SvgImage.SearchIcon()}
        </View>
      ) : (
        <Icon
          testID={searchIconTestID}
          name="search"
          type="material"
          color={Theme.Colors.SearchIcon}
          size={27}
          style={Theme.SearchBarStyles.searchIcon}
        />
      )}
    </Row>
  );
};

interface SearchBarProps {
  isVcSearch: Boolean;
  searchIconTestID: string;
  searchBarTestID: string;
  search: string;
  placeholder: string;
  onFocus: () => void;
  onChangeText: (searchText: string) => void;
  onLayout: () => void;
  editable?: boolean;
}
