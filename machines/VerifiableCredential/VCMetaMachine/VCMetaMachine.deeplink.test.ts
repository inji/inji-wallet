import {State} from 'xstate';
import {vcMetaMachine} from './VCMetaMachine';

describe('VCMeta credential offer banner state', () => {
  it('sets and resets the busy-offer flag', () => {
    const readyState = State.from(
      {ready: 'showTamperedPopup'},
      vcMetaMachine.context,
    );
    const busyState = vcMetaMachine.transition(
      readyState,
      'CREDENTIAL_OFFER_DROPPED_DUE_TO_BUSY_STATE',
    );

    expect(busyState.context.isCredentialOfferDroppedDueToBusyState).toBe(true);

    const resetState = vcMetaMachine.transition(
      busyState,
      'RESET_CREDENTIAL_OFFER_DROPPED_DUE_TO_BUSY_STATE',
    );

    expect(resetState.context.isCredentialOfferDroppedDueToBusyState).toBe(
      false,
    );
  });
});
