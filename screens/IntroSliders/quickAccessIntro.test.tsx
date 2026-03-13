import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('../../shared/constants', () => ({
  isIOS: () => false,
  isAndroid: () => true,
}));

import {StaticScanScreen} from './quickAccessIntro';

describe('StaticScanScreen', () => {
  it('should render quick access intro', () => {
    const {toJSON} = render(<StaticScanScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
