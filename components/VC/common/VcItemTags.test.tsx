import React from 'react';
import {render} from '@testing-library/react-native';

jest.mock('react-native-elements', () => ({
  Chip: ({title}: any) => title,
}));
jest.mock('../../ui', () => ({
  Row: ({children}: any) => React.createElement('View', null, children),
  Text: ({children}: any) => React.createElement('Text', null, children),
}));
jest.mock('../../ui/styleUtils', () => ({
  Theme: {
    Colors: {Icon: '#000', whiteText: '#fff'},
  },
}));

import {VcItemTags} from './VcItemTags';

describe('VcItemTags', () => {
  it('should render tag when tag is non-empty', () => {
    const {toJSON, getByText} = render(
      React.createElement(VcItemTags, {tag: 'TestTag'}),
    );
    expect(toJSON()).not.toBeNull();
    expect(getByText('TestTag')).toBeTruthy();
  });

  it('should render nothing when tag is empty string', () => {
    const {toJSON} = render(React.createElement(VcItemTags, {tag: ''}));
    expect(toJSON()).toBeNull();
  });
});
