/**
 * Unit tests for CredentialSetSection component.
 *
 * Test scenarios are derived from the DCQL feature specification:
 * - Required sets show a "REQUIRED" badge; optional sets show "NOT REQUIRED"
 * - A section satisfied indicator (✓) appears when at least one option is selected
 * - The "single-match edge case": when a required set has exactly 1 satisfiable
 *   option with 1 query that matches exactly 1 VC, that card is auto-selected
 *   and selection is disabled (non-interactive)
 * - Multiple satisfiable options are separated by an "OR" divider
 * - A multi-query option (combination of credential queries) renders a grouped
 * - Selecting an option auto-fills the first matching VC for each query
 * - Deselecting an already-selected option removes it from the selection
 * - handleVCSelection in single mode replaces; in allowMultiple mode appends
 * - Selecting a new option deselects all other previously selected options
 *
 */
import {VCInfo} from "../../../../shared/openID4VP/openid4vp.types";

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
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {CredentialSetSection} from './CredentialSetSection';
import {VCMetadata} from '../../../../shared/VCMetadata';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('../../../VC/VcItemContainer', () => ({
  VcItemContainer: ({testId, onPress, selected, disableSelection}: any) => {
    const {TouchableOpacity, Text} = require('react-native');
    return (
      <TouchableOpacity
        testID={`vc-item-${testId}`}
        onPress={onPress}
        disabled={disableSelection}
        accessibilityState={{selected, disabled: disableSelection}}>
        <Text>{selected ? 'selected' : 'unselected'}</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('../../../../shared/openID4VP/OpenID4VPHelper', () => ({
  claimPathPointersToJsonPath: jest.fn(() => []),
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
  matchingVcInfo: new VCInfo("VC_"+id, buildVcMetadata(id)),
  matchedClaims: [],
});

const vcKey = (id: string) =>
  VCMetadata.fromVcMetadataString(buildVc(id).vcMetadata).getVcKey();

const buildMatchResult = (vcIds: string[], allowMultiple = false) => ({
  matchingVcs: vcIds.map(buildVcWithMatchedClaims),
  allowMultipleCredentials: allowMultiple,
});

// Default props builder for a simple required set with one option & one query
const buildDefaultProps = (overrides: Partial<any> = {}) => ({
  credentialSet: {options: [['national-id']], required: true},
  matchingVCsResult: {
    'national-id': buildMatchResult(['vc-national-1']),
  },
  satisfiableOptions: [['national-id']],
  selectVcs: jest.fn(),
  deselectVcs: jest.fn(),
  onSelectionChange: jest.fn(),
  selectedVcKeys: new Set<string>(),
  testId: 'test-section',
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CredentialSetSection', () => {
  // ─── Badge rendering ────────────────────────────────────────────────────

  it('shows a REQUIRED badge for a required credential set', () => {
    const props = buildDefaultProps({
      credentialSet: {options: [['national-id']], required: true},
    });
    const {getByLabelText} = render(<CredentialSetSection {...props} />);
    // Badge testId pattern: `badge-${testId}-required-badge` via testIDProps on Android
    expect(getByLabelText('badge-test-section-required-badge')).toBeTruthy();
  });

  it('shows a NOT REQUIRED badge for an optional credential set', () => {
    const props = buildDefaultProps({
      credentialSet: {options: [['health-id']], required: false},
      matchingVCsResult: {'health-id': buildMatchResult(['vc-health-1'])},
      satisfiableOptions: [['health-id']],
    });
    const {getByLabelText} = render(<CredentialSetSection {...props} />);
    expect(getByLabelText('badge-test-section-required-badge')).toBeTruthy();
  });

  // ─── Section accordion renders ───────────────────────────────────────────

  it('renders the outer section container with the section testId', () => {
    const props = buildDefaultProps();
    const {getByLabelText} = render(<CredentialSetSection {...props} />);
    // The outer container is a plain View with testIDProps(testId) → accessibilityLabel="test-section"
    expect(getByLabelText('test-section')).toBeTruthy();
  });

  // ─── Single-match edge case ─────────────────────────────────────────────

  /**
   * Spec: When a required set has exactly 1 satisfiable option containing
   * exactly 1 credential query that matches exactly 1 VC, the card is
   * automatically pre-selected and rendered as non-interactive (disabled).
   * The user cannot change this selection.
   */
  it('disables card selection in the single-match edge case', () => {
    const props = buildDefaultProps({
      credentialSet: {options: [['national-id']], required: true},
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1']), // exactly 1 VC
      },
      satisfiableOptions: [['national-id']], // exactly 1 option with 1 query
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    const vcItem = getByTestId(
      `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
        'vc-national-1',
      )}`,
    );
    // accessibilityState.disabled is set by the mock to reflect disableSelection prop
    expect(vcItem.props.accessibilityState?.disabled).toBe(true);
  });

  /**
   * Spec: When the single-match edge case does NOT apply (e.g. multiple
   * matching VCs), the card must remain interactive so the user can change
   * the selection.
   */
  it('keeps card selection enabled when there are multiple matching VCs', () => {
    const props = buildDefaultProps({
      credentialSet: {options: [['national-id']], required: true},
      matchingVCsResult: {
        // Two matching VCs → not a single-match edge case → inner Accordion shown
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Both cards are inside the inner multi-vc accordion (defaultExpanded by spec)
    const vc1 = getByTestId(
      `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
        'vc-national-1',
      )}`,
    );
    expect(vc1.props.accessibilityState?.disabled).toBeFalsy();
  });

  /**
   * Spec: Optional credential sets never trigger the single-match edge case,
   * so their cards must always remain interactive.
   */
  it('keeps card selection enabled for an optional set with a single matching VC', async () => {
    const props = buildDefaultProps({
      credentialSet: {options: [['health-id']], required: false},
      matchingVCsResult: {'health-id': buildMatchResult(['vc-health-1'])},
      satisfiableOptions: [['health-id']],
    });

    const {findByTestId} = render(<CredentialSetSection {...props} />);

    // No outer accordion toggle — content renders directly
    const vcItem = await findByTestId(
      `vc-item-test-section-option-0-query-health-id-vc-${vcKey(
        'vc-health-1',
      )}`,
    );
    expect(vcItem.props.accessibilityState?.disabled).toBeFalsy();
  });

  // ─── OR divider between options ─────────────────────────────────────────

  /**
   * Spec: When a credential set has multiple satisfiable options, they must
   * be visually separated by an "OR" divider so the user understands they
   * only need to satisfy ONE of them.
   */
  it('renders an OR divider between multiple satisfiable options', () => {
    const props = buildDefaultProps({
      credentialSet: {options: [['national-id'], ['tax-id']], required: true},
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1']),
        'tax-id': buildMatchResult(['vc-tax-1']),
      },
      satisfiableOptions: [['national-id'], ['tax-id']],
    });

    const {getByText} = render(<CredentialSetSection {...props} />);

    // Divider renders an "OR" text label
    expect(getByText('OR')).toBeTruthy();
  });

  it('does NOT render a divider when there is only one option', () => {
    const props = buildDefaultProps();
    const {queryByText} = render(<CredentialSetSection {...props} />);
    expect(queryByText('OR')).toBeNull();
  });

  // ─── Multi-query option (combined section) ───────────────────────────────

  /**
   * Spec: When one option contains multiple credential queries (i.e. the user
   * must present multiple credentials together to satisfy the option), they
   * must be grouped inside a section labelled "Multiple Cards" with
   * - a single checkbox to select/deselect all.
   */
  it('renders a combined section for a multi-query option', () => {
    const props = buildDefaultProps({
      credentialSet: {
        options: [['driving-license', 'age-proof']],
        required: true,
      },
      matchingVCsResult: {
        'driving-license': buildMatchResult(['vc-dl']),
        'age-proof': buildMatchResult(['vc-age']),
      },
      satisfiableOptions: [['driving-license', 'age-proof']],
    });

    const {getByLabelText} = render(<CredentialSetSection {...props} />);

    expect(getByLabelText('test-section-option-0-combined')).toBeTruthy();
  });

  it('renders a "select all" checkbox for a multi-query option', () => {
    const props = buildDefaultProps({
      credentialSet: {
        options: [['driving-license', 'age-proof']],
        required: true,
      },
      matchingVCsResult: {
        'driving-license': buildMatchResult(['vc-dl']),
        'age-proof': buildMatchResult(['vc-age']),
      },
      satisfiableOptions: [['driving-license', 'age-proof']],
    });

    const {getByLabelText} = render(<CredentialSetSection {...props} />);

    // Checkbox testId: `checkbox-single-${testId}-option-0-select-all`
    expect(
      getByLabelText('checkbox-single-test-section-option-0-select-all'),
    ).toBeTruthy();
  });

  // ─── Multi-VC expandable list (multiple VCs per single query) ────────────

  /**
   * Spec: When multiple VCs match a single credential query, they must be
   * wrapped in an expandable list so the user can tap "Show all cards" and
   * pick one (or more).
   */
  it('renders an inner expandable list when multiple VCs match a single credential query', () => {
    const props = buildDefaultProps({
      credentialSet: {options: [['national-id']], required: true},
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    expect(
      getByTestId('test-section-option-0-query-national-id-multi-vc-show-more-button'),
    ).toBeTruthy();
  });

  // ─── handleVCSelection – selecting a VC ─────────────────────────────────

  /**
   * Spec: Pressing a VC calls selectVcs with that VC's key.
   */
  it('calls selectVcs when a VC is selected', async () => {
    const selectVcs = jest.fn();
    const props = buildDefaultProps({
      selectVcs,
      credentialSet: {options: [['national-id']], required: true},
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for auto-preselection (required set selects vc-national-1) then reset
    // the spy so only the user-initiated call is counted below.
    await waitFor(() => expect(selectVcs).toHaveBeenCalled());
    selectVcs.mockClear();

    fireEvent.press(
      getByTestId(
        'test-section-option-0-query-national-id-multi-vc-show-more-button',
      ),
    );

    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
          'vc-national-2',
        )}`,
      ),
    );

    await waitFor(() => {
      expect(selectVcs).toHaveBeenCalledTimes(1);
    });

    const calledWith = selectVcs.mock.calls[0][0];
    expect(calledWith['national-id']).toBeInstanceOf(Set);
    expect(calledWith['national-id'].has(vcKey('vc-national-2'))).toBe(true);
  });

  /**
   * Spec: In single-credential mode, when a second VC is selected for the
   * same query, the first VC should be replaced (not added alongside it).
   * The required set auto-preselects the first VC, so pressing the second replaces it.
   */
  it('replaces the previously selected VC in single-credential mode', async () => {
    const selectVcs = jest.fn();
    const props = buildDefaultProps({
      selectVcs,
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for auto-preselection of vc-national-1 (required set → first VC)
    await waitFor(() =>
      expect(
        getByTestId(
          `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
            'vc-national-1',
          )}`,
        ).props.accessibilityState?.selected,
      ).toBe(true),
    );
    // Clear spy so only the user-initiated call is counted below.
    selectVcs.mockClear();

    fireEvent.press(
      getByTestId(
        'test-section-option-0-query-national-id-multi-vc-show-more-button',
      ),
    );

    // Select vc-national-2 (different from the pre-selected one)
    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
          'vc-national-2',
        )}`,
      ),
    );

    await waitFor(() => {
      expect(selectVcs).toHaveBeenCalledTimes(1);
    });

    const calledWith = selectVcs.mock.calls[0][0];
    expect(calledWith['national-id'].has(vcKey('vc-national-2'))).toBe(true);
    // vc-national-1 is no longer in the SELECT call (single-credential mode replaces)
    expect(calledWith['national-id'].has(vcKey('vc-national-1'))).toBe(false);
  });

  it('moves the newly selected VC to the first visible card after closing the expanded list', async () => {
    const props = buildDefaultProps({
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
    });

    const {getByTestId, queryByTestId} = render(<CredentialSetSection {...props} />);

    await waitFor(() =>
      expect(
        getByTestId(
          `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
            'vc-national-1',
          )}`,
        ).props.accessibilityState?.selected,
      ).toBe(true),
    );

    fireEvent.press(
      getByTestId(
        'test-section-option-0-query-national-id-multi-vc-show-more-button',
      ),
    );

    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
          'vc-national-2',
        )}`,
      ),
    );

    fireEvent.press(
      getByTestId(
        'test-section-option-0-query-national-id-multi-vc-modal-close-button',
      ),
    );

    await waitFor(() => {
      expect(
        getByTestId(
          `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
            'vc-national-2',
          )}`,
        ).props.accessibilityState?.selected,
      ).toBe(true);
    });

    expect(
      queryByTestId(
        `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
          'vc-national-1',
        )}`,
      ),
    ).toBeNull();
  });

  // ─── handleVCSelection – allowMultiple mode ──────────────────────────────

  /**
   * Spec: When `allowMultipleCredentials` is true, selecting a VC adds it
   * to the existing selection without removing the others (multi-select).
   */
  it('adds a VC to the existing selection when allowMultipleCredentials is true', async () => {
    const selectVcs = jest.fn();
    const props = buildDefaultProps({
      selectVcs,
      credentialSet: {options: [['health-id']], required: false},
      matchingVCsResult: {
        'health-id': buildMatchResult(['vc-health-1', 'vc-health-2'], true),
      },
      satisfiableOptions: [['health-id']],
    });

    const {findByTestId, getAllByTestId, getByTestId} = render(<CredentialSetSection {...props} />);

    fireEvent.press(
      getByTestId(
        'test-section-option-0-query-health-id-multi-vc-show-more-button',
      ),
    );

    // No outer accordion toggle — content renders directly
    await waitFor(() => {
      expect(
        getAllByTestId(
          `vc-item-test-section-option-0-query-health-id-vc-${vcKey('vc-health-1')}`,
        ).length,
      ).toBeGreaterThan(1);
    });
    const vc1 = getAllByTestId(
      `vc-item-test-section-option-0-query-health-id-vc-${vcKey('vc-health-1')}`,
    )[1];
    const vc2 = await findByTestId(
      `vc-item-test-section-option-0-query-health-id-vc-${vcKey(
        'vc-health-2',
      )}`,
    );

    // Select vc-health-1 first
    fireEvent.press(vc1);
    await waitFor(() => expect(selectVcs).toHaveBeenCalledTimes(1));

    // Select vc-health-2 (allowMultiple → appends to selection)
    fireEvent.press(vc2);
    await waitFor(() => expect(selectVcs).toHaveBeenCalledTimes(2));

    // vc-health-1 should still be visually selected in the internal state
    expect(
      getAllByTestId(
        `vc-item-test-section-option-0-query-health-id-vc-${vcKey('vc-health-1')}`,
      ).some(item => item.props.accessibilityState?.selected),
    ).toBe(true);

    // Second selectVcs call targets vc-health-2 (per-VC call; parent accumulates)
    const secondCall = selectVcs.mock.calls[1][0];
    expect(secondCall['health-id'].has(vcKey('vc-health-2'))).toBe(true);
  });

  // ─── handleVCSelection – deselect a VC ───────────────────────────────────

  /**
   * Spec: Pressing a VC that is already selected deselects it by calling
   * deselectVcs. The required set auto-preselects the first VC, so pressing
   * it again should deselect it.
   */
  it('calls deselectVcs when an already-selected VC is pressed again', async () => {
    const deselectVcs = jest.fn();
    const props = buildDefaultProps({
      deselectVcs,
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for auto-preselection: required set → vc-national-1 selected
    await waitFor(() =>
      expect(
        getByTestId(
          `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
            'vc-national-1',
          )}`,
        ).props.accessibilityState?.selected,
      ).toBe(true),
    );

    // Press the already-selected vc-national-1 to deselect it
    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
          'vc-national-1',
        )}`,
      ),
    );

    await waitFor(() => {
      expect(deselectVcs).toHaveBeenCalledTimes(1);
    });

    const calledWith = deselectVcs.mock.calls[0][0];
    expect(calledWith['national-id']).toBeInstanceOf(Set);
    expect(calledWith['national-id'].has(vcKey('vc-national-1'))).toBe(true);
  });

  // ─── handleOptionToggle – selecting a new option ─────────────────────────

  /**
   * Spec: Pressing the "select all" checkbox for a multi-query option selects
   * the first matching VC for each query in that option and calls
   * selectVcs with the aggregated keys. Uses an optional set so the option
   * starts unselected and the first checkbox press triggers selection.
   */
  it('calls selectVcs with first VC per query when a multi-query option is toggled on', async () => {
    const selectVcs = jest.fn();
    const props = buildDefaultProps({
      selectVcs,
      credentialSet: {
        options: [['driving-license', 'age-proof']],
        required: false,
      },
      matchingVCsResult: {
        'driving-license': buildMatchResult(['vc-dl']),
        'age-proof': buildMatchResult(['vc-age']),
      },
      satisfiableOptions: [['driving-license', 'age-proof']],
    });

    const {getByLabelText} = render(<CredentialSetSection {...props} />);

    // No outer accordion toggle — content renders directly
    fireEvent.press(
      getByLabelText('checkbox-single-test-section-option-0-select-all'),
    );

    await waitFor(() => {
      expect(selectVcs).toHaveBeenCalledTimes(1);
    });

    const calledWith = selectVcs.mock.calls[0][0];
    expect(calledWith['driving-license'].has(vcKey('vc-dl'))).toBe(true);
    expect(calledWith['age-proof'].has(vcKey('vc-age'))).toBe(true);
  });

  // ─── Selecting one option deselects others ───────────────────────────────

  /**
   * Spec: A credential set is satisfied by picking ONE option. When the user
   * selects a new option, any previously selected option must be deselected
   * and deselectVcs must be called for the removed VCs.
   * The required set auto-preselects option 0 (national-id).
   */
  it('deselects the previously selected option when a new option is chosen', async () => {
    const selectVcs = jest.fn();
    const deselectVcs = jest.fn();
    const props = buildDefaultProps({
      selectVcs,
      deselectVcs,
      credentialSet: {options: [['national-id'], ['tax-id']], required: true},
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1']),
        'tax-id': buildMatchResult(['vc-tax-1']),
      },
      satisfiableOptions: [['national-id'], ['tax-id']],
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for auto-preselection: required set → option 0 (national-id) selected
    await waitFor(() =>
      expect(
        getByTestId(
          `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
            'vc-national-1',
          )}`,
        ).props.accessibilityState?.selected,
      ).toBe(true),
    );
    // Clear spies so only the user-initiated call is counted below.
    selectVcs.mockClear();
    deselectVcs.mockClear();

    // Select option 1 (tax-id) – this should trigger deselect of option 0
    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-1-query-tax-id-vc-${vcKey('vc-tax-1')}`,
      ),
    );

    await waitFor(() => {
      expect(selectVcs).toHaveBeenCalledTimes(1);
    });

    // selectVcs called for the newly selected VC
    const selectedWith = selectVcs.mock.calls[0][0];
    expect(selectedWith['tax-id'].has(vcKey('vc-tax-1'))).toBe(true);

    // deselectVcs called for the previously selected national-id VC
    expect(deselectVcs).toHaveBeenCalled();
    const deselectedWith = deselectVcs.mock.calls.find(
      (call: any[]) => call[0]['national-id'],
    )?.[0];
    expect(deselectedWith?.['national-id']).toBeDefined();
    expect(deselectedWith?.['national-id'].has(vcKey('vc-national-1'))).toBe(
      true,
    );
  });

  // ─── handleOptionToggle – deselecting a selected option ──────────────────

  /**
   * Spec: Pressing the "select all" checkbox of an already-selected multi-query
   * option must deselect it and call deselectVcs for its VCs.
   * The required set auto-preselects option 0 (driving-license + age-proof).
   */
  it('calls deselectVcs when a selected multi-query option is toggled off', async () => {
    const deselectVcs = jest.fn();
    const props = buildDefaultProps({
      deselectVcs,
      credentialSet: {
        options: [['driving-license', 'age-proof']],
        required: true,
      },
      matchingVCsResult: {
        'driving-license': buildMatchResult(['vc-dl']),
        'age-proof': buildMatchResult(['vc-age']),
      },
      satisfiableOptions: [['driving-license', 'age-proof']],
    });

    const {getByLabelText} = render(<CredentialSetSection {...props} />);

    // Wait for auto-preselection: required multi-query option → both dl + age selected
    await waitFor(() =>
      expect(
        getByLabelText('checkbox-single-test-section-option-0-select-all').props
          .checked,
      ).toBe(true),
    );

    // Pressing the already-checked checkbox should deselect it
    fireEvent.press(
      getByLabelText('checkbox-single-test-section-option-0-select-all'),
    );

    await waitFor(() => {
      expect(deselectVcs).toHaveBeenCalled();
    });
  });

  /**
   * Spec: Selecting a VC in one option must deselect all other currently-selected
   * options. The required set auto-preselects option 0 (id1).
   */
  it('deselects other options when selecting a VC in an option', async () => {
    const selectVcs = jest.fn();
    const deselectVcs = jest.fn();
    const vc_id1_key = vcKey('vc-id1');
    const vc_id2_key = vcKey('vc-id2');

    const props = buildDefaultProps({
      selectVcs,
      deselectVcs,
      credentialSet: {
        options: [['id1'], ['id2']],
        required: true,
      },
      matchingVCsResult: {
        id1: buildMatchResult(['vc-id1']),
        id2: buildMatchResult(['vc-id2']),
      },
      satisfiableOptions: [['id1'], ['id2']],
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for auto-preselection: required set → option 0 (id1) selected
    await waitFor(() =>
      expect(
        getByTestId(`vc-item-test-section-option-0-query-id1-vc-${vc_id1_key}`)
          .props.accessibilityState?.selected,
      ).toBe(true),
    );
    // Clear spies so only the user-initiated call is counted below.
    selectVcs.mockClear();
    deselectVcs.mockClear();

    // User selects ID2 in option 1
    fireEvent.press(
      getByTestId(`vc-item-test-section-option-1-query-id2-vc-${vc_id2_key}`),
    );

    await waitFor(() => {
      expect(selectVcs).toHaveBeenCalledTimes(1);
    });

    // Verify selectVcs was called for id2
    const selectCall = selectVcs.mock.calls[0][0];
    expect(selectCall['id2'].has(vc_id2_key)).toBe(true);

    // Verify deselectVcs includes the previously selected option 0 (id1)
    expect(deselectVcs).toHaveBeenCalled();
    const deselectedWith = deselectVcs.mock.calls.find(
      (call: any[]) => call[0]['id1'],
    )?.[0];
    expect(deselectedWith?.['id1']).toBeDefined();
    expect(deselectedWith?.['id1'].has(vc_id1_key)).toBe(true);

    // Verify option 1's VC is now the only selected one
    await waitFor(() => {
      expect(
        getByTestId(`vc-item-test-section-option-1-query-id2-vc-${vc_id2_key}`)
          .props.accessibilityState?.selected,
      ).toBe(true);
    });

    // Option 0's VC should be deselected
    expect(
      getByTestId(`vc-item-test-section-option-0-query-id1-vc-${vc_id1_key}`)
        .props.accessibilityState?.selected,
    ).toBe(false);
  });
});

describe('CredentialSetSection preselection', () => {
  it('prefers the satisfiable option that reuses already selected VCs and fills remaining queries with first matches', async () => {
    const selectedSharedKey = vcKey('vc-shared');
    const fallbackKey = vcKey('vc-companion');

    const {getByLabelText, getByTestId} = render(
      <CredentialSetSection
        credentialSet={{
          options: [
            ['first-option-query-1', 'first-option-query-2'],
            ['preferred-option-query-1', 'preferred-option-query-2'],
          ],
          required: true,
        }}
        matchingVCsResult={{
          'first-option-query-1': buildMatchResult(['vc-first-option']),
          'first-option-query-2': buildMatchResult(['vc-companion']),
          'preferred-option-query-1': buildMatchResult(['vc-shared']),
          'preferred-option-query-2': buildMatchResult(['vc-companion']),
        }}
        onSelectionChange={jest.fn()}
        satisfiableOptions={[
          ['first-option-query-1', 'first-option-query-2'],
          ['preferred-option-query-1', 'preferred-option-query-2'],
        ]}
        selectedVcKeys={new Set([selectedSharedKey])}
        selectVcs={jest.fn()}
        deselectVcs={jest.fn()}
        testId="test-section"
      />,
    );

    await waitFor(() => {
      expect(
        getByLabelText('checkbox-single-test-section-option-1-select-all').props
          .checked,
      ).toBe(true);
    });


    expect(
      getByLabelText('checkbox-single-test-section-option-0-select-all').props
        .checked,
    ).toBe(false);

    expect(
      getByTestId(
        `vc-item-test-section-option-1-query-preferred-option-query-1-vc-${selectedSharedKey}`,
      ).props.accessibilityState?.selected,
    ).toBe(true);

    expect(
      getByTestId(
        `vc-item-test-section-option-1-query-preferred-option-query-2-vc-${fallbackKey}`,
      ).props.accessibilityState?.selected,
    ).toBe(true);
  });

   it('falls back to the first satisfiable option when no already selected VC matches', async () => {
     const firstOptionKey = vcKey('vc-first-option');
     const secondOptionKey = vcKey('vc-second-option');

     const {getByTestId} = render(
       <CredentialSetSection
         credentialSet={{
           options: [['first-option-query'], ['second-option-query']],
           required: true,
         }}
         matchingVCsResult={{
           'first-option-query': buildMatchResult(['vc-first-option']),
           'second-option-query': buildMatchResult(['vc-second-option']),
         }}
         satisfiableOptions={[['first-option-query'], ['second-option-query']]}
         selectedVcKeys={new Set([vcKey('vc-unrelated')])}
         selectVcs={jest.fn()}
         deselectVcs={jest.fn()}
         onSelectionChange={jest.fn()}
         testId="fallback-section"
       />,
     );

     await waitFor(() => {
       expect(
         getByTestId(
           `vc-item-fallback-section-option-0-query-first-option-query-vc-${firstOptionKey}`,
         ).props.accessibilityState?.selected,
       ).toBe(true);
     });

     expect(
       getByTestId(
         `vc-item-fallback-section-option-1-query-second-option-query-vc-${secondOptionKey}`,
       ).props.accessibilityState?.selected,
     ).toBe(false);
   });
});

describe('CredentialSetSection – Multiple allowMultiple options with same query', () => {
  it('deselects VC from previous option when switching to same VC in different option (both allowMultiple=true)', async () => {
    const selectVcs = jest.fn();
    const deselectVcs = jest.fn();
    const vc1_key = vcKey('vc-1');

    const props = buildDefaultProps({
      selectVcs,
      deselectVcs,
      credentialSet: {
        options: [['credential-query'], ['credential-query']],
        required: true,
      },
      matchingVCsResult: {
        'credential-query': buildMatchResult(['vc-1', 'vc-2'], true), // allowMultiple=true
      },
      satisfiableOptions: [['credential-query'], ['credential-query']],
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for auto-preselection: required set → option 0's vc-1 selected
    await waitFor(() =>
      expect(
        getByTestId(
          `vc-item-test-section-option-0-query-credential-query-vc-${vc1_key}`,
        ).props.accessibilityState?.selected,
      ).toBe(true),
    );

    // Verify initial selectVcs call happened for option 0
    await waitFor(() => expect(selectVcs).toHaveBeenCalled());
    selectVcs.mockClear();
    deselectVcs.mockClear();

    // User switches to Option 1's vc-1 (same VC key, different option)
    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-1-query-credential-query-vc-${vc1_key}`,
      ),
    );

    // Wait for selection callback
    await waitFor(() => {
      expect(selectVcs).toHaveBeenCalledTimes(1);
    });

    // Verify that deselectVcs was called to remove option 0's vc-1
    expect(deselectVcs).toHaveBeenCalled();
    const deselectedCall = deselectVcs.mock.calls.find(
      (call: any[]) => call[0]['credential-query'],
    )?.[0];
    expect(deselectedCall?.['credential-query']).toBeDefined();
    expect(
      deselectedCall?.['credential-query'].has(vc1_key),
    ).toBe(true);

    // Verify that option 0's VC is now deselected visually
    expect(
      getByTestId(
        `vc-item-test-section-option-0-query-credential-query-vc-${vc1_key}`,
      ).props.accessibilityState?.selected,
    ).toBe(false);

    // Verify that option 1's VC is now selected
    expect(
      getByTestId(
        `vc-item-test-section-option-1-query-credential-query-vc-${vc1_key}`,
      ).props.accessibilityState?.selected,
    ).toBe(true);
  });

  it('deselects only orphaned VCs when switching between allowMultiple options', async () => {
    const selectVcs = jest.fn();
    const deselectVcs = jest.fn();
    const vc1_key = vcKey('vc-1');
    const vc2_key = vcKey('vc-2');

    const props = buildDefaultProps({
      selectVcs,
      deselectVcs,
      credentialSet: {
        options: [
          ['credential-query'],
          ['credential-query'],
          ['credential-query'],
        ],
        required: false,
      },
      matchingVCsResult: {
        'credential-query': buildMatchResult(['vc-1', 'vc-2'], true), // all options share this, allowMultiple=true
      },
      satisfiableOptions: [
        ['credential-query'],
        ['credential-query'],
        ['credential-query'],
      ],
    });

    const {getByTestId, getAllByTestId} = render(<CredentialSetSection {...props} />);

    // Manually select option 0's vc-1
    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-0-query-credential-query-vc-${vc1_key}`,
      ),
    );

    await waitFor(() => expect(selectVcs).toHaveBeenCalled());
    selectVcs.mockClear();
    deselectVcs.mockClear();

    // Switch to option 1's vc-2 (different VC, different option)
    fireEvent.press(getByTestId("test-section-option-1-query-credential-query-multi-vc-show-more-button"))
    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-1-query-credential-query-vc-${vc2_key}`,
      ),
    );

    await waitFor(() => {
      expect(selectVcs).toHaveBeenCalledTimes(1);
    });

    // Verify that deselectVcs was called for option 0's orphaned vc-1
    expect(deselectVcs).toHaveBeenCalled();
    const deselectedCall = deselectVcs.mock.calls.find(
      (call: any[]) => call[0]?.['credential-query'],
    )?.[0];
    expect(deselectedCall?.['credential-query'].has(vc1_key)).toBe(true);

    // Option 0 should be deselected
    expect(
      getByTestId(
        `vc-item-test-section-option-0-query-credential-query-vc-${vc1_key}`,
      ).props.accessibilityState?.selected,
    ).toBe(false);

    // Option 1 should be selected
    expect(
      getAllByTestId(
        `vc-item-test-section-option-1-query-credential-query-vc-${vc2_key}`,
      )[1].props.accessibilityState?.selected,
    ).toBe(true);
  });

  /**
   * Edge case: Multiple VCs in same option, allowMultiple=true
   * When user selects vc1 in option 0, then switches to option 1,
   * only vc1 should be deselected globally (not vc2).
   */
  it('deselects only the selected VCs when switching options', async () => {
    const selectVcs = jest.fn();
    const deselectVcs = jest.fn();
    const vc1_key = vcKey('vc-1');
    const vc2_key = vcKey('vc-2');

    const props = buildDefaultProps({
      selectVcs,
      deselectVcs,
      credentialSet: {
        options: [['credential-query'], ['credential-query']],
        required: false,
      },
      matchingVCsResult: {
        'credential-query': buildMatchResult(['vc-1', 'vc-2'], true),
      },
      satisfiableOptions: [['credential-query'], ['credential-query']],
    });

    const {getByTestId, getAllByTestId} = render(
      <CredentialSetSection {...props} />,
    );

    // User selects option 0's vc-1
    // Note: getAllByTestId when expandable list exists
    const allVc1s = getAllByTestId(
      `vc-item-test-section-option-0-query-credential-query-vc-${vc1_key}`,
    );
    fireEvent.press(allVc1s[0]); // First instance visible

    await waitFor(() => expect(selectVcs).toHaveBeenCalled());
    selectVcs.mockClear();
    deselectVcs.mockClear();

    // User switches to option 1's vc-2 (not vc-1)
    fireEvent.press(getByTestId("test-section-option-1-query-credential-query-multi-vc-show-more-button"))
    const allVc2s = getAllByTestId(
      `vc-item-test-section-option-1-query-credential-query-vc-${vc2_key}`,
    );
    fireEvent.press(allVc2s[0]);

    await waitFor(() => {
      expect(selectVcs).toHaveBeenCalledTimes(1);
    });

    // Verify only vc-1 is deselected, vc-2 was never in option 0 anyway
    expect(deselectVcs).toHaveBeenCalled();
    const deselectedCall = deselectVcs.mock.calls.find(
      (call: any[]) => call[0]?.['credential-query'],
    )?.[0];
    expect(deselectedCall?.['credential-query'].has(vc1_key)).toBe(true);
    expect(
      deselectedCall?.['credential-query'].has(vc2_key) ?? false,
    ).toBe(false);
  });
});

