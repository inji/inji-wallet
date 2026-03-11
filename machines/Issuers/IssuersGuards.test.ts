import {IssuersGuards} from './IssuersGuards';
import {VerificationErrorType} from '../../shared/vcjs/verifyCredential';
import {ErrorMessage, OIDCErrors} from '../../shared/openId4VCI/Utils';
import {BiometricCancellationError} from '../../shared/error/BiometricCancellationError';
import {AuthorizationType} from '../../shared/constants';

describe('IssuersGuards', () => {
  const guards = IssuersGuards();

  describe('isVerificationPendingBecauseOfNetworkIssue', () => {
    it('should return true when error message is NETWORK_ERROR', () => {
      const event = {data: new Error(VerificationErrorType.NETWORK_ERROR)};
      expect(guards.isVerificationPendingBecauseOfNetworkIssue({}, event)).toBe(
        true,
      );
    });

    it('should return false for other errors', () => {
      const event = {data: new Error('some other error')};
      expect(guards.isVerificationPendingBecauseOfNetworkIssue({}, event)).toBe(
        false,
      );
    });
  });

  describe('isSignedIn', () => {
    it('should return true when isSignedIn is true', () => {
      const event = {data: {isSignedIn: true}};
      expect(guards.isSignedIn({}, event)).toBe(true);
    });

    it('should return false when isSignedIn is false', () => {
      const event = {data: {isSignedIn: false}};
      expect(guards.isSignedIn({}, event)).toBe(false);
    });
  });

  describe('hasKeyPair', () => {
    it('should return true when publicKey exists', () => {
      expect(guards.hasKeyPair({publicKey: 'abc123'})).toBe(true);
    });

    it('should return false when publicKey is empty', () => {
      expect(guards.hasKeyPair({publicKey: ''})).toBe(false);
    });

    it('should return false when publicKey is undefined', () => {
      expect(guards.hasKeyPair({})).toBe(false);
    });
  });

  describe('isKeyTypeNotFound', () => {
    it('should return true when keyType is empty string', () => {
      expect(guards.isKeyTypeNotFound({keyType: ''})).toBe(true);
    });

    it('should return false when keyType has value', () => {
      expect(guards.isKeyTypeNotFound({keyType: 'RSA'})).toBe(false);
    });
  });

  describe('isInternetConnected', () => {
    it('should return true when connected', () => {
      const event = {data: {isConnected: true}};
      expect(guards.isInternetConnected({}, event)).toBe(true);
    });

    it('should return false when not connected', () => {
      const event = {data: {isConnected: false}};
      expect(guards.isInternetConnected({}, event)).toBe(false);
    });
  });

  describe('canSelectIssuerAgain', () => {
    it('should return true for OIDC config error', () => {
      const context = {
        errorMessage: OIDCErrors.OIDC_CONFIG_ERROR_PREFIX + 'details',
      };
      expect(guards.canSelectIssuerAgain(context)).toBe(true);
    });

    it('should return true for request timeout', () => {
      const context = {errorMessage: ErrorMessage.REQUEST_TIMEDOUT};
      expect(guards.canSelectIssuerAgain(context)).toBe(true);
    });

    it('should return false for other errors', () => {
      const context = {errorMessage: 'some random error'};
      expect(guards.canSelectIssuerAgain(context)).toBe(false);
    });
  });

  describe('shouldFetchIssuersAgain', () => {
    it('should return true when issuers is empty', () => {
      expect(guards.shouldFetchIssuersAgain({issuers: []})).toBe(true);
    });

    it('should return false when issuers has items', () => {
      expect(guards.shouldFetchIssuersAgain({issuers: [{id: '1'}]})).toBe(
        false,
      );
    });
  });

  describe('hasUserCancelledBiometric', () => {
    it('should return true for BiometricCancellationError', () => {
      const event = {data: new BiometricCancellationError()};
      expect(guards.hasUserCancelledBiometric({}, event)).toBe(true);
    });

    it('should return false for other errors', () => {
      const event = {data: new Error('other')};
      expect(guards.hasUserCancelledBiometric({}, event)).toBe(false);
    });
  });

  describe('isCredentialOfferFlow', () => {
    it('should return true when isCredentialOfferFlow is true', () => {
      expect(guards.isCredentialOfferFlow({isCredentialOfferFlow: true})).toBe(
        true,
      );
    });

    it('should return false when isCredentialOfferFlow is false', () => {
      expect(guards.isCredentialOfferFlow({isCredentialOfferFlow: false})).toBe(
        false,
      );
    });
  });

  describe('isIssuerIdInTrustedIssuers', () => {
    it('should return true when event data is true', () => {
      expect(guards.isIssuerIdInTrustedIssuers({}, {data: true})).toBe(true);
    });

    it('should return false when event data is false', () => {
      expect(guards.isIssuerIdInTrustedIssuers({}, {data: false})).toBe(false);
    });
  });

  describe('isPresentationAuthorization', () => {
    it('should return true for OPENID4VP_PRESENTATION auth type', () => {
      expect(
        guards.isPresentationAuthorization({
          authorizationType: AuthorizationType.OPENID4VP_PRESENTATION,
        }),
      ).toBe(true);
    });

    it('should return false for other auth types', () => {
      expect(
        guards.isPresentationAuthorization({
          authorizationType: 'other',
        }),
      ).toBe(false);
    });
  });
});
