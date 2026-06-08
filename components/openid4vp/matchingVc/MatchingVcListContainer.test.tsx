import React from 'react';
import {render} from '@testing-library/react-native';
import {View} from 'react-native';
import {MatchingVcListContainer} from './MatchingVcListContainer';

jest.mock('../dcql/matchingVc/DcqlMatchingVcList', () => ({
  DcqlMatchingVcList: () => {
    return <View testID="dcql-matching-vc-list" />;
  },
}));

jest.mock('../presentationExchange/PresentationExchangeMatchingVcList', () => ({
  PresentationExchangeMatchingVcList: () => {
    return <View testID="pe-matching-vc-list" />;
  },
}));

describe('MatchingVcListContainer', () => {
  it('renders DcqlMatchingVcList when isDcqlFlow is true', () => {
    const controller = {isDcqlFlow: true};
    const {getByTestId, queryByTestId} = render(
      <MatchingVcListContainer
        controller={controller}
        setDisableShareButton={jest.fn()}
      />,
    );
    expect(getByTestId('dcql-matching-vc-list')).toBeTruthy();
    expect(queryByTestId('pe-matching-vc-list')).toBeNull();
  });

  it('renders PresentationExchangeMatchingVcList when isDcqlFlow is false', () => {
    const controller = {isDcqlFlow: false};
    const {getByTestId, queryByTestId} = render(
      <MatchingVcListContainer
        controller={controller}
        setDisableShareButton={jest.fn()}
      />,
    );
    expect(getByTestId('pe-matching-vc-list')).toBeTruthy();
    expect(queryByTestId('dcql-matching-vc-list')).toBeNull();
  });

  it('renders PresentationExchangeMatchingVcList when isDcqlFlow is undefined', () => {
    const controller = {};
    const {getByTestId} = render(
      <MatchingVcListContainer
        controller={controller}
        setDisableShareButton={jest.fn()}
      />,
    );
    expect(getByTestId('pe-matching-vc-list')).toBeTruthy();
  });
});
