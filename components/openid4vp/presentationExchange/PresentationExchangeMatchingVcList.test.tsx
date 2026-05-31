import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {PresentationExchangeMatchingVcList} from './PresentationExchangeMatchingVcList';
import {VCMetadata} from '../../../shared/VCMetadata';

jest.mock('../../VC/VcItemContainer', () => ({
  VcItemContainer: ({testId, selected, onPress}: any) => {
    const {TouchableOpacity, Text} = require('react-native');
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

const buildController = (overrides: Partial<any> = {}) => ({
  areAllVCsChecked: false,
  credentialRequestIdToSelectedVcKeys: {},
  matchingVcsResult: {
    matchingVCs: {'desc-1': [buildVc('vc-1'), buildVc('vc-2')]},
  },
  SELECT_VC_ITEM: jest.fn(() => jest.fn()),
  CHECK_ALL: jest.fn(),
  UNCHECK_ALL: jest.fn(),
  ...overrides,
});

describe('PresentationExchangeMatchingVcList', () => {
  it('renders the matching VC list header row', () => {
    const {getByLabelText} = render(
      <PresentationExchangeMatchingVcList
        controller={buildController()}
        onDisclosureChange={jest.fn()}
      />,
    );
    expect(getByLabelText('matching-vc-list-header-row')).toBeTruthy();
  });

  it('shows card count text', () => {
    const {getByText} = render(
      <PresentationExchangeMatchingVcList
        controller={buildController()}
        onDisclosureChange={jest.fn()}
      />,
    );
    // 0 selected → "0 cardsSelected"
    expect(getByText('0 cardsSelected')).toBeTruthy();
  });

  it('shows singular "cardSelected" when exactly 1 VC is selected', () => {
    const vcKey = buildVcMetadata('vc-1').getVcKey();
    const controller = buildController({
      credentialRequestIdToSelectedVcKeys: {
        'desc-1': new Set([vcKey]),
      },
    });

    const {getByText} = render(
      <PresentationExchangeMatchingVcList
        controller={controller}
        onDisclosureChange={jest.fn()}
      />,
    );
    expect(getByText('1 cardSelected')).toBeTruthy();
  });

  it('shows "checkAll" button when not all VCs are checked', () => {
    const {getByText} = render(
      <PresentationExchangeMatchingVcList
        controller={buildController()}
        onDisclosureChange={jest.fn()}
      />,
    );
    expect(getByText('checkAll')).toBeTruthy();
  });

  it('calls CHECK_ALL when "checkAll" is pressed', () => {
    const controller = buildController();
    const {getByText} = render(
      <PresentationExchangeMatchingVcList
        controller={controller}
        onDisclosureChange={jest.fn()}
      />,
    );
    fireEvent.press(getByText('checkAll'));
    expect(controller.CHECK_ALL).toHaveBeenCalledTimes(1);
  });

  it('shows "unCheck" and calls UNCHECK_ALL when all VCs are selected', () => {
    const vc1Key = buildVcMetadata('vc-1').getVcKey();
    const vc2Key = buildVcMetadata('vc-2').getVcKey();
    const controller = buildController({
      credentialRequestIdToSelectedVcKeys: {
        'desc-1': new Set([vc1Key, vc2Key]),
      },
    });

    const {getByText} = render(
      <PresentationExchangeMatchingVcList
        controller={controller}
        onDisclosureChange={jest.fn()}
      />,
    );
    expect(getByText('unCheck')).toBeTruthy();
    fireEvent.press(getByText('unCheck'));
    expect(controller.UNCHECK_ALL).toHaveBeenCalledTimes(1);
  });

  it('renders a VcItemContainer per VC', () => {
    const controller = buildController();
    const {getByTestId} = render(
      <PresentationExchangeMatchingVcList
        controller={controller}
        onDisclosureChange={jest.fn()}
      />,
    );
    const vc1Key = buildVcMetadata('vc-1').getVcKey();
    expect(getByTestId(`vc-matching-vc-list-vc-${vc1Key}-desc-1`)).toBeTruthy();
  });

  it('marks all VCs as selected when areAllVCsChecked is true', () => {
    const controller = buildController({areAllVCsChecked: true});
    const {getAllByText} = render(
      <PresentationExchangeMatchingVcList
        controller={controller}
        onDisclosureChange={jest.fn()}
      />,
    );
    // Both VcItemContainers show "selected"
    const selectedTexts = getAllByText('selected');
    expect(selectedTexts).toHaveLength(2);
  });

  it('matches snapshot (happy path – 2 VCs, none selected)', () => {
    const {toJSON} = render(
      <PresentationExchangeMatchingVcList
        controller={buildController()}
        onDisclosureChange={jest.fn()}
      />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
