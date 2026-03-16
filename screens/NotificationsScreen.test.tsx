import React from 'react';
import {render} from '@testing-library/react-native';
import {NotificationsScreen} from './NotificationsScreen';

describe('NotificationsScreen', () => {
  it('should match snapshot', () => {
    const {toJSON} = render(<NotificationsScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
