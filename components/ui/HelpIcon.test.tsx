import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('./svg', () => ({
  SvgImage: {questionIcon: () => 'QuestionIcon'},
}));

import {HelpIcon} from './HelpIcon';

describe('HelpIcon', () => {
  it('should render without crashing', () => {
    const {toJSON} = render(<HelpIcon />);
    expect(toJSON()).toMatchSnapshot();
  });
});
