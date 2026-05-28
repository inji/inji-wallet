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
 *   accordion with an "ALL REQUIRED" badge and a single checkbox to select all
 * - Selecting an option auto-fills the first matching VC for each query
 * - Deselecting an already-selected option removes it from the selection
 * - handleVCSelection in single mode replaces; in allowMultiple mode appends
 * - Selecting a new option deselects all other previously selected options
 *
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
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {CredentialSetSection} from './CredentialSetSection';
import {VCMetadata} from '../../../shared/VCMetadata';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('../../VC/VcItemContainer', () => ({
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

jest.mock('../../../shared/openID4VP/OpenID4VPHelper', () => ({
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
  matchedClaims: [],
});

const vcKey = (id: string) =>
  VCMetadata.fromVcMetadataString(buildVc(id).vcMetadata).getVcKey();

const buildMatchResult = (vcIds: string[], allowMultiple = false) => ({
  matchingVcs: vcIds.map(buildVcWithMatchedClaims),
  allowMultipleCredentials: allowMultiple,
});

const buildController = () => ({
  SELECT_VC_ITEMS: jest.fn(() => jest.fn()),
  DESELECT_VC_ITEMS: jest.fn(() => jest.fn()),
});

// Default props builder for a simple required set with one option & one query
const buildDefaultProps = (overrides: Partial<any> = {}) => ({
  credentialSet: {options: [['national-id']], required: true},
  matchingVCsResult: {
    'national-id': buildMatchResult(['vc-national-1']),
  },
  satisfiableOptions: [['national-id']],
  controller: buildController(),
  testId: 'test-section',
  initialSelectedVcKeys: {},
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

  it('renders the outer section accordion with the section testId', () => {
    const props = buildDefaultProps();
    const {getByLabelText} = render(<CredentialSetSection {...props} />);
    // Accordion testId pattern: `accordion-${testId}` via testIDProps
    expect(getByLabelText('accordion-test-section')).toBeTruthy();
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

    const {getByLabelText, findByTestId} = render(
      <CredentialSetSection {...props} />,
    );

    // The optional accordion starts collapsed; expand it to render children
    fireEvent.press(getByLabelText('accordion-toggle-test-section'));

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

  // ─── Multi-query option (combined accordion) ─────────────────────────────

  /**
   * Spec: When one option contains multiple credential queries (i.e. the user
   * must present multiple credentials together to satisfy the option), they
   * must be grouped inside an accordion labelled "Multiple Cards" with an
   * "ALL REQUIRED" badge and a single checkbox to select/deselect all.
   */
  it('renders a combined accordion for a multi-query option', () => {
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

    // Accordion testId for combined option: `accordion-${testId}-option-0-combined`
    expect(
      getByLabelText('accordion-test-section-option-0-combined'),
    ).toBeTruthy();
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

  // ─── Multi-VC accordion (multiple VCs per single query) ──────────────────

  /**
   * Spec: When multiple VCs match a single credential query, they must be
   * wrapped in an accordion so the user can expand and pick one (or more).
   */
  it('renders an inner accordion when multiple VCs match a single credential query', () => {
    const props = buildDefaultProps({
      credentialSet: {options: [['national-id']], required: true},
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
    });

    const {getByLabelText} = render(<CredentialSetSection {...props} />);

    // Inner accordion: `accordion-${testId}-option-0-query-national-id-multi-vc`
    expect(
      getByLabelText(
        'accordion-test-section-option-0-query-national-id-multi-vc',
      ),
    ).toBeTruthy();
  });

  // ─── handleVCSelection – selecting a VC ─────────────────────────────────

  /**
   * Spec: Pressing a VC calls SELECT_VC_ITEMS with that VC's key.
   */
  it('calls SELECT_VC_ITEMS when a VC is selected', async () => {
    const controller = buildController();
    const props = buildDefaultProps({
      controller,
      credentialSet: {options: [['national-id']], required: true},
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
          'vc-national-2',
        )}`,
      ),
    );

    await waitFor(() => {
      expect(controller.SELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    });

    const calledWith = controller.SELECT_VC_ITEMS.mock.calls[0][0];
    expect(calledWith['national-id']).toBeInstanceOf(Set);
    expect(calledWith['national-id'].has(vcKey('vc-national-2'))).toBe(true);
  });

  /**
   * Spec: In single-credential mode, when a second VC is selected for the
   * same query, the first VC should be replaced (not added alongside it).
   */
  it('replaces the previously selected VC in single-credential mode', async () => {
    const controller = buildController();
    const props = buildDefaultProps({
      controller,
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
      // Pre-select vc-national-1 via initial state
      initialSelectedVcKeys: {
        0: {'national-id': new Set([vcKey('vc-national-1')])},
      },
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for useEffect to apply initialSelectedVcKeys to state
    await waitFor(() =>
      expect(
        getByTestId(
          `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
            'vc-national-1',
          )}`,
        ).props.accessibilityState?.selected,
      ).toBe(true),
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
      expect(controller.SELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    });

    const calledWith = controller.SELECT_VC_ITEMS.mock.calls[0][0];
    expect(calledWith['national-id'].has(vcKey('vc-national-2'))).toBe(true);
    // vc-national-1 is no longer in the SELECT call (single-credential mode replaces)
    expect(calledWith['national-id'].has(vcKey('vc-national-1'))).toBe(false);
  });

  // ─── handleVCSelection – allowMultiple mode ──────────────────────────────

  /**
   * Spec: When `allowMultipleCredentials` is true, selecting a VC adds it
   * to the existing selection without removing the others (multi-select).
   */
  it('adds a VC to the existing selection when allowMultipleCredentials is true', async () => {
    const controller = buildController();
    const props = buildDefaultProps({
      controller,
      credentialSet: {options: [['health-id']], required: false},
      matchingVCsResult: {
        'health-id': buildMatchResult(['vc-health-1', 'vc-health-2'], true),
      },
      satisfiableOptions: [['health-id']],
      // Pre-select vc-health-1
      initialSelectedVcKeys: {
        0: {'health-id': new Set([vcKey('vc-health-1')])},
      },
    });

    const {getByLabelText, findByTestId} = render(
      <CredentialSetSection {...props} />,
    );

    // Expand the optional accordion so children are rendered
    fireEvent.press(getByLabelText('accordion-toggle-test-section'));

    // Wait for VcItemContainers to appear (inside expanded accordion)
    const vc1Key = vcKey('vc-health-1');
    const vc2Key = vcKey('vc-health-2');
    const vc1 = await findByTestId(
      `vc-item-test-section-option-0-query-health-id-vc-${vc1Key}`,
    );
    const vc2 = await findByTestId(
      `vc-item-test-section-option-0-query-health-id-vc-${vc2Key}`,
    );

    // Wait for useEffect to apply initialSelectedVcKeys (vc-health-1 should be selected)
    await waitFor(() =>
      expect(vc1.props.accessibilityState?.selected).toBe(true),
    );

    fireEvent.press(vc2);

    await waitFor(() => {
      expect(controller.SELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    });

    const calledWith = controller.SELECT_VC_ITEMS.mock.calls[0][0];
    // vc-health-2 is now in the selection
    expect(calledWith['health-id'].has(vcKey('vc-health-2'))).toBe(true);
  });

  // ─── handleVCSelection – deselect a VC ───────────────────────────────────

  /**
   * Spec: Pressing a VC that is already selected deselects it by calling
   * DESELECT_VC_ITEMS.
   */
  it('calls DESELECT_VC_ITEMS when an already-selected VC is pressed again', async () => {
    const controller = buildController();
    const props = buildDefaultProps({
      controller,
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1', 'vc-national-2']),
      },
      satisfiableOptions: [['national-id']],
      // Pre-select vc-national-1
      initialSelectedVcKeys: {
        0: {'national-id': new Set([vcKey('vc-national-1')])},
      },
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for useEffect to apply initialSelectedVcKeys so vc-national-1 is selected
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
      expect(controller.DESELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    });

    const calledWith = controller.DESELECT_VC_ITEMS.mock.calls[0][0];
    expect(calledWith['national-id']).toBeInstanceOf(Set);
    expect(calledWith['national-id'].has(vcKey('vc-national-1'))).toBe(true);
  });

  // ─── handleOptionToggle – selecting a new option ─────────────────────────

  /**
   * Spec: Pressing the "select all" checkbox for a multi-query option selects
   * the first matching VC for each query in that option and calls
   * SELECT_VC_ITEMS with the aggregated keys.
   */
  it('calls SELECT_VC_ITEMS with first VC per query when a multi-query option is toggled on', async () => {
    const controller = buildController();
    const props = buildDefaultProps({
      controller,
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

    fireEvent.press(
      getByLabelText('checkbox-single-test-section-option-0-select-all'),
    );

    await waitFor(() => {
      expect(controller.SELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    });

    const calledWith = controller.SELECT_VC_ITEMS.mock.calls[0][0];
    expect(calledWith['driving-license'].has(vcKey('vc-dl'))).toBe(true);
    expect(calledWith['age-proof'].has(vcKey('vc-age'))).toBe(true);
  });

  // ─── Selecting one option deselects others ───────────────────────────────

  /**
   * Spec: A credential set is satisfied by picking ONE option. When the user
   * selects a new option, any previously selected option must be deselected
   * and DESELECT_VC_ITEMS must be called for the removed VCs.
   */
  it('deselects the previously selected option when a new option is chosen', async () => {
    const controller = buildController();
    const props = buildDefaultProps({
      controller,
      credentialSet: {options: [['national-id'], ['tax-id']], required: true},
      matchingVCsResult: {
        'national-id': buildMatchResult(['vc-national-1']),
        'tax-id': buildMatchResult(['vc-tax-1']),
      },
      satisfiableOptions: [['national-id'], ['tax-id']],
      // Option 0 (national-id) is pre-selected
      initialSelectedVcKeys: {
        0: {'national-id': new Set([vcKey('vc-national-1')])},
      },
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for useEffect to apply initialSelectedVcKeys
    await waitFor(() =>
      expect(
        getByTestId(
          `vc-item-test-section-option-0-query-national-id-vc-${vcKey(
            'vc-national-1',
          )}`,
        ).props.accessibilityState?.selected,
      ).toBe(true),
    );

    // Select option 1 (tax-id) – this should trigger deselect of option 0
    fireEvent.press(
      getByTestId(
        `vc-item-test-section-option-1-query-tax-id-vc-${vcKey('vc-tax-1')}`,
      ),
    );

    await waitFor(() => {
      expect(controller.SELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    });

    // SELECT_VC_ITEMS called for the newly selected VC
    const selectedWith = controller.SELECT_VC_ITEMS.mock.calls[0][0];
    expect(selectedWith['tax-id'].has(vcKey('vc-tax-1'))).toBe(true);

    // DESELECT_VC_ITEMS called for the previously selected national-id VC
    expect(controller.DESELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    const deselectedWith = controller.DESELECT_VC_ITEMS.mock.calls[0][0];
    expect(deselectedWith['national-id']).toBeDefined();
    expect(deselectedWith['national-id'].has(vcKey('vc-national-1'))).toBe(
      true,
    );
  });

  // ─── handleOptionToggle – deselecting a selected option ──────────────────

  /**
   * Spec: Pressing the "select all" checkbox of an already-selected multi-query
   * option must deselect it and call DESELECT_VC_ITEMS for its VCs.
   */
  it('calls DESELECT_VC_ITEMS when a selected multi-query option is toggled off', async () => {
    const controller = buildController();
    const props = buildDefaultProps({
      controller,
      credentialSet: {
        options: [['driving-license', 'age-proof']],
        required: true,
      },
      matchingVCsResult: {
        'driving-license': buildMatchResult(['vc-dl']),
        'age-proof': buildMatchResult(['vc-age']),
      },
      satisfiableOptions: [['driving-license', 'age-proof']],
      // Pre-select option 0
      initialSelectedVcKeys: {
        0: {
          'driving-license': new Set([vcKey('vc-dl')]),
          'age-proof': new Set([vcKey('vc-age')]),
        },
      },
    });

    const {getByLabelText} = render(<CredentialSetSection {...props} />);

    // Wait for initial selection to be applied
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
      expect(controller.DESELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    });
  });

  it('deselects other options when selecting a VC in an option', async () => {
    const controller = buildController();
    const vc_id1_key = vcKey('vc-id1');
    const vc_id2_key = vcKey('vc-id2');
    const vc_id3_key = vcKey('vc-id3');
    const vc_id4_key = vcKey('vc-id4');

    const props = buildDefaultProps({
      controller,
      credentialSet: {
        options: [['id1'], ['id2'], ['id3', 'id4']],
        required: true,
      },
      matchingVCsResult: {
        id1: buildMatchResult(['vc-id1']), // single match, will auto-select
        id2: buildMatchResult(['vc-id2']),
        id3: buildMatchResult(['vc-id3']),
        id4: buildMatchResult(['vc-id4', 'vc-id4-alt']), // multiple matches
      },
      satisfiableOptions: [['id1'], ['id2'], ['id3', 'id4']],
      // Pre-select option 0 and option 2 (multi-query)
      initialSelectedVcKeys: {
        0: {id1: new Set([vc_id1_key])},
        2: {id3: new Set([vc_id3_key]), id4: new Set([vc_id4_key])},
      },
    });

    const {getByTestId} = render(<CredentialSetSection {...props} />);

    // Wait for option 0's initial selection
    await waitFor(() =>
      expect(
        getByTestId(`vc-item-test-section-option-0-query-id1-vc-${vc_id1_key}`)
          .props.accessibilityState?.selected,
      ).toBe(true),
    );

    // User selects ID2 in option 1
    fireEvent.press(
      getByTestId(`vc-item-test-section-option-1-query-id2-vc-${vc_id2_key}`),
    );

    await waitFor(() => {
      expect(controller.SELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    });

    // Verify SELECT was called for id2
    const selectCall = controller.SELECT_VC_ITEMS.mock.calls[0][0];
    expect(selectCall['id2'].has(vc_id2_key)).toBe(true);

    // Verify DESELECT includes VCs from BOTH option 0 and option 2
    expect(controller.DESELECT_VC_ITEMS).toHaveBeenCalledTimes(1);
    const deselectCall = controller.DESELECT_VC_ITEMS.mock.calls[0][0];

    // Option 0 must be deselected
    expect(deselectCall['id1']).toBeDefined();
    expect(deselectCall['id1'].has(vc_id1_key)).toBe(true);

    // Option 2 must be deselected (both queries from multi-query option)
    expect(deselectCall['id3']).toBeDefined();
    expect(deselectCall['id3'].has(vc_id3_key)).toBe(true);
    expect(deselectCall['id4']).toBeDefined();
    expect(deselectCall['id4'].has(vc_id4_key)).toBe(true);

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
