import React from 'react';
import {render} from '@testing-library/react-native';
import {VcItemContainer} from './VcItemContainer';

jest.mock('./Views/VCCardView', () => ({
  VCCardView: (props: any) => {
    const {View, Text} = require('react-native');
    return (
      <View testID="mockVCCardView">
        <Text>{JSON.stringify(props.vcMetadata)}</Text>
      </View>
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
});
