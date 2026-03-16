import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {VcItemContainer} from './VcItemContainer';

jest.mock('./Views/VCCardView', () => ({
  VCCardView: (props: any) => {
    const {TouchableOpacity, Text} = require('react-native');
    return (
      <TouchableOpacity testID="mockVCCardView" onPress={props.onPress}>
        <Text>{JSON.stringify(props.vcMetadata)}</Text>
      </TouchableOpacity>
    );
  },
}));

describe('VcItemContainer', () => {
  const defaultProps = {
    vcMetadata: {issuer: 'test-issuer', id: 'test-id'},
    onPress: jest.fn(),
    isDownloading: false,
    isPinned: false,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<VcItemContainer {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when downloading', () => {
    const {toJSON} = render(
      <VcItemContainer {...defaultProps} isDownloading={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot when pinned', () => {
    const {toJSON} = render(
      <VcItemContainer {...defaultProps} isPinned={true} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should render VCCardView mock', () => {
    const {getByTestId} = render(<VcItemContainer {...defaultProps} />);
    expect(getByTestId('mockVCCardView')).toBeTruthy();
  });

  it('should call onPress when card is pressed', () => {
    const onPress = jest.fn();
    const {getByTestId} = render(
      <VcItemContainer {...defaultProps} onPress={onPress} />,
    );
    fireEvent.press(getByTestId('mockVCCardView'));
    expect(onPress).toHaveBeenCalled();
  });
});
