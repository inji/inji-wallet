/* eslint-disable @typescript-eslint/no-explicit-any */
import {openID4VPModel} from './openID4VPModel';
import {KeyTypes} from '../../shared/cryptoutil/KeyTypes';

describe('openID4VPModel', () => {
  describe('Model context', () => {
    it('should initialize with default context values', () => {
      const initialContext = openID4VPModel.initialContext;

      expect(initialContext.urlEncodedAuthorizationRequest).toBe('');
      expect(initialContext.checkedAll).toBe(false);
      expect(initialContext.isShareWithSelfie).toBe(false);
      expect(initialContext.showFaceAuthConsent).toBe(true);
      expect(initialContext.purpose).toBe('');
      expect(initialContext.error).toBe('');
      expect(initialContext.publicKey).toBe('');
      expect(initialContext.privateKey).toBe('');
      expect(initialContext.keyType).toBe(KeyTypes.ED25519);
      expect(initialContext.flowType).toBe('');
      expect(initialContext.openID4VPRetryCount).toBe(0);
      expect(initialContext.showFaceCaptureSuccessBanner).toBe(false);
      expect(initialContext.isFaceVerificationRetryAttempt).toBe(false);
      expect(initialContext.requestedClaims).toBe('');
      expect(initialContext.showLoadingScreen).toBe(false);
      expect(initialContext.isOVPViaDeepLink).toBe(false);
      expect(initialContext.showTrustConsentModal).toBe(false);
      expect(initialContext.unsignedVPToken).toEqual({});
      expect(initialContext.hasNoMatchingVCs).toBe(false);
      expect(initialContext.presentationRequest).toEqual({});
    });

    it('should initialize with empty object contexts', () => {
      const initialContext = openID4VPModel.initialContext;

      expect(initialContext.authenticationResponse).toEqual({});
      expect(initialContext.vcsMatchingAuthRequest).toEqual({});
      expect(initialContext.selectedVCs).toEqual({});
      expect(initialContext.selectedDisclosuresByVc).toEqual({});
      expect(initialContext.miniViewSelectedVC).toEqual({});
    });

    it('should initialize with empty array contexts', () => {
      const initialContext = openID4VPModel.initialContext;

      expect(initialContext.trustedVerifiers).toEqual([]);
    });
  });

  describe('Events', () => {
    describe('AUTHENTICATE', () => {
      it('should create AUTHENTICATE event with all parameters', () => {
        const encodedAuthRequest = 'encoded_request_123';
        const flowType = 'OpenID4VP';
        const selectedVC = {id: 'vc123'};
        const isOVPViaDeepLink = true;

        const event = openID4VPModel.events.AUTHENTICATE(
          encodedAuthRequest,
          flowType,
          selectedVC,
          isOVPViaDeepLink,
        );

        expect(event.encodedAuthRequest).toBe(encodedAuthRequest);
        expect(event.flowType).toBe(flowType);
        expect(event.selectedVC).toEqual(selectedVC);
        expect(event.isOVPViaDeepLink).toBe(isOVPViaDeepLink);
      });

      it('should create AUTHENTICATE event with false deeplink flag', () => {
        const event = openID4VPModel.events.AUTHENTICATE(
          'request',
          'flow',
          {},
          false,
        );

        expect(event.isOVPViaDeepLink).toBe(false);
      });
    });

    describe('DOWNLOADED_VCS', () => {
      it('should create DOWNLOADED_VCS event with VCs array', () => {
        const vcs: any[] = [
          {id: 'vc1', credential: {}},
          {id: 'vc2', credential: {}},
        ];

        const event = openID4VPModel.events.DOWNLOADED_VCS(vcs);

        expect(event.vcs).toEqual(vcs);
        expect(event.vcs.length).toBe(2);
      });

      it('should create DOWNLOADED_VCS event with empty array', () => {
        const event = openID4VPModel.events.DOWNLOADED_VCS([]);

        expect(event.vcs).toEqual([]);
      });
    });

    describe('SELECT_VC', () => {
      it('should create SELECT_VC event with vcKey and inputDescriptorId', () => {
        const vcKey = 'vc_key_123';
        const inputDescriptorId = 'descriptor_456';

        const event = openID4VPModel.events.SELECT_VC(vcKey, inputDescriptorId);

        expect(event.vcKey).toBe(vcKey);
        expect(event.inputDescriptorId).toBe(inputDescriptorId);
      });

      it('should create SELECT_VC event with null inputDescriptorId', () => {
        const event = openID4VPModel.events.SELECT_VC('key', null);

        expect(event.vcKey).toBe('key');
        expect(event.inputDescriptorId).toBeNull();
      });
    });

    describe('ACCEPT_REQUEST', () => {
      it('should create ACCEPT_REQUEST event with selectedVCs and disclosures', () => {
        const selectedVCs = {
          descriptor1: [{id: 'vc1'}] as any[],
          descriptor2: [{id: 'vc2'}] as any[],
        };
        const selectedDisclosuresByVc = {
          vc1: ['claim1', 'claim2'],
          vc2: ['claim3'],
        };

        const event = openID4VPModel.events.ACCEPT_REQUEST(
          selectedVCs,
          selectedDisclosuresByVc,
        );

        expect(event.selectedVCs).toEqual(selectedVCs);
        expect(event.selectedDisclosuresByVc).toEqual(selectedDisclosuresByVc);
      });

      it('should create ACCEPT_REQUEST event with empty objects', () => {
        const event = openID4VPModel.events.ACCEPT_REQUEST({}, {});

        expect(event.selectedVCs).toEqual({});
        expect(event.selectedDisclosuresByVc).toEqual({});
      });
    });

    describe('VERIFIER_TRUST_CONSENT_GIVEN', () => {
      it('should create VERIFIER_TRUST_CONSENT_GIVEN event', () => {
        const event = openID4VPModel.events.VERIFIER_TRUST_CONSENT_GIVEN();

        expect(event.type).toBe('VERIFIER_TRUST_CONSENT_GIVEN');
      });
    });

    describe('VERIFY_AND_ACCEPT_REQUEST', () => {
      it('should create VERIFY_AND_ACCEPT_REQUEST event with selectedVCs and disclosures', () => {
        const selectedVCs = {descriptor1: [{id: 'vc1'}] as any[]};
        const selectedDisclosuresByVc = {vc1: ['claim1']};

        const event = openID4VPModel.events.VERIFY_AND_ACCEPT_REQUEST(
          selectedVCs,
          selectedDisclosuresByVc,
        );

        expect(event.selectedVCs).toEqual(selectedVCs);
        expect(event.selectedDisclosuresByVc).toEqual(selectedDisclosuresByVc);
      });
    });

    describe('CONFIRM', () => {
      it('should create CONFIRM event', () => {
        const event = openID4VPModel.events.CONFIRM();

        expect(event.type).toBe('CONFIRM');
      });
    });

    describe('CANCEL', () => {
      it('should create CANCEL event', () => {
        const event = openID4VPModel.events.CANCEL();

        expect(event.type).toBe('CANCEL');
      });
    });

    describe('FACE_VERIFICATION_CONSENT', () => {
      it('should create FACE_VERIFICATION_CONSENT event with checked flag true', () => {
        const event = openID4VPModel.events.FACE_VERIFICATION_CONSENT(true);

        expect(event.isDoNotAskAgainChecked).toBe(true);
      });

      it('should create FACE_VERIFICATION_CONSENT event with checked flag false', () => {
        const event = openID4VPModel.events.FACE_VERIFICATION_CONSENT(false);

        expect(event.isDoNotAskAgainChecked).toBe(false);
      });
    });

    describe('FACE_VALID', () => {
      it('should create FACE_VALID event', () => {
        const event = openID4VPModel.events.FACE_VALID();

        expect(event.type).toBe('FACE_VALID');
      });
    });

    describe('FACE_INVALID', () => {
      it('should create FACE_INVALID event', () => {
        const event = openID4VPModel.events.FACE_INVALID();

        expect(event.type).toBe('FACE_INVALID');
      });
    });

    describe('DISMISS', () => {
      it('should create DISMISS event', () => {
        const event = openID4VPModel.events.DISMISS();

        expect(event.type).toBe('DISMISS');
      });
    });

    describe('DISMISS_POPUP', () => {
      it('should create DISMISS_POPUP event', () => {
        const event = openID4VPModel.events.DISMISS_POPUP();

        expect(event.type).toBe('DISMISS_POPUP');
      });
    });

    describe('RETRY_VERIFICATION', () => {
      it('should create RETRY_VERIFICATION event', () => {
        const event = openID4VPModel.events.RETRY_VERIFICATION();

        expect(event.type).toBe('RETRY_VERIFICATION');
      });
    });

    describe('STORE_RESPONSE', () => {
      it('should create STORE_RESPONSE event with response object', () => {
        const response = {
          status: 'success',
          data: {id: '123'},
        };

        const event = openID4VPModel.events.STORE_RESPONSE(response);

        expect(event.response).toEqual(response);
      });

      it('should create STORE_RESPONSE event with null response', () => {
        const event = openID4VPModel.events.STORE_RESPONSE(null);

        expect(event.response).toBeNull();
      });
    });

    describe('GO_BACK', () => {
      it('should create GO_BACK event', () => {
        const event = openID4VPModel.events.GO_BACK();

        expect(event.type).toBe('GO_BACK');
      });
    });

    describe('CHECK_SELECTED_VC', () => {
      it('should create CHECK_SELECTED_VC event', () => {
        const event = openID4VPModel.events.CHECK_SELECTED_VC();

        expect(event.type).toBe('CHECK_SELECTED_VC');
      });
    });

    describe('SET_SELECTED_VC', () => {
      it('should create SET_SELECTED_VC event', () => {
        const event = openID4VPModel.events.SET_SELECTED_VC();

        expect(event.type).toBe('SET_SELECTED_VC');
      });
    });

    describe('CHECK_FOR_IMAGE', () => {
      it('should create CHECK_FOR_IMAGE event', () => {
        const event = openID4VPModel.events.CHECK_FOR_IMAGE();

        expect(event.type).toBe('CHECK_FOR_IMAGE');
      });
    });

    describe('RETRY', () => {
      it('should create RETRY event', () => {
        const event = openID4VPModel.events.RETRY();

        expect(event.type).toBe('RETRY');
      });
    });

    describe('RESET_RETRY_COUNT', () => {
      it('should create RESET_RETRY_COUNT event', () => {
        const event = openID4VPModel.events.RESET_RETRY_COUNT();

        expect(event.type).toBe('RESET_RETRY_COUNT');
      });
    });

    describe('RESET_ERROR', () => {
      it('should create RESET_ERROR event', () => {
        const event = openID4VPModel.events.RESET_ERROR();

        expect(event.type).toBe('RESET_ERROR');
      });
    });

    describe('CLOSE_BANNER', () => {
      it('should create CLOSE_BANNER event', () => {
        const event = openID4VPModel.events.CLOSE_BANNER();

        expect(event.type).toBe('CLOSE_BANNER');
      });
    });

    describe('LOG_ACTIVITY', () => {
      it('should create LOG_ACTIVITY event with SHARED_SUCCESSFULLY logType', () => {
        const event = openID4VPModel.events.LOG_ACTIVITY('SHARED_SUCCESSFULLY');

        expect(event.logType).toBe('SHARED_SUCCESSFULLY');
      });

      it('should create LOG_ACTIVITY event with USER_DECLINED_CONSENT logType', () => {
        const event = openID4VPModel.events.LOG_ACTIVITY(
          'USER_DECLINED_CONSENT',
        );

        expect(event.logType).toBe('USER_DECLINED_CONSENT');
      });

      it('should create LOG_ACTIVITY event with TECHNICAL_ERROR logType', () => {
        const event = openID4VPModel.events.LOG_ACTIVITY('TECHNICAL_ERROR');

        expect(event.logType).toBe('TECHNICAL_ERROR');
      });

      it('should create LOG_ACTIVITY event with empty string logType', () => {
        const event = openID4VPModel.events.LOG_ACTIVITY('');

        expect(event.logType).toBe('');
      });
    });

    describe('AUTHENTICATE_VIA_PRESENTATION', () => {
      it('should create AUTHENTICATE_VIA_PRESENTATION event with all parameters', () => {
        const presentationRequest = 'presentation_request_123';
        const flowType = 'OpenID4VP';
        const selectedVC = {id: 'vc456'};
        const isOVPViaDeepLink = true;

        const event = openID4VPModel.events.AUTHENTICATE_VIA_PRESENTATION(
          presentationRequest,
          flowType,
          selectedVC,
          isOVPViaDeepLink,
        );

        expect(event.presentationRequest).toBe(presentationRequest);
        expect(event.flowType).toBe(flowType);
        expect(event.selectedVC).toEqual(selectedVC);
        expect(event.isOVPViaDeepLink).toBe(isOVPViaDeepLink);
      });

      it('should create AUTHENTICATE_VIA_PRESENTATION event with false deeplink flag', () => {
        const event = openID4VPModel.events.AUTHENTICATE_VIA_PRESENTATION(
          'request',
          'flow',
          {},
          false,
        );

        expect(event.isOVPViaDeepLink).toBe(false);
        expect(event.presentationRequest).toBe('request');
      });

      it('should create AUTHENTICATE_VIA_PRESENTATION event with empty selectedVC', () => {
        const event = openID4VPModel.events.AUTHENTICATE_VIA_PRESENTATION(
          'presentation_request',
          'OpenID4VP',
          {},
          true,
        );

        expect(event.selectedVC).toEqual({});
        expect(event.flowType).toBe('OpenID4VP');
      });
    });

    describe('SIGN_VP', () => {
      it('should create SIGN_VP event with data object', () => {
        const data = {
          vpToken: 'token_123',
          signature: 'sig_456',
          claims: ['claim1', 'claim2'],
        };

        const event = openID4VPModel.events.SIGN_VP(data);

        expect(event.data).toEqual(data);
        expect(event.data.vpToken).toBe('token_123');
        expect(event.data.signature).toBe('sig_456');
      });

      it('should create SIGN_VP event with null data', () => {
        const event = openID4VPModel.events.SIGN_VP(null);

        expect(event.data).toBeNull();
      });

      it('should create SIGN_VP event with empty object', () => {
        const event = openID4VPModel.events.SIGN_VP({});

        expect(event.data).toEqual({});
      });

      it('should create SIGN_VP event with complex data structure', () => {
        const data = {
          credentials: [{id: 'vc1'}, {id: 'vc2'}],
          metadata: {timestamp: Date.now(), version: '1.0'},
        };

        const event = openID4VPModel.events.SIGN_VP(data);

        expect(event.data.credentials).toHaveLength(2);
        expect(event.data.metadata.version).toBe('1.0');
      });
    });
  });
});
