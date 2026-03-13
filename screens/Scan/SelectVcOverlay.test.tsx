import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-elements', () => {
  const {View, TouchableOpacity, Text} = require('react-native');
  return {
    Overlay: ({children, ...props}: any) => (
      <View testID="overlay" {...props}>
        {children}
      </View>
    ),
    Button: (props: any) => (
      <TouchableOpacity testID={props.testID} onPress={props.onPress}>
        <Text>{props.title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('./SelectVcOverlayController', () => ({
  useSelectVcOverlay: () => ({
    selectedIndex: null,
    selectVcItem: (i: number) => jest.fn(),
    onSelect: jest.fn(),
    onVerifyAndSelect: jest.fn(),
  }),
}));

jest.mock('../../components/VC/VcItemContainer', () => ({
  VcItemContainer: () => null,
}));

jest.mock('../../shared/Utils', () => ({
  VCItemContainerFlowType: {VC_SHARE: 'VC_SHARE'},
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {SelectVcOverlay} from './SelectVcOverlay';

describe('SelectVcOverlay', () => {
  it('should render when visible', () => {
    const {toJSON} = render(
      <SelectVcOverlay
        isVisible={true}
        receiverName="Test Receiver"
        vcMetadatas={[]}
        onSelect={jest.fn()}
        onVerifyAndSelect={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
