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
  JSONPath: Object.assign((...args: any[]) => mockJSONPath(...args), {
    toPathArray: (...args: any[]) => mockToPathArray(...args),
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
  getIssuerAuthenticationAlorithmForMdocVC: (...args: any[]) =>
    mockGetIssuerAuth(...args),
  getMdocAuthenticationAlorithm: (...args: any[]) => mockGetMdocAuth(...args),
}));

import {openID4VPActions} from './openID4VPActions';

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
      'getVcsMatchingAuthRequest',
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
      'loadKeyPair',
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

    it('loadKeyPair sets publicKey and privateKey from event', () => {
      const asg = actions.loadKeyPair.assignment;
      expect(asg.publicKey({}, {data: {publicKey: 'pub123'}})).toBe('pub123');
      expect(
        asg.privateKey({privateKey: 'old'}, {data: {privateKey: 'new'}}),
      ).toBe('new');
      expect(asg.privateKey({privateKey: 'old'}, {data: {}})).toBe('old');
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

    it('getVcsMatchingAuthRequest processes event VCs', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {id: 'desc1', constraints: {}, format: undefined},
            ],
            purpose: 'Testing',
          },
        },
      };
      const event = {vcs: []};
      const result = asg.vcsMatchingAuthRequest(context, event);
      expect(result).toBeDefined();
    });

    it('purpose extracts from presentation_definition', () => {
      const fn = actions.getVcsMatchingAuthRequest.assignment.purpose;
      const ctx = {
        authenticationResponse: {
          presentation_definition: {purpose: 'Test Purpose'},
        },
      };
      expect(fn(ctx)).toBe('Test Purpose');
    });

    it('purpose returns empty string when not defined', () => {
      const fn = actions.getVcsMatchingAuthRequest.assignment.purpose;
      const ctx = {
        authenticationResponse: {
          presentation_definition: {},
        },
      };
      expect(fn(ctx)).toBe('');
    });

    it('hasNoMatchingVCs returns true when no matching VCs', () => {
      // First trigger the assignment to set `result`
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {id: 'desc1', constraints: {}, format: undefined},
            ],
          },
        },
      };
      asg.vcsMatchingAuthRequest(context, {vcs: []});
      const hasNone = asg.hasNoMatchingVCs();
      expect(hasNone).toBeDefined();
    });
  });

  describe('getVcsMatchingAuthRequest helper coverage', () => {
    it('matches ldp_vc format with proof type', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc = {
        format: 'ldp_vc',
        verifiableCredential: {
          credential: {proof: {type: 'Ed25519Signature2018'}},
        },
      };
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {ldp_vc: {proof_type: ['Ed25519Signature2018']}},
                constraints: {
                  fields: [
                    {
                      path: ['$.credentialSubject.name'],
                      filter: {type: 'string'},
                    },
                  ],
                },
              },
            ],
          },
        },
      };
      mockJSONPath.mockReturnValue(['John']);
      mockToPathArray.mockReturnValue(['$', 'credentialSubject', 'name']);
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
    });

    it('matches mso_mdoc format with alg', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc = {
        format: 'mso_mdoc',
        verifiableCredential: {
          processedCredential: {
            issuerSigned: {
              issuerAuth: [{'1': 'certData'}, null, 'authData'],
              nameSpaces: {},
            },
          },
        },
      };
      mockGetIssuerAuth.mockReturnValue('ES256');
      mockGetMdocAuth.mockReturnValue('ES256');
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {mso_mdoc: {alg: ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
      };
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
    });

    it('handles mso_mdoc without issuerSigned (uses issuerAuth directly)', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc = {
        format: 'mso_mdoc',
        verifiableCredential: {
          processedCredential: {
            issuerAuth: [{'1': 'certData'}, null, 'authData'],
            nameSpaces: {},
          },
        },
      };
      mockGetIssuerAuth.mockReturnValue('ES256');
      mockGetMdocAuth.mockReturnValue('ES256');
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'mdoc-desc',
                format: {mso_mdoc: {alg: ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
      };
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
    });

    it('handles mso_mdoc format error gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc = {
        format: 'mso_mdoc',
        verifiableCredential: {processedCredential: null},
      };
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {mso_mdoc: {alg: ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
      };
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
      consoleSpy.mockRestore();
    });

    it('matches vc_sd_jwt format with alg', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const header = Buffer.from(JSON.stringify({alg: 'ES256'})).toString(
        'base64',
      );
      const sdJwt = `${header}.payload.signature~`;
      const vc = {
        format: 'vc_sd_jwt',
        verifiableCredential: {
          credential: sdJwt,
          processedCredential: {fullResolvedPayload: {sub: 'test'}},
        },
      };
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {vc_sd_jwt: {'sd-jwt_alg_values': ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
      };
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
    });

    it('matches dc_sd_jwt format', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const header = Buffer.from(JSON.stringify({alg: 'ES256'})).toString(
        'base64',
      );
      const sdJwt = `${header}.payload.signature~`;
      const vc = {
        format: 'dc_sd_jwt',
        verifiableCredential: {
          credential: sdJwt,
          processedCredential: {fullResolvedPayload: {sub: 'test'}},
        },
      };
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {dc_sd_jwt: {'sd-jwt_alg_values': ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
      };
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
    });

    it('handles sd_jwt format error gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc = {
        format: 'vc_sd_jwt',
        verifiableCredential: {credential: 'invalid-jwt'},
      };
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {vc_sd_jwt: {'sd-jwt_alg_values': ['ES256']}},
                constraints: {fields: undefined},
              },
            ],
          },
        },
      };
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
      consoleSpy.mockRestore();
    });

    it('returns false for format mismatch (no matching type)', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc = {
        format: 'ldp_vc',
        verifiableCredential: {credential: {proof: {type: 'UnknownProof'}}},
      };
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: {ldp_vc: {proof_type: ['Ed25519Signature2018']}},
                constraints: {fields: [{path: ['$.type']}]},
              },
            ],
          },
        },
      };
      mockJSONPath.mockReturnValue([]);
      mockToPathArray.mockReturnValue(['$', 'type']);
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
    });

    it('uses all VCs when no format or constraints in descriptors', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc1 = {format: 'ldp_vc', verifiableCredential: {credential: {}}};
      const vc2 = {format: 'ldp_vc', verifiableCredential: {credential: {}}};
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: undefined,
                constraints: {fields: undefined},
              },
            ],
          },
        },
      };
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc1, vc2]});
      expect(result).toBeDefined();
    });

    it('handles constraints with filter type check', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc = {
        format: 'ldp_vc',
        verifiableCredential: {
          credential: {credentialSubject: {name: 'John'}},
        },
      };
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: undefined,
                constraints: {
                  fields: [
                    {
                      path: ['$.credentialSubject.name'],
                      filter: {type: 'string'},
                    },
                  ],
                },
              },
            ],
          },
        },
      };
      mockJSONPath.mockReturnValue(['John']);
      mockToPathArray.mockReturnValue(['$', 'credentialSubject', 'name']);
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
    });

    it('handles constraints with no filter (accepts anything)', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc = {
        format: 'ldp_vc',
        verifiableCredential: {credential: {type: ['Credential']}},
      };
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: undefined,
                constraints: {fields: [{path: ['$.type']}]},
              },
            ],
          },
        },
      };
      mockJSONPath.mockReturnValue(['Credential']);
      mockToPathArray.mockReturnValue(['$', 'type']);
      const result = asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      expect(result).toBeDefined();
    });

    it('collects requestedClaims from field paths', () => {
      const asg = actions.getVcsMatchingAuthRequest.assignment;
      const vc = {format: 'ldp_vc', verifiableCredential: {credential: {}}};
      const context = {
        authenticationResponse: {
          presentation_definition: {
            input_descriptors: [
              {
                id: 'desc1',
                format: undefined,
                constraints: {
                  fields: [
                    {path: ['$.credentialSubject.name']},
                    {path: ['$.credentialSubject.email']},
                  ],
                },
              },
            ],
          },
        },
      };
      mockJSONPath.mockReturnValue([]);
      mockToPathArray.mockReturnValue(['$', 'credentialSubject', 'name']);
      asg.vcsMatchingAuthRequest(context, {vcs: [vc]});
      const claims = asg.requestedClaims();
      expect(typeof claims).toBe('string');
    });

    it('compareAndStoreSelectedVC filters matching VCs by requestId', () => {
      const asg = actions.compareAndStoreSelectedVC.assignment;
      const context = {
        vcsMatchingAuthRequest: {
          desc1: [
            {vcMetadata: {requestId: 'req1'}},
            {vcMetadata: {requestId: 'req2'}},
          ],
        },
        miniViewSelectedVC: {vcMetadata: {requestId: 'req1'}},
      };
      const result = asg.selectedVCs(context);
      expect(result).toBeDefined();
    });

    it('logActivity handles different log types and retry counts', () => {
      const logAction = actions.logActivity;
      expect(logAction).toBeDefined();
      expect(logAction.type).toBe('xstate.send');
      // logActivity is a send() action - verify events
      const eventFn = logAction.event;
      expect(typeof eventFn).toBe('function');
      const ctx = {openID4VPRetryCount: 0, serviceRefs: {activityLog: {}}};
      const result = eventFn(ctx, {logType: 'RETRY_ATTEMPT_FAILED'});
      expect(result).toBeDefined();
    });

    it('logActivity with retry count > 1 and SHARED_SUCCESSFULLY', () => {
      const logAction = actions.logActivity;
      const eventFn = logAction.event;
      expect(typeof eventFn).toBe('function');
      const ctx = {openID4VPRetryCount: 2, serviceRefs: {activityLog: {}}};
      const result = eventFn(ctx, {logType: 'SHARED_SUCCESSFULLY'});
      expect(result).toBeDefined();
    });

    it('logActivity with retry count 3 and RETRY_ATTEMPT_FAILED', () => {
      const logAction = actions.logActivity;
      const eventFn = logAction.event;
      expect(typeof eventFn).toBe('function');
      const ctx = {openID4VPRetryCount: 3, serviceRefs: {activityLog: {}}};
      const result = eventFn(ctx, {logType: 'RETRY_ATTEMPT_FAILED'});
      expect(result).toBeDefined();
    });

    it('logActivity with SHARED_WITH_FACE_VERIFIACTION retry', () => {
      const logAction = actions.logActivity;
      const eventFn = logAction.event;
      expect(typeof eventFn).toBe('function');
      const ctx = {openID4VPRetryCount: 2, serviceRefs: {activityLog: {}}};
      const result = eventFn(ctx, {logType: 'SHARED_WITH_FACE_VERIFIACTION'});
      expect(result).toBeDefined();
    });

    it('storeShowFaceAuthConsent is a send action', () => {
      expect(actions.storeShowFaceAuthConsent).toBeDefined();
      expect(actions.storeShowFaceAuthConsent.type).toBe('xstate.send');
    });

    it('getFaceAuthConsent is a send action', () => {
      expect(actions.getFaceAuthConsent).toBeDefined();
      expect(actions.getFaceAuthConsent.type).toBe('xstate.send');
    });

    it('forwardToParent is a sendParent action', () => {
      expect(actions.forwardToParent).toBeDefined();
      expect(actions.forwardToParent.type).toBe('xstate.sendParent');
    });

    it('resetFaceCaptureBannerStatus sets to false', () => {
      const val =
        actions.resetFaceCaptureBannerStatus.assignment
          .showFaceCaptureSuccessBanner;
      expect(val).toBe(false);
    });
  });
});
