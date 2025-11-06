import React from 'react';
import {render} from '@testing-library/react-native';
import {VcItemContainerProfileImage} from './VcItemContainerProfileImage';
import {View} from 'react-native';

// Mock SvgImage
jest.mock('./ui/svg', () => ({
  SvgImage: {
    pinIcon: jest.fn(() => <View testID="mockPinIcon" />),
  },
}));

// Mock ProfileIcon
jest.mock('./ProfileIcon', () => ({
  ProfileIcon: jest.fn(() => <View testID="mockProfileIcon" />),
}));

describe('VcItemContainerProfileImage Component', () => {
  const vcDataWithImage = {
    face: 'https://example.com/avatar.jpg',
  };

  const vcDataWithoutImage = {
    face: null,
  };

  it('should match snapshot with face image', () => {
    const {toJSON} = render(
      <VcItemContainerProfileImage
        verifiableCredentialData={vcDataWithImage}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with face image and pinned', () => {
    const {toJSON} = render(
      <VcItemContainerProfileImage
        verifiableCredentialData={vcDataWithImage}
        isPinned={true}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot without face image', () => {
    const {toJSON} = render(
      <VcItemContainerProfileImage
        verifiableCredentialData={vcDataWithoutImage}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot without face image and pinned', () => {
    const {toJSON} = render(
      <VcItemContainerProfileImage
        verifiableCredentialData={vcDataWithoutImage}
        isPinned={true}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with empty string face', () => {
    const {toJSON} = render(
      <VcItemContainerProfileImage verifiableCredentialData={{face: ''}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
