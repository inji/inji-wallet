import React from 'react';

jest.mock('../../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const mockSend = jest.fn();
const mockActivitySend = jest.fn();

jest.mock('@xstate/react', () => ({
  useInterpret: () => ({send: mockSend, getSnapshot: () => ({})}),
  useSelector: jest.fn().mockReturnValue(null),
}));

jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemMachine',
  () => ({
    createVCItemMachine: jest.fn(() => ({})),
    VCItemEvents: {
      DISMISS: jest.fn(() => ({type: 'DISMISS'})),
      KEBAB_POPUP: jest.fn(() => ({type: 'KEBAB_POPUP'})),
      UPDATE_VC_METADATA: jest.fn((m: any) => ({
        type: 'UPDATE_VC_METADATA',
        data: m,
      })),
    },
  }),
);

jest.mock(
  '../../machines/VerifiableCredential/VCItemMachine/VCItemSelectors',
  () => ({
    selectContext: jest.fn(),
    selectGeneratedOn: jest.fn(),
    selectKebabPopUp: jest.fn(),
    selectWalletBindingResponse: jest.fn(),
    selectVerifiableCredentialData: jest.fn(),
    selectCredential: jest.fn(),
    isReverifyingVc: jest.fn(),
  }),
);

jest.mock('../../screens/Home/MyVcsTabMachine', () => ({
  selectIsSavingFailedInIdle: jest.fn(),
}));

jest.mock('../../machines/auth', () => ({
  selectIsTourGuide: jest.fn(),
}));

jest.mock('../../shared/VCMetadata', () => ({VCMetadata: jest.fn()}));
jest.mock('../../machines/activityLog', () => ({
  ActivityLogEvents: {
    STORE_INCOMING_VC_WELLKNOWN_CONFIG: jest.fn(() => ({type: 'STORE'})),
  },
}));

const ReactModule = require('react');
jest.spyOn(ReactModule, 'useContext').mockReturnValue({
  appService: {
    getSnapshot: () => ({context: {serviceRefs: {}}}),
    children: {get: () => ({send: mockActivitySend})},
    send: jest.fn(),
  },
});
jest.spyOn(ReactModule, 'useRef').mockReturnValue({current: {}});

import {useVcItemController} from './VCItemController';

describe('useVcItemController', () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockActivitySend.mockClear();
    jest.spyOn(ReactModule, 'useContext').mockReturnValue({
      appService: {
        getSnapshot: () => ({context: {serviceRefs: {}}}),
        children: {get: () => ({send: mockActivitySend})},
        send: jest.fn(),
      },
    });
    jest.spyOn(ReactModule, 'useRef').mockReturnValue({current: {}});
  });

  it('should return expected properties', () => {
    const result = useVcItemController({} as any);
    expect(result).toHaveProperty('VCItemService');
    expect(result).toHaveProperty('context');
    expect(result).toHaveProperty('credential');
    expect(result).toHaveProperty('isKebabPopUp');
    expect(result).toHaveProperty('generatedOn');
    expect(result).toHaveProperty('storeErrorTranslationPath');
  });

  it('DISMISS should send DISMISS event', () => {
    const result = useVcItemController({} as any);
    result.DISMISS();
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({type: 'DISMISS'}),
    );
  });

  it('KEBAB_POPUP should send KEBAB_POPUP event', () => {
    const result = useVcItemController({} as any);
    result.KEBAB_POPUP();
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({type: 'KEBAB_POPUP'}),
    );
  });

  it('UPDATE_VC_METADATA should send with metadata', () => {
    const result = useVcItemController({} as any);
    result.UPDATE_VC_METADATA({id: 'test'});
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({type: 'UPDATE_VC_METADATA'}),
    );
  });

  it('storeErrorTranslationPath should be correct', () => {
    const result = useVcItemController({} as any);
    expect(result.storeErrorTranslationPath).toBe('errors.savingFailed');
  });

  it('STORE_INCOMING_VC_WELLKNOWN_CONFIG should send to activity service', () => {
    const result = useVcItemController({} as any);
    result.STORE_INCOMING_VC_WELLKNOWN_CONFIG('test-issuer', {display: []});
    expect(mockActivitySend).toHaveBeenCalledWith(
      expect.objectContaining({type: 'STORE'}),
    );
  });
});
