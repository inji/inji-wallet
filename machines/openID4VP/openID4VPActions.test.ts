import {openID4VPActions} from './openID4VPActions';

jest.mock('xstate', () => ({
  assign: jest.fn(arg => ({type: 'xstate.assign', assignment: arg})),
}));
jest.mock('xstate/lib/actions', () => ({
  send: jest.fn((event, opts) => ({type: 'xstate.send', event, opts})),
  sendParent: jest.fn(event => ({type: 'xstate.sendParent', event})),
}));
jest.mock('../../shared/constants', () => ({
  OVP_ERROR_CODE: {
    DECLINED: 'declined',
    GENERIC: 'generic',
    NO_MATCHING_VCS: 'no_matching_vcs',
  },
  OVP_ERROR_MESSAGES: {
    DECLINED: 'User declined',
    NO_MATCHING_VCS: 'No matching VCs',
  },
  SHOW_FACE_AUTH_CONSENT_SHARE_FLOW: 'faceAuthConsent',
  isIOS: jest.fn(() => true),
}));
jest.mock('../store', () => ({
  StoreEvents: {
    GET: jest.fn(key => ({type: 'GET', key})),
    SET: jest.fn((key, val) => ({type: 'SET', key, val})),
  },
}));

const mockJSONPath = jest.fn(() => []);
const mockToPathArray = jest.fn(p => p.split('.'));
jest.mock('jsonpath-plus', () => ({
  JSONPath: Object.assign((...args: any[]) => mockJSONPath({...args}), {
    toPathArray: (...args: any[]) => mockToPathArray({...args}),
  }),
}));

jest.mock('../../shared/Utils', () => ({
  parseJSON: jest.fn(str => JSON.parse(str || '{}')),
  VCShareFlowType: {
    OPENID4VP: 'openid4vp',
    OPENID4VP_AUTHORIZATION: 'openid4vp_auth',
    MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP:
      'MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP',
  },
}));
jest.mock('../activityLog', () => ({
  ActivityLogEvents: {
    LOG_ACTIVITY: jest.fn(log => ({type: 'LOG_ACTIVITY', log})),
  },
}));
jest.mock('../../components/VPShareActivityLogEvent', () => ({
  VPShareActivityLog: {getLogFromObject: jest.fn(obj => obj)},
}));
jest.mock('../../shared/openID4VP/OpenID4VP', () => ({
  __esModule: true,
  default: {sendErrorToVerifier: jest.fn()},
}));
jest.mock('../../shared/VCFormat', () => ({
  VCFormat: {
    mso_mdoc: 'mso_mdoc',
    vc_sd_jwt: 'vc_sd_jwt',
    dc_sd_jwt: 'dc_sd_jwt',
    ldp_vc: 'ldp_vc',
  },
}));

const mockGetIssuerAuth = jest.fn().mockReturnValue('ES256');
const mockGetMdocAuth = jest.fn().mockReturnValue('ES256');
jest.mock('../../components/VC/common/VCUtils', () => ({
  getIssuerAuthenticationAlgorithmForMdocVC: (...args: any[]) =>
    mockGetIssuerAuth(...args),
  getMdocAuthenticationAlgorithm: (...args: any[]) => mockGetMdocAuth(...args),
}));

describe('openID4VPActions', () => {
  const mockModel = {
    assign: jest.fn(arg => ({type: 'model.assign', assignment: arg})),
  };
  let actions: ReturnType<typeof openID4VPActions>;

  beforeEach(() => {
    jest.clearAllMocks();
    actions = openID4VPActions(mockModel);
  });

  it('should return all expected action definitions', () => {
    const expectedActions = [
      'setPresentationRequest',
      'setAuthenticationResponse',
      'setUrlEncodedAuthorizationRequest',
      'setFlowType',
      'setMatchingVCs',
      'setAuthenticationResponseForPresentationAuthFlow',
      'setSelectedVCs',
      'setUnsignedVPToken',
      'compareAndStoreSelectedVC',
      'setMiniViewShareSelectedVC',
      'setIsShareWithSelfie',
      'setIsOVPViaDeepLink',
      'resetIsOVPViaDeepLink',
      'setShowFaceAuthConsent',
      'storeShowFaceAuthConsent',
      'getFaceAuthConsent',
      'updateShowFaceAuthConsent',
      'forwardToParent',
      'setError',
      'resetError',
      'resetIsShareWithSelfie',
      'incrementOpenID4VPRetryCount',
      'resetOpenID4VPRetryCount',
      'setAuthenticationError',
      'setTrustedVerifiersApiCallError',
      'showTrustConsentModal',
      'dismissTrustModal',
      'setSignVPError',
      'setSendVPShareError',
      'setTrustedVerifiers',
      'updateFaceCaptureBannerStatus',
      'resetFaceCaptureBannerStatus',
      'logActivity',
      'setIsFaceVerificationRetryAttempt',
      'resetIsFaceVerificationRetryAttempt',
      'setIsShowLoadingScreen',
      'resetIsShowLoadingScreen',
    ];
    for (const name of expectedActions) {
      expect(actions).toHaveProperty(name);
    }
  });

  it('model.assign called for setIsShareWithSelfie', () => {
    expect(actions.setIsShareWithSelfie).toBeDefined();
    expect(mockModel.assign).toHaveBeenCalled();
  });

  describe('assignment callbacks', () => {
    it('setPresentationRequest sets presentationRequest from event', () => {
      const fn = actions.setPresentationRequest.assignment.presentationRequest;
      expect(fn({}, {presentationRequest: 'req-data'})).toBe('req-data');
    });

    it('setAuthenticationResponse sets authenticationResponse from event', () => {
      const fn =
        actions.setAuthenticationResponse.assignment.authenticationResponse;
      expect(fn({}, {data: 'resp-data'})).toBe('resp-data');
    });

    it('setUrlEncodedAuthorizationRequest sets from event', () => {
      const fn =
        actions.setUrlEncodedAuthorizationRequest.assignment
          .urlEncodedAuthorizationRequest;
      expect(fn({}, {encodedAuthRequest: 'encoded123'})).toBe('encoded123');
    });

    it('setFlowType sets flowType from event', () => {
      const fn = actions.setFlowType.assignment.flowType;
      expect(fn({}, {flowType: 'openid4vp'})).toBe('openid4vp');
    });

    it('setMiniViewShareSelectedVC sets miniViewSelectedVC', () => {
      const fn =
        actions.setMiniViewShareSelectedVC.assignment.miniViewSelectedVC;
      const vc = {id: 'vc1'};
      expect(fn({}, {selectedVC: vc})).toBe(vc);
    });

    it('setIsShareWithSelfie returns true for MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP', () => {
      const fn = actions.setIsShareWithSelfie.assignment.isShareWithSelfie;
      expect(fn({}, {flowType: 'MINI_VIEW_SHARE_WITH_SELFIE_OPENID4VP'})).toBe(
        true,
      );
    });

    it('setIsOVPViaDeepLink sets from event', () => {
      const fn = actions.setIsOVPViaDeepLink.assignment.isOVPViaDeepLink;
      expect(fn({}, {isOVPViaDeepLink: true})).toBe(true);
    });

    it('resetIsOVPViaDeepLink returns false', () => {
      const fn = actions.resetIsOVPViaDeepLink.assignment.isOVPViaDeepLink;
      expect(fn()).toBe(false);
    });

    it('setShowFaceAuthConsent returns negation of isDoNotAskAgainChecked', () => {
      const fn = actions.setShowFaceAuthConsent.assignment.showFaceAuthConsent;
      expect(fn({}, {isDoNotAskAgainChecked: true})).toBe(false);
      expect(fn({}, {isDoNotAskAgainChecked: false})).toBe(true);
    });

    it('updateShowFaceAuthConsent returns event.response when truthy or null', () => {
      const fn =
        actions.updateShowFaceAuthConsent.assignment.showFaceAuthConsent;
      expect(fn({}, {response: true})).toBe(true);
      expect(fn({}, {response: null})).toBe(true);
      expect(fn({}, {response: false})).toBe(false);
    });

    it('setError returns error message from event', () => {
      const fn = actions.setError.assignment.error;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = fn({}, {data: {message: 'test error'}});
      expect(result).toBe('test error');
      consoleSpy.mockRestore();
    });

    it('resetError returns empty string', () => {
      const fn = actions.resetError.assignment.error;
      expect(fn()).toBe('');
    });

    it('resetIsShareWithSelfie returns false', () => {
      const fn = actions.resetIsShareWithSelfie.assignment.isShareWithSelfie;
      expect(fn()).toBe(false);
    });

    it('incrementOpenID4VPRetryCount increments count', () => {
      const fn =
        actions.incrementOpenID4VPRetryCount.assignment.openID4VPRetryCount;
      expect(fn({openID4VPRetryCount: 2})).toBe(3);
    });

    it('resetOpenID4VPRetryCount returns 0', () => {
      const fn =
        actions.resetOpenID4VPRetryCount.assignment.openID4VPRetryCount;
      expect(fn()).toBe(0);
    });

    it('setAuthenticationError sets error code', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = actions.setAuthenticationError.assignment.error;
      expect(fn({}, {data: {code: 'AUTH_ERR', userInfo: 'info'}})).toBe(
        'AUTH_ERR',
      );
      consoleSpy.mockRestore();
    });

    it('setTrustedVerifiersApiCallError sets error message', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = actions.setTrustedVerifiersApiCallError.assignment.error;
      const result = fn({}, {data: {message: 'server error'}});
      expect(result).toContain('server error');
      consoleSpy.mockRestore();
    });

    it('showTrustConsentModal sets to true', () => {
      expect(
        actions.showTrustConsentModal.assignment.showTrustConsentModal(),
      ).toBe(true);
    });

    it('dismissTrustModal sets to false', () => {
      expect(actions.dismissTrustModal.assignment.showTrustConsentModal()).toBe(
        false,
      );
    });

    it('setSignVPError formats error message', () => {
      const fn = actions.setSignVPError.assignment.error;
      expect(fn({}, {data: {message: 'msg', code: '500'}})).toBe(
        'sign vp-msg-500',
      );
    });

    it('setSendVPShareError formats error message', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = actions.setSendVPShareError.assignment.error;
      expect(fn({}, {data: {message: 'msg', code: '500'}})).toBe(
        'send vp-msg-500',
      );
      consoleSpy.mockRestore();
    });

    it('setTrustedVerifiers extracts verifiers from event data', () => {
      const fn = actions.setTrustedVerifiers.assignment.trustedVerifiers;
      const result = fn({}, {data: {response: {verifiers: ['v1', 'v2']}}});
      expect(result).toEqual(['v1', 'v2']);
    });

    it('updateFaceCaptureBannerStatus returns true', () => {
      const fn =
        actions.updateFaceCaptureBannerStatus.assignment
          .showFaceCaptureSuccessBanner;
      expect(fn()).toBe(true);
    });

    it('setIsFaceVerificationRetryAttempt returns true', () => {
      const fn =
        actions.setIsFaceVerificationRetryAttempt.assignment
          .isFaceVerificationRetryAttempt;
      expect(fn()).toBe(true);
    });

    it('resetIsFaceVerificationRetryAttempt returns false', () => {
      const fn =
        actions.resetIsFaceVerificationRetryAttempt.assignment
          .isFaceVerificationRetryAttempt;
      expect(fn()).toBe(false);
    });

    it('setIsShowLoadingScreen returns true', () => {
      const fn = actions.setIsShowLoadingScreen.assignment.showLoadingScreen;
      expect(fn()).toBe(true);
    });

    it('resetIsShowLoadingScreen returns false', () => {
      const fn = actions.resetIsShowLoadingScreen.assignment.showLoadingScreen;
      expect(fn()).toBe(false);
    });

    it('setUnsignedVPToken parses JSON event data', () => {
      const fn = actions.setUnsignedVPToken.assignment.unsignedVPToken;
      expect(fn({}, {data: '{"key":"value"}'})).toEqual({key: 'value'});
    });

    it('setUnsignedVPToken returns null for invalid JSON', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const fn = actions.setUnsignedVPToken.assignment.unsignedVPToken;
      expect(fn({}, {data: 'not-json!!!'})).toBeNull();
      consoleSpy.mockRestore();
    });

    it('setSelectedVCs sets selectedVCs and selectedDisclosuresByVc', () => {
      const asg = actions.setSelectedVCs.assignment;
      const event = {
        selectedVCs: {id1: ['vc1']},
        selectedDisclosuresByVc: {vc1: ['f1']},
      };
      expect(asg.selectedVCs({}, event)).toEqual({id1: ['vc1']});
      expect(asg.selectedDisclosuresByVc({}, event)).toEqual({vc1: ['f1']});
    });

    it('setAuthenticationResponseForPresentationAuthFlow uses context.presentationRequest', () => {
      const fn =
        actions.setAuthenticationResponseForPresentationAuthFlow.assignment
          .authenticationResponse;
      expect(fn({presentationRequest: 'pres-req'}, {})).toBe('pres-req');
    });
  });
});
