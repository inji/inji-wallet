import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('./QrLoginController', () => ({
  useQrLogin: () => ({
    isShowingVcList: true,
    shareableVcsMetadata: [],
    selectedIndex: null,
    SELECT_VC_ITEM: () => jest.fn(),
    DISMISS: jest.fn(),
    VERIFY: jest.fn(),
  }),
}));

jest.mock('../../components/ui/Modal', () => ({
  Modal: ({children, ...props}: any) => {
    const {View} = require('react-native');
    return (
      <View testID="modal" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('../../components/VC/VcItemContainer', () => ({
  VcItemContainer: () => null,
}));

jest.mock('../../shared/Utils', () => ({
  VCItemContainerFlowType: {QR_LOGIN: 'QR_LOGIN'},
  getVCsOrderedByPinStatus: (vcs: any) => vcs || [],
}));

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {MyBindedVcs} from './MyBindedVcs';

describe('MyBindedVcs', () => {
  it('should render empty state', () => {
    const {toJSON} = render(
      <MyBindedVcs isVisible={true} service={{} as any} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
