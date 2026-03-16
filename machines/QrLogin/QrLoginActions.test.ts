jest.mock('xstate', () => ({
  assign: jest.fn(arg => ({type: 'xstate.assign', assignment: arg})),
  send: jest.fn((event, opts) => ({type: 'xstate.send', event, opts})),
  sendParent: jest.fn(event => ({type: 'xstate.sendParent', event})),
}));
jest.mock('../../i18n', () => ({
  __esModule: true,
  default: {t: jest.fn(key => key)},
}));
jest.mock('../../shared/Utils', () => ({
  VCShareFlowType: {
    SIMPLE_SHARE: 'simple share',
    MINI_VIEW_SHARE: 'mini view share',
    MINI_VIEW_SHARE_WITH_SELFIE: 'mini view share with selfie',
    MINI_VIEW_QR_LOGIN: 'mini view qr login',
  },
}));
jest.mock('../../shared/VCMetadata', () => ({
  parseMetadatas: jest.fn(arr =>
    arr.map(o => ({...o, getVcKey: () => `VC_${o.id}`})),
  ),
}));
jest.mock('../../shared/constants', () => ({
  SHOW_FACE_AUTH_CONSENT_QR_LOGIN_FLOW: 'showFaceAuthConsentQrLoginFlow',
  MY_VCS_STORE_KEY: 'myVCs',
}));
jest.mock('../../shared/keystore/SecureKeystore', () => ({
  getBindingCertificateConstant: jest.fn(id => `binding_${id}`),
}));
jest.mock('../store', () => ({
  StoreEvents: {
    GET: jest.fn(key => ({type: 'GET', key})),
    SET: jest.fn((key, val) => ({type: 'SET', key, value: val})),
  },
}));

import {QrLoginActions} from './QrLoginActions';

describe('QrLoginActions', () => {
  const mockModel = {
    assign: jest.fn(arg => ({type: 'xstate.assign', assignment: arg})),
  };

  let actions: ReturnType<typeof QrLoginActions>;

  beforeEach(() => {
    jest.clearAllMocks();
    actions = QrLoginActions(mockModel);
  });

  it('should define all expected actions', () => {
    const expectedActions = [
      'setShowFaceAuthConsent',
      'storeShowFaceAuthConsent',
      'forwardToParent',
      'setScanData',
      'resetIsQrLoginViaDeepLink',
      'getFaceAuthConsent',
      'updateShowFaceAuthConsent',
      'loadMyVcs',
      'setMyVcs',
      'loadThumbprint',
      'setThumbprint',
      'resetLinkTransactionId',
      'resetSelectedVoluntaryClaims',
      'setSelectedVc',
      'resetSelectedVc',
      'resetFlowType',
      'setlinkTransactionResponse',
      'expandLinkTransResp',
      'setClaims',
      'SetErrorMessage',
      'setConsentClaims',
      'setLinkedTransactionId',
    ];
    expectedActions.forEach(action => {
      expect(actions[action]).toBeDefined();
    });
  });

  describe('setClaims', () => {
    it('should set isSharing for voluntary claims', () => {
      const context = {
        voluntaryClaims: ['email', 'phone'],
        isSharing: {},
      };
      actions.setClaims(context);
      expect(context.isSharing['email']).toBe(false);
      expect(context.isSharing['phone']).toBe(false);
    });
  });

  // --- model.assign based actions ---

  describe('setShowFaceAuthConsent', () => {
    it('returns true when isDoNotAskAgainChecked is false', () => {
      const fn = actions.setShowFaceAuthConsent.assignment.showFaceAuthConsent;
      expect(fn({}, {isDoNotAskAgainChecked: false})).toBe(true);
    });

    it('returns false when isDoNotAskAgainChecked is true', () => {
      const fn = actions.setShowFaceAuthConsent.assignment.showFaceAuthConsent;
      expect(fn({}, {isDoNotAskAgainChecked: true})).toBe(false);
    });
  });

  describe('setScanData', () => {
    it('merges linkCode, flowType, selectedVc, isQrLoginViaDeepLink into context', () => {
      const fn = actions.setScanData.assignment;
      const ctx = {existing: 'data'};
      const evt = {
        linkCode: 'LC1',
        flowType: 'simple share',
        selectedVc: {id: 'v1'},
        isQrLoginViaDeepLink: true,
      };
      const result = fn(ctx, evt);
      expect(result.linkCode).toBe('LC1');
      expect(result.flowType).toBe('simple share');
      expect(result.selectedVc).toEqual({id: 'v1'});
      expect(result.isQrLoginViaDeepLink).toBe(true);
      expect(result.existing).toBe('data');
    });
  });

  describe('resetIsQrLoginViaDeepLink', () => {
    it('sets to false', () => {
      const val =
        actions.resetIsQrLoginViaDeepLink.assignment.isQrLoginViaDeepLink;
      expect(typeof val === 'function' ? val() : val).toBe(false);
    });
  });

  describe('updateShowFaceAuthConsent', () => {
    it('returns truthy when event response is truthy', () => {
      const fn =
        actions.updateShowFaceAuthConsent.assignment.showFaceAuthConsent;
      expect(fn({}, {response: true})).toBe(true);
    });

    it('returns true when event response is null', () => {
      const fn =
        actions.updateShowFaceAuthConsent.assignment.showFaceAuthConsent;
      expect(fn({}, {response: null})).toBe(true);
    });

    it('returns false when event response is false', () => {
      const fn =
        actions.updateShowFaceAuthConsent.assignment.showFaceAuthConsent;
      expect(fn({}, {response: false})).toBe(false);
    });
  });

  describe('setMyVcs', () => {
    it('calls parseMetadatas with event response', () => {
      const {parseMetadatas} = require('../../shared/VCMetadata');
      const fn = actions.setMyVcs.assignment.myVcs;
      fn({}, {response: [{id: '1'}]});
      expect(parseMetadatas).toHaveBeenCalledWith([{id: '1'}]);
    });

    it('uses empty array when response is falsy', () => {
      const {parseMetadatas} = require('../../shared/VCMetadata');
      parseMetadatas.mockClear();
      const fn = actions.setMyVcs.assignment.myVcs;
      fn({}, {response: null});
      expect(parseMetadatas).toHaveBeenCalledWith([]);
    });
  });

  describe('setThumbprint', () => {
    it('sets thumbprint from event response', () => {
      const fn = actions.setThumbprint.assignment.thumbprint;
      expect(fn({}, {response: 'thumb123'})).toBe('thumb123');
    });

    it('defaults to empty string when no response', () => {
      const fn = actions.setThumbprint.assignment.thumbprint;
      expect(fn({}, {response: null})).toBe('');
    });
  });

  describe('resetLinkTransactionId', () => {
    it('resets to empty string', () => {
      const fn = actions.resetLinkTransactionId.assignment.linkTransactionId;
      expect(fn()).toBe('');
    });
  });

  describe('resetSelectedVoluntaryClaims', () => {
    it('resets to empty array', () => {
      const fn =
        actions.resetSelectedVoluntaryClaims.assignment.selectedVoluntaryClaims;
      expect(fn()).toEqual([]);
    });
  });

  describe('setSelectedVc', () => {
    it('returns spread of event vc', () => {
      const fn = actions.setSelectedVc.assignment.selectedVc;
      const result = fn({}, {vc: {id: 'v1', name: 'VC1'}});
      expect(result).toEqual({id: 'v1', name: 'VC1'});
    });
  });

  describe('resetSelectedVc', () => {
    it('sets to empty object', () => {
      const val = actions.resetSelectedVc.assignment.selectedVc;
      expect(typeof val === 'function' ? val() : val).toEqual({});
    });
  });

  describe('resetFlowType', () => {
    it('sets to SIMPLE_SHARE', () => {
      const val = actions.resetFlowType.assignment.flowType;
      expect(typeof val === 'function' ? val() : val).toBe('simple share');
    });
  });

  describe('setlinkTransactionResponse', () => {
    it('returns event data as linkTransactionResponse', () => {
      const fn =
        actions.setlinkTransactionResponse.assignment.linkTransactionResponse;
      const data = {linkTransactionId: 'lt1', clientName: 'client'};
      expect(fn({}, {data})).toEqual(data);
    });
  });

  describe('expandLinkTransResp', () => {
    it('extracts all fields from linkTransactionResponse', () => {
      const a = actions.expandLinkTransResp.assignment;
      const ctx = {
        linkTransactionResponse: {
          authFactors: ['bio'],
          authorizeScopes: ['s1'],
          clientName: 'client1',
          configs: {k: 'v'},
          essentialClaims: ['claim1'],
          linkTransactionId: 'lt1',
          logoUrl: 'http://logo.png',
          voluntaryClaims: ['email'],
        },
      };
      expect(a.authFactors(ctx)).toEqual(['bio']);
      expect(a.authorizeScopes(ctx)).toEqual(['s1']);
      expect(a.clientName(ctx)).toBe('client1');
      expect(a.configs(ctx)).toEqual({k: 'v'});
      expect(a.essentialClaims(ctx)).toEqual(['claim1']);
      expect(a.linkTransactionId(ctx)).toBe('lt1');
      expect(a.logoUrl(ctx)).toBe('http://logo.png');
      expect(a.voluntaryClaims(ctx)).toEqual(['email']);
    });
  });

  describe('SetErrorMessage', () => {
    it('uses ID_ERRORS_MAP for invalid_link_code', () => {
      const fn = actions.SetErrorMessage.assignment.errorMessage;
      const result = fn({}, {data: {name: 'invalid_link_code'}});
      expect(result).toContain('errors.');
    });

    it('uses genericError for unknown errors', () => {
      const fn = actions.SetErrorMessage.assignment.errorMessage;
      const result = fn({}, {data: {name: 'unknown_error'}});
      expect(result).toContain('errors.');
    });
  });

  describe('setConsentClaims', () => {
    it('adds claim to selectedVoluntaryClaims when enable is false', () => {
      const fn = actions.setConsentClaims.assignment.isSharing;
      const ctx = {isSharing: {email: false}, selectedVoluntaryClaims: []};
      const result = fn(ctx, {claim: 'email', enable: false});
      expect(result.email).toBe(true);
      expect(ctx.selectedVoluntaryClaims).toContain('email');
    });

    it('removes claim from selectedVoluntaryClaims when enable is true', () => {
      const fn = actions.setConsentClaims.assignment.isSharing;
      const ctx = {
        isSharing: {email: true},
        selectedVoluntaryClaims: ['email'],
      };
      const result = fn(ctx, {claim: 'email', enable: true});
      expect(result.email).toBe(false);
      expect(ctx.selectedVoluntaryClaims).not.toContain('email');
    });
  });

  describe('setLinkedTransactionId', () => {
    it('sets linkedTransactionId from event data', () => {
      const fn = actions.setLinkedTransactionId.assignment.linkedTransactionId;
      expect(fn({}, {data: {linkedTransactionId: 'linked-1'}})).toBe(
        'linked-1',
      );
    });
  });

  // --- send-based actions ---

  describe('storeShowFaceAuthConsent', () => {
    it('is defined and is a send action', () => {
      expect(actions.storeShowFaceAuthConsent).toBeDefined();
      expect(actions.storeShowFaceAuthConsent.type).toBe('xstate.send');
    });

    it('opts.to returns context.serviceRefs.store', () => {
      const to = actions.storeShowFaceAuthConsent.opts.to;
      expect(to({serviceRefs: {store: 'store-ref'}})).toBe('store-ref');
    });
  });

  describe('forwardToParent', () => {
    it('is defined and sends DISMISS to parent', () => {
      expect(actions.forwardToParent).toBeDefined();
      expect(actions.forwardToParent.event).toBe('DISMISS');
    });
  });

  describe('getFaceAuthConsent', () => {
    it('is defined', () => {
      expect(actions.getFaceAuthConsent).toBeDefined();
    });
  });

  describe('loadMyVcs', () => {
    it('is defined', () => {
      expect(actions.loadMyVcs).toBeDefined();
    });

    it('opts.to returns context.serviceRefs.store', () => {
      const to = actions.loadMyVcs.opts.to;
      expect(to({serviceRefs: {store: 'store-ref'}})).toBe('store-ref');
    });
  });

  describe('loadThumbprint', () => {
    it('is defined', () => {
      expect(actions.loadThumbprint).toBeDefined();
    });

    it('opts.to returns context.serviceRefs.store', () => {
      const to = actions.loadThumbprint.opts.to;
      expect(to({serviceRefs: {store: 'store-ref'}})).toBe('store-ref');
    });
  });
});
