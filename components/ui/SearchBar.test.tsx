import React from 'react';
import {render} from '@testing-library/react-native';
import {SearchBar} from './SearchBar';

jest.mock('./svg', () => ({
  SvgImage: {SearchIcon: () => 'SearchIcon'},
}));

describe('SearchBar', () => {
  const defaultProps = {
    searchIconTestID: 'searchIcon',
    searchBarTestID: 'searchBar',
    search: '',
    placeholder: 'Search...',
    onFocus: jest.fn(),
    onChangeText: jest.fn(),
    onLayout: jest.fn(),
  };

  it('should render with default props', () => {
    const {toJSON} = render(<SearchBar {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with vc search style', () => {
    const {toJSON} = render(<SearchBar {...defaultProps} isVcSearch={true} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render with search value', () => {
    const {toJSON} = render(
      <SearchBar {...defaultProps} search="test query" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render as non-editable', () => {
    const {toJSON} = render(<SearchBar {...defaultProps} editable={false} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
