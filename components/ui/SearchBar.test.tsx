import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Dimensions} from 'react-native';
import {SearchBar} from './SearchBar';

jest.mock('./svg', () => ({
  SvgImage: {SearchIcon: () => 'SearchIcon'},
}));

describe('SearchBar', () => {
  beforeEach(() => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      width: 375,
      height: 667,
      scale: 2,
      fontScale: 2,
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  it('should call onChangeText when text is entered', () => {
    const onChangeText = jest.fn();
    const {getByTestId} = render(
      <SearchBar {...defaultProps} onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByTestId('searchBar'), 'hello');
    expect(onChangeText).toHaveBeenCalledWith('hello');
  });

  it('should call onFocus when search bar is focused', () => {
    const onFocus = jest.fn();
    const {getByTestId} = render(
      <SearchBar {...defaultProps} onFocus={onFocus} />,
    );
    fireEvent(getByTestId('searchBar'), 'focus');
    expect(onFocus).toHaveBeenCalled();
  });
});
