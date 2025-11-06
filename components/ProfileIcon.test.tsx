import React from 'react';
import {render} from '@testing-library/react-native';
import {ProfileIcon} from './ProfileIcon';
import {View} from 'react-native';

// Mock SvgImage
jest.mock('./ui/svg', () => ({
  SvgImage: {
    pinIcon: jest.fn(() => <View testID="mockPinIcon" />),
  },
}));

describe('ProfileIcon Component', () => {
  const defaultProps = {
    profileIconContainerStyles: {},
    profileIconSize: 40,
  };

  it('should match snapshot without pinned icon', () => {
    const {toJSON} = render(<ProfileIcon {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with pinned icon', () => {
    const {toJSON} = render(<ProfileIcon {...defaultProps} isPinned={true} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom icon size', () => {
    const {toJSON} = render(
      <ProfileIcon {...defaultProps} profileIconSize={60} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom container styles', () => {
    const customStyles = {
      backgroundColor: 'blue',
      borderRadius: 10,
      padding: 5,
    };
    const {toJSON} = render(
      <ProfileIcon
        {...defaultProps}
        profileIconContainerStyles={customStyles}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
