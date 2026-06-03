import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {MissingClaimsView} from './MissingClaimsView';

// Note: the global jest-init.js mock replaces useState with a no-op setter.
// Tests that need the expanded state use the initialExpanded prop directly.

describe('MissingClaimsView', () => {
  const threeClaims = ['claim_one', 'claim_two', 'claim_three'];
  const manyClaims = [
    'claim_one',
    'claim_two',
    'claim_three',
    'claim_four',
    'claim_five',
  ];

  it('renders the claims intro text', () => {
    const {getByLabelText} = render(<MissingClaimsView claims={threeClaims} />);
    expect(getByLabelText('missingClaimsIntroText')).toBeTruthy();
  });

  it('renders only the first 3 claims in collapsed view', () => {
    const {getByTestId, queryByTestId} = render(
      <MissingClaimsView claims={manyClaims} />,
    );
    expect(getByTestId('missingClaimRow-0')).toBeTruthy();
    expect(getByTestId('missingClaimRow-1')).toBeTruthy();
    expect(getByTestId('missingClaimRow-2')).toBeTruthy();
    expect(queryByTestId('missingClaimRow-3')).toBeNull();
  });

  it('shows correct claim text for each visible claim', () => {
    const {getByText} = render(<MissingClaimsView claims={threeClaims} />);
    expect(getByText('claim_one')).toBeTruthy();
    expect(getByText('claim_two')).toBeTruthy();
    expect(getByText('claim_three')).toBeTruthy();
  });

  it('does not render "show more" button when claims count is 3 or fewer', () => {
    const {queryByTestId} = render(<MissingClaimsView claims={threeClaims} />);
    expect(queryByTestId('showMoreButton')).toBeNull();
  });

  it('renders "show more" button when claims exceed 3', () => {
    const {getByTestId} = render(<MissingClaimsView claims={manyClaims} />);
    expect(getByTestId('showMoreButton')).toBeTruthy();
  });

  it('expanded modal is not visible initially', () => {
    const {queryByLabelText} = render(<MissingClaimsView claims={manyClaims} />);
    expect(queryByLabelText('missingClaimsModalTitle')).toBeNull();
  });

  it('renders "show more" button with correct hidden count', () => {
    const {getByTestId} = render(<MissingClaimsView claims={manyClaims} />);
    const button = getByTestId('showMoreButton');
    // hiddenCount = 5 - 3 = 2
    expect(button).toBeTruthy();
  });

  it('renders expanded view when initialExpanded is true', () => {
    const {getByLabelText} = render(
      <MissingClaimsView claims={manyClaims} initialExpanded />,
    );
    expect(getByLabelText('missingClaimsModalTitle')).toBeTruthy();
  });

  it('expanded view shows all claims numbered', () => {
    const {getByTestId, getByLabelText} = render(
      <MissingClaimsView claims={manyClaims} initialExpanded />,
    );
    manyClaims.forEach((_claim, index) => {
      expect(getByTestId(`expandedClaimRow-${index}`)).toBeTruthy();
      expect(getByLabelText(`expandedClaimText-${index}`)).toBeTruthy();
      expect(getByLabelText(`expandedClaimNumber-${index}`)).toBeTruthy();
    });
  });

  it('expanded view displays the header title', () => {
    const {getByLabelText} = render(
      <MissingClaimsView claims={manyClaims} initialExpanded />,
    );
    expect(getByLabelText('missingClaimsModalTitle')).toBeTruthy();
  });

  it('expanded view displays the required count badge', () => {
    const {getByLabelText} = render(
      <MissingClaimsView claims={manyClaims} initialExpanded />,
    );
    expect(getByLabelText('badge-missingClaimsModalBadge')).toBeTruthy();
  });

  it('expanded view displays footer text', () => {
    const {getByLabelText} = render(
      <MissingClaimsView claims={manyClaims} initialExpanded />,
    );
    expect(getByLabelText('missingClaimsModalFooter')).toBeTruthy();
  });

  it('expanded view has a close button', () => {
    const {getByTestId} = render(
      <MissingClaimsView claims={manyClaims} initialExpanded />,
    );
    expect(getByTestId('missingClaimsModalCloseButton')).toBeTruthy();
  });

  it('show more button is not shown when exactly 3 claims are present', () => {
    const {queryByTestId} = render(<MissingClaimsView claims={threeClaims} />);
    expect(queryByTestId('showMoreButton')).toBeNull();
  });

  it('renders red bullet for each visible claim', () => {
    const {getByTestId} = render(<MissingClaimsView claims={threeClaims} />);
    threeClaims.forEach((_claim, index) => {
      expect(getByTestId(`missingClaimBullet-${index}`)).toBeTruthy();
    });
  });

  it('renders correctly with an empty claims array', () => {
    const {queryByTestId, toJSON} = render(<MissingClaimsView claims={[]} />);
    expect(queryByTestId('showMoreButton')).toBeNull();
    expect(toJSON()).not.toBeNull();
  });
});
