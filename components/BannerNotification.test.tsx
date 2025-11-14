import React from 'react';
import {render} from '@testing-library/react-native';
import {BannerNotification, BannerStatusType} from './BannerNotification';

// Mock the SVG components
jest.mock('../assets/Error_Toast_Icon.svg', () => 'ErrorToastIcon');
jest.mock('../assets/Info_Toast_Icon.svg', () => 'InfoToastIcon');
jest.mock('../assets/Success_Toast_Icon.svg', () => 'SuccessToastIcon');

describe('BannerNotification Component', () => {
  const defaultProps = {
    message: 'Test notification message',
    onClosePress: jest.fn(),
    testId: 'bannerTest',
    type: BannerStatusType.SUCCESS,
  };

  it('should match snapshot with success status', () => {
    const {toJSON} = render(<BannerNotification {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with error status', () => {
    const {toJSON} = render(
      <BannerNotification {...defaultProps} type={BannerStatusType.ERROR} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with in progress status', () => {
    const {toJSON} = render(
      <BannerNotification
        {...defaultProps}
        type={BannerStatusType.IN_PROGRESS}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with long message', () => {
    const {toJSON} = render(
      <BannerNotification
        {...defaultProps}
        message="This is a very long notification message that should wrap to multiple lines and still be displayed correctly"
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with different testId', () => {
    const {toJSON} = render(
      <BannerNotification {...defaultProps} testId="customBanner" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
