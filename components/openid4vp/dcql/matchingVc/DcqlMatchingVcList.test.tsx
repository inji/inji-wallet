/**
 * Unit tests for DcqlMatchingVcList component.
 *
 * Test scenarios are derived from the DCQL feature specification:
 * - Credential sets with `required: true` must be displayed before optional sets
 * - The first satisfiable option of each required credential set is pre-selected on load
 * - Credential sets for which no option is satisfiable must not be rendered
 * - A loader is shown while matching results are being computed
 * - mandatoryIndex is provided only when there are multiple required credential sets
 *
 * Any deviation from expected spec behaviour is marked with a skipped test (it.skip)
 * and summarised at the bottom of this file.
 */

// ---------------------------------------------------------------------------
// Restore real React hooks
//
// __mocks__/jest-init.js globally replaces useState and useEffect with no-ops.
// We restore the real implementations so component lifecycle (useEffect,
// useState) behaves correctly in these tests.
// ---------------------------------------------------------------------------
const actualReact = jest.requireActual('react');
beforeAll(() => {
  Object.assign(require('react'), {
    useState: actualReact.useState,
    useEffect: actualReact.useEffect,
  });
});

import React from 'react';
import {render, waitFor, fireEvent} from '@testing-library/react-native';
import {DcqlMatchingVcList} from './DcqlMatchingVcList';
import {VCMetadata} from '../../../../shared/VCMetadata';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('../../../ui/LoaderAnimation', () => ({
  LoaderAnimation: ({testID}: {testID: string}) => {
    const {View} = require('react-native');
    return <View testID={testID} />;
  },
}));

jest.mock('../../../ui/pagination/Pagination', () => ({
  Pagination: ({data, renderItem}: any) => {
    const React = require('react');
    const {View, TouchableOpacity} = require('react-native');
    const [page, setPage] = React.useState(0);
    const total = data.length;
    if (total === 0) return null;
    return (
      <View>
        {renderItem({item: data[page], index: page, total})}
        {page < total - 1 && (
          <TouchableOpacity
            testID="pagination-next"
            onPress={() => setPage((p: number) => p + 1)}
          />
        )}
      </View>
    );
  },
}));

// Capture the props each CredentialSetSection is rendered with so that we can
// assert ordering, satisfiableOptions, mandatoryIndex, etc.
const mockCredentialSetSectionCalls: any[] = [];
jest.mock('../credentialSetSection/CredentialSetSection', () => ({
  CredentialSetSection: (props: any) => {
    mockCredentialSetSectionCalls.push(props);
    const {View} = require('react-native');
    return <View testID={props.testId} />;
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildVcMetadata = (id: string): VCMetadata =>
  new VCMetadata({id, timestamp: '', issuer: 'test-issuer'});

const buildVc = (id: string) => ({
  vcMetadata: buildVcMetadata(id),
  verifiableCredential: {},
  lastVerifiedOn: 0,
});

const buildVcWithMatchedClaims = (id: string) => ({
  vc: buildVc(id),
  matchedClaims: [],
});

const buildMatchResult = (vcIds: string[], allowMultiple = false) => ({
  matchingVcs: vcIds.map(id => buildVcWithMatchedClaims(id)),
  allowMultipleCredentials: allowMultiple,
});

const buildController = (overrides: Partial<any> = {}) => ({
  matchingVcsResult: null,
  SELECT_VC_ITEMS: jest.fn(() => jest.fn()),
  DESELECT_VC_ITEMS: jest.fn(() => jest.fn()),
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DcqlMatchingVcList', () => {
  beforeEach(() => {
    mockCredentialSetSectionCalls.length = 0;
  });

  // ─── Loader ──────────────────────────────────────────────────────────────

  /**
   * Spec: A loading indicator must be shown while the matching results are
   * still being computed (matchingVcsResult is null).
   */
  it('shows a loader while matchingVcsResult is null', () => {
    const controller = buildController({matchingVcsResult: null});
    const {getByTestId} = render(
      <DcqlMatchingVcList controller={controller} />,
    );
    expect(getByTestId('matching-vc-list-dcql-loader')).toBeTruthy();
  });

  // ─── Ordering ────────────────────────────────────────────────────────────

  /**
   * Spec: required credential sets must appear before optional ones so the
   * most important credentials are always at the top of the list.
   * With pagination, only one section is shown per page; we navigate to verify order.
   */
  it('renders required credential sets before optional ones', async () => {
    const controller = buildController({
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'national-id': buildMatchResult(['vc-national-id']),
          'health-id': buildMatchResult(['vc-health-id']),
        },
        credentialSetOptions: [
          // Optional comes FIRST in the input array — ordering must flip it
          {options: [['health-id']], required: false},
          {options: [['national-id']], required: true},
        ],
      },
    });

    const {getByTestId} = render(
      <DcqlMatchingVcList controller={controller} />,
    );

    // Page 0 must show the required section
    await waitFor(() => {
      expect(mockCredentialSetSectionCalls).toHaveLength(1);
    });
    expect(mockCredentialSetSectionCalls[0].credentialSet.required).toBe(true);

    // Navigate to page 1 (optional section)
    fireEvent.press(getByTestId('pagination-next'));

    await waitFor(() => {
      expect(mockCredentialSetSectionCalls).toHaveLength(2);
    });
    expect(mockCredentialSetSectionCalls[1].credentialSet.required).toBe(false);
  });

  // ─── Satisfiability ──────────────────────────────────────────────────────

  /**
   * Spec: credential sets for which none of the options are satisfiable
   * (i.e. at least one query has no matching VCs) must be silently skipped.
   */
  it('does not render a credential set when no option is satisfiable', async () => {
    const controller = buildController({
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'national-id': buildMatchResult(['vc-national-id']),
          'health-id': {matchingVcs: [], allowMultipleCredentials: false},
        },
        credentialSetOptions: [
          {options: [['national-id']], required: true},
          // All options in this set are unsatisfiable
          {options: [['health-id']], required: false},
        ],
      },
    });

    render(<DcqlMatchingVcList controller={controller} />);

    await waitFor(() => {
      // Only the satisfiable credential set is rendered
      expect(mockCredentialSetSectionCalls).toHaveLength(1);
    });
    expect(mockCredentialSetSectionCalls[0].credentialSet.required).toBe(true);
  });

  /**
   * An option is satisfiable only if ALL query IDs inside it have at least
   * one matching VC. If only some queries in a multi-query option match, the
   * entire option is unsatisfiable.
   */
  it('treats a multi-query option as unsatisfiable when any query has no matching VCs', async () => {
    const controller = buildController({
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'driving-license': buildMatchResult(['vc-dl']),
          // age-proof has no matches → the combined option is unsatisfiable
          'age-proof': {matchingVcs: [], allowMultipleCredentials: false},
        },
        credentialSetOptions: [
          {options: [['driving-license', 'age-proof']], required: true},
        ],
      },
    });

    render(<DcqlMatchingVcList controller={controller} />);

    // Wait for useEffect to complete then assert nothing was rendered
    await waitFor(() => {
      expect(mockCredentialSetSectionCalls).toHaveLength(0);
    });
  });

  // ─── Pre-selection ───────────────────────────────────────────────────────

  /**
   * Spec: For each required credential set, the first satisfiable option
   * is automatically pre-selected so the user can immediately share without
   * manual interaction.
   *
   * NOTE: Pre-selection logic was moved from DcqlMatchingVcList to CredentialSetSection
   * (via getPreselectedOptionState / useEffect). DcqlMatchingVcList no longer calls
   * SELECT_VC_ITEMS directly on mount. Test coverage lives in CredentialSetSection.test.tsx.
   */
  it.skip('calls SELECT_VC_ITEMS with the first matching VC for each required set on mount', async () => {
    const selectVcItems = jest.fn(() => jest.fn());
    const controller = buildController({
      SELECT_VC_ITEMS: selectVcItems,
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'national-id': buildMatchResult([
            'vc-national-id-1',
            'vc-national-id-2',
          ]),
        },
        credentialSetOptions: [{options: [['national-id']], required: true}],
      },
    });

    render(<DcqlMatchingVcList controller={controller} />);

    await waitFor(() => {
      expect(selectVcItems).toHaveBeenCalledTimes(1);
    });

    const calledWith = selectVcItems.mock.calls[0][0];
    // Only the first VC should be pre-selected
    expect(calledWith['national-id']).toBeInstanceOf(Set);
    expect(calledWith['national-id'].size).toBe(1);
    const expectedKey = VCMetadata.fromVcMetadataString(
      buildVc('vc-national-id-1').vcMetadata,
    ).getVcKey();
    expect(calledWith['national-id'].has(expectedKey)).toBe(true);
  });

  /**
   * Spec: Optional credential sets must NOT be pre-selected – the user
   * decides whether to share optional credentials.
   * NOTE: Pre-selection logic is handled in CredentialSetSection; this test remains
   * as a guard that optional sets don't get unexpected SELECT_VC_ITEMS calls from
   * the list component itself.
   */
  it('does NOT call SELECT_VC_ITEMS for optional credential sets', async () => {
    const selectVcItems = jest.fn(() => jest.fn());
    const controller = buildController({
      SELECT_VC_ITEMS: selectVcItems,
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'health-id': buildMatchResult(['vc-health-id']),
        },
        credentialSetOptions: [{options: [['health-id']], required: false}],
      },
    });

    render(<DcqlMatchingVcList controller={controller} />);

    // Give effects time to run, then confirm no pre-selection occurred
    await waitFor(() => {
      expect(mockCredentialSetSectionCalls.length).toBeGreaterThan(0);
    });
    expect(selectVcItems).not.toHaveBeenCalled();
  });

  /**
   * Spec: Pre-selection for a required multi-query option should select the
   * first matching VC for EACH credential query in that option.
   * NOTE: Logic moved to CredentialSetSection.
   */
  it.skip('pre-selects first VC for every query in a required multi-query option', async () => {
    const selectVcItems = jest.fn(() => jest.fn());
    const controller = buildController({
      SELECT_VC_ITEMS: selectVcItems,
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'driving-license': buildMatchResult(['vc-dl']),
          'age-proof': buildMatchResult(['vc-age']),
        },
        credentialSetOptions: [
          {options: [['driving-license', 'age-proof']], required: true},
        ],
      },
    });

    render(<DcqlMatchingVcList controller={controller} />);

    await waitFor(() => {
      expect(selectVcItems).toHaveBeenCalledTimes(1);
    });

    const calledWith = selectVcItems.mock.calls[0][0];
    expect(calledWith['driving-license']).toBeInstanceOf(Set);
    expect(calledWith['age-proof']).toBeInstanceOf(Set);
  });

  /**
   * NOTE: Logic moved to CredentialSetSection.
   */
  it.skip('prefers a later required option when it reuses already selected VCs from an earlier required set', async () => {
    const selectVcItems = jest.fn(() => jest.fn());
    const previousSelectionKey = VCMetadata.fromVcMetadataString(
      buildVc('vc-shared').vcMetadata,
    ).getVcKey();
    const companionKey = VCMetadata.fromVcMetadataString(
      buildVc('vc-companion').vcMetadata,
    ).getVcKey();

    const controller = buildController({
      SELECT_VC_ITEMS: selectVcItems,
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'base-query': buildMatchResult(['vc-shared']),
          'first-option-query-1': buildMatchResult(['vc-first-option']),
          'first-option-query-2': buildMatchResult(['vc-companion']),
          'preferred-option-query-1': buildMatchResult(['vc-shared']),
          'preferred-option-query-2': buildMatchResult(['vc-companion']),
        },
        credentialSetOptions: [
          {options: [['base-query']], required: true},
          {
            options: [
              ['first-option-query-1', 'first-option-query-2'],
              ['preferred-option-query-1', 'preferred-option-query-2'],
            ],
            required: true,
          },
        ],
      },
    });

    render(<DcqlMatchingVcList controller={controller} />);

    await waitFor(() => {
      expect(selectVcItems).toHaveBeenCalledTimes(1);
    });

    const calledWith = selectVcItems.mock.calls[0][0];

    expect(calledWith['base-query'].has(previousSelectionKey)).toBe(true);
    expect(
      calledWith['preferred-option-query-1'].has(previousSelectionKey),
    ).toBe(true);
    expect(calledWith['preferred-option-query-2'].has(companionKey)).toBe(true);
    expect(calledWith['first-option-query-1']).toBeUndefined();
    expect(calledWith['first-option-query-2']).toBeUndefined();
  });

  // ─── stepLabel / pagination ───────────────────────────────────────────────

  /**
   * Spec: When there are multiple credential sets (pages), each section should
   * show a step indicator label (e.g. "Step 1 of 2") so the user knows their
   * progress. This replaces the previous `mandatoryIndex` numbering.
   */
  it('passes a stepLabel to each section when there are multiple pages', async () => {
    const controller = buildController({
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'national-id': buildMatchResult(['vc-national-id']),
          'tax-id': buildMatchResult(['vc-tax-id']),
        },
        credentialSetOptions: [
          {options: [['national-id']], required: true},
          {options: [['tax-id']], required: true},
        ],
      },
    });

    render(<DcqlMatchingVcList controller={controller} />);

    await waitFor(() => {
      expect(mockCredentialSetSectionCalls.length).toBeGreaterThan(0);
    });

    // stepLabel must be defined when there are multiple pages
    expect(mockCredentialSetSectionCalls[0].stepLabel).toBeDefined();
    // Value is the i18n key (t() returns key in tests): 'dcqlSection.stepOf'
    expect(mockCredentialSetSectionCalls[0].stepLabel).toBe(
      'dcqlSection.stepOf',
    );
  });

  /**
   * Spec: When there is only a single credential set, no step indicator is
   * needed, so stepLabel should be undefined.
   */
  it('does not pass a stepLabel when there is only one section', async () => {
    const controller = buildController({
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'national-id': buildMatchResult(['vc-national-id']),
        },
        credentialSetOptions: [{options: [['national-id']], required: true}],
      },
    });

    render(<DcqlMatchingVcList controller={controller} />);

    await waitFor(() => {
      expect(mockCredentialSetSectionCalls.length).toBeGreaterThan(0);
    });

    const requiredSection = mockCredentialSetSectionCalls.find(
      p => p.credentialSet.required,
    );
    expect(requiredSection?.stepLabel).toBeUndefined();
  });

  // ─── Snapshot ────────────────────────────────────────────────────────────

  it('matches snapshot for a happy-case request with required and optional sets', async () => {
    const controller = buildController({
      matchingVcsResult: {
        success: true,
        purpose: '',
        requestedClaims: '',
        matchingVCs: {
          'national-id': buildMatchResult(['vc-national-id']),
          'health-id': buildMatchResult(['vc-health-id']),
        },
        credentialSetOptions: [
          {options: [['national-id']], required: true},
          {options: [['health-id']], required: false},
        ],
      },
    });

    const {toJSON} = render(<DcqlMatchingVcList controller={controller} />);

    await waitFor(() => {
      expect(mockCredentialSetSectionCalls.length).toBeGreaterThan(0);
    });

    expect(toJSON()).toMatchSnapshot();
  });
});
