jest.mock('../../shared/vciClient/VciClient', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({})),
  },
}));
jest.mock('../openID4VP/openID4VPMachine', () => ({
  createOpenID4VPMachine: jest.fn(),
  openID4VPMachine: {},
  OpenID4VPEvents: {
    SIGN_VP: jest.fn(),
  },
}));

import {IssuersMachine} from './IssuersMachine';
import {ErrorMessage} from '../../shared/openId4VCI/Utils';
import {State} from 'xstate';

describe('IssuersMachine', () => {
  const storageCheckCompleted = (isSignedIn: boolean) => ({
    type: 'done.invoke.issuersMachine.storing:invocation[0]',
    data: {isSignedIn},
  });

  it.each([true, false])(
    'leaves storing after checking sign-in status: %s',
    isSignedIn => {
      const state = IssuersMachine.transition(
        'storing',
        storageCheckCompleted(isSignedIn),
      );

      expect(state.matches('done')).toBe(true);
    },
  );

  it('sets an error when the storage sign-in check fails', () => {
    const state = IssuersMachine.transition('storing', {
      type: 'error.platform.issuersMachine.storing:invocation[0]',
      data: new Error('storage check failed'),
    });

    expect(state.matches('error')).toBe(true);
    expect(state.context.errorMessage).toBe(ErrorMessage.GENERIC);
    expect(state.context.loadingReason).toBeNull();
  });

  it('shows a recoverable error when auto wallet binding fails', () => {
    const state = IssuersMachine.transition('requestingBindingOTP', {
      type: 'error.platform.issuersMachine.requestingBindingOTP:invocation[0]',
      data: new Error('binding failed'),
    });

    expect(state.matches('error')).toBe(true);
    expect(state.context.errorMessage).toBe(ErrorMessage.GENERIC);
    expect(state.context.loadingReason).toBe('');
  });

  it('clears stale auth WebView state before handling another offer', () => {
    const state = IssuersMachine.transition(
      State.from('selectingIssuer', {
        ...IssuersMachine.context,
        authEndpointToOpen: true,
        authEndpoint: 'https://old-auth.example.com',
      }),
      {
        type: 'CREDENTIAL_OFFER_VIA_DEEP_LINK',
        data: 'openid-credential-offer://new-offer',
      },
    );

    expect(state.matches('credentialDownloadFromOffer')).toBe(true);
    expect(state.context.authEndpointToOpen).toBe(false);
    expect(state.context.authEndpoint).toBe('');
  });

  it('clears auth WebView state after navigation consumes it', () => {
    const state = IssuersMachine.transition(
      State.from('selectingIssuer', {
        ...IssuersMachine.context,
        authEndpointToOpen: true,
        authEndpoint: 'https://auth.example.com',
      }),
      'AUTH_ENDPOINT_OPENED',
    );

    expect(state.context.authEndpointToOpen).toBe(false);
    expect(state.context.authEndpoint).toBe('');
  });

  it('tracks deep-linked offers through an error and clears the flag on exit', () => {
    const offerState = IssuersMachine.transition(
      State.from('selectingIssuer', IssuersMachine.context),
      {
        type: 'CREDENTIAL_OFFER_VIA_DEEP_LINK',
        data: 'openid-credential-offer://offer',
      },
    );

    expect(offerState.context.isCredentialOfferViaDeepLink).toBe(true);

    const errorState = IssuersMachine.transition(offerState, {
      type: 'error.platform.issuersMachine.credentialDownloadFromOffer:invocation[0]',
      data: new Error('invalid offer'),
    });

    expect(errorState.matches('error')).toBe(true);
    expect(errorState.context.isCredentialOfferViaDeepLink).toBe(true);

    const resetState = IssuersMachine.transition(errorState, 'RESET_ERROR');

    expect(resetState.matches('selectingIssuer')).toBe(true);
    expect(resetState.context.isCredentialOfferViaDeepLink).toBe(false);
    expect(resetState.context.isCredentialOfferFlow).toBe(false);
  });
});
