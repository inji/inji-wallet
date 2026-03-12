import React from 'react';
import {render} from '@testing-library/react-native';
import {VcDetailsContainer} from './VcDetailsContainer';

jest.mock('./Views/VCDetailView', () => ({
  VCDetailView: (props: any) => {
    const {View, Text} = require('react-native');
    return (
      <View testID="mockVCDetailView">
        <Text>{JSON.stringify(props.vcMetadata)}</Text>
      </View>
    );
  },
}));

describe('VcDetailsContainer', () => {
  const defaultProps = {
    vcMetadata: {issuer: 'test-issuer', id: 'test-id'},
    credential: null,
    verifiableCredentialData: null,
    activeTab: 0,
  };

  it('should match snapshot', () => {
    const {toJSON} = render(<VcDetailsContainer {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different props', () => {
    const {toJSON} = render(
      <VcDetailsContainer {...defaultProps} activeTab={1} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should pass vcMetadata to VCDetailView', () => {
    const {getByTestId, getByText} = render(
      <VcDetailsContainer {...defaultProps} />,
    );
    expect(getByTestId('mockVCDetailView')).toBeTruthy();
    expect(getByText(JSON.stringify(defaultProps.vcMetadata))).toBeTruthy();
  });
});
