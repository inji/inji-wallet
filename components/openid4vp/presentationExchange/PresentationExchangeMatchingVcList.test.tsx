import React from 'react';
import {render} from '@testing-library/react-native';
import {Text, TouchableOpacity} from 'react-native';
import {
  PresentationExchangeMatchingVcList,
} from './PresentationExchangeMatchingVcList';
import {VCMetadata} from '../../../shared/VCMetadata';
import {MatchingVCsResultForPresentationExchangeRequest} from '../../../shared/openID4VP/openid4vp.types';
import {MatchingVcListRef} from "../matchingVc/MatchingVcListContainer";

jest.mock('../../VC/VcItemContainer', () => ({
  VcItemContainer: ({testId, selected, onPress}: {testId: string; selected: boolean; onPress: () => void}) => {
    return (
      <TouchableOpacity testID={`vc-${testId}`} onPress={onPress}>
        <Text>{selected ? 'selected' : 'unselected'}</Text>
      </TouchableOpacity>
    );
  },
}));

const buildVcMetadata = (id: string) =>
  new VCMetadata({id, timestamp: '', issuer: 'issuer'});

const buildVc = (id: string) => ({
  vcMetadata: buildVcMetadata(id),
  verifiableCredential: {},
  lastVerifiedOn: 0,
});

const buildMatchingVcsResult = (
  overrides: Partial<MatchingVCsResultForPresentationExchangeRequest> = {},
) : MatchingVCsResultForPresentationExchangeRequest => ({
  success: true,
  purpose: '',
  requestedClaims: new Set<string>(),
  matchingVCs: {'desc-1': [buildVc('vc-1'), buildVc('vc-2')]},
  ...overrides,
}) as MatchingVCsResultForPresentationExchangeRequest;

const renderList = (
  matchingVcsResult = buildMatchingVcsResult(),
) =>
  render(<PresentationExchangeMatchingVcList matchingVcsResult={matchingVcsResult} setDisableShareButton={jest.fn()}/>);

describe('PresentationExchangeMatchingVcList', () => {
  it('renders the matching VC list header row', () => {
    const {getByLabelText} = renderList();
    expect(getByLabelText('matching-vc-list-header-row')).toBeTruthy();
  });

  it('shows card count text', () => {
    const {getByText} = renderList();
    // 0 selected → "0 cardsSelected"
    expect(getByText('0 cardsSelected')).toBeTruthy();
  });

  it('shows "checkAll" button when not all VCs are checked', () => {
    const {getByText} = renderList();
    expect(getByText('checkAll')).toBeTruthy();
  });

  it('renders a VcItemContainer per VC', () => {
    const {getByTestId} = renderList();
    const vc1Key = buildVcMetadata('vc-1').getVcKey();
    expect(getByTestId(`vc-matching-vc-list-vc-${vc1Key}-desc-1`)).toBeTruthy();
  });

  it('exposes selectedDisclosures through the imperative handle', () => {
    const ref = React.createRef<MatchingVcListRef>();
    render(
      <PresentationExchangeMatchingVcList
        ref={ref}
        matchingVcsResult={buildMatchingVcsResult()}
        setDisableShareButton={jest.fn()}
      />,
    );

    expect(ref.current?.selectedDisclosures()).toEqual({});
  });
});
