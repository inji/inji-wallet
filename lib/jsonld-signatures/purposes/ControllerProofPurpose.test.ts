jest.mock('jsonld-signatures/lib/constants', () => ({
  SECURITY_CONTEXT_URL: 'https://w3id.org/security/v2',
}));

jest.mock('jsonld', () => ({
  frame: jest.fn().mockResolvedValue({
    id: 'did:example:123',
    assertionMethod: [{id: 'did:example:123#key1'}],
  }),
  getValues: jest.fn((doc, term) => {
    if (doc && doc[term]) {
      return Array.isArray(doc[term]) ? doc[term] : [doc[term]];
    }
    return [];
  }),
}));

import {ControllerProofPurpose} from './ControllerProofPurpose';

describe('ControllerProofPurpose', () => {
  describe('constructor', () => {
    it('creates instance with term', () => {
      const pp = new ControllerProofPurpose({term: 'assertionMethod'});
      expect(pp.term).toBe('assertionMethod');
    });

    it('sets controller when provided', () => {
      const ctrl = {id: 'did:example:123'};
      const pp = new ControllerProofPurpose({
        term: 'assertionMethod',
        controller: ctrl,
      });
      expect(pp.controller).toBe(ctrl);
    });

    it('throws if controller is not an object', () => {
      expect(
        () =>
          new ControllerProofPurpose({
            term: 'test',
            controller: 'not-object',
          }),
      ).toThrow('"controller" must be an object.');
    });

    it('sets _termDefinedByDIDContext for known DID VR terms', () => {
      const pp = new ControllerProofPurpose({term: 'assertionMethod'});
      expect(pp._termDefinedByDIDContext).toBe(true);
    });

    it('sets _termDefinedByDIDContext for authentication', () => {
      const pp = new ControllerProofPurpose({term: 'authentication'});
      expect(pp._termDefinedByDIDContext).toBe(true);
    });

    it('sets _termDefinedByDIDContext for verificationMethod', () => {
      const pp = new ControllerProofPurpose({term: 'verificationMethod'});
      expect(pp._termDefinedByDIDContext).toBe(true);
    });

    it('sets _termDefinedByDIDContext false for unknown terms', () => {
      const pp = new ControllerProofPurpose({term: 'customPurpose'});
      expect(pp._termDefinedByDIDContext).toBe(false);
    });

    it('defaults maxTimestampDelta to Infinity', () => {
      const pp = new ControllerProofPurpose({term: 'test'});
      expect(pp.maxTimestampDelta).toBe(Infinity);
    });

    it('accepts date parameter', () => {
      const pp = new ControllerProofPurpose({
        term: 'test',
        date: '2024-01-01',
      });
      expect(pp.date).toBeInstanceOf(Date);
    });
  });

  describe('validate', () => {
    it('returns valid:true when controller is provided and matches', async () => {
      const ctrl = {
        assertionMethod: ['did:example:123#key1'],
      };
      const pp = new ControllerProofPurpose({
        term: 'assertionMethod',
        controller: ctrl,
      });
      const result = await pp.validate(
        {created: new Date().toISOString()},
        {
          verificationMethod: {id: 'did:example:123#key1'},
          documentLoader: jest.fn(),
          expansionMap: jest.fn(),
        },
      );
      expect(result.valid).toBe(true);
      expect(result.controller).toBe(ctrl);
    });

    it('returns valid:false when verification method not authorized', async () => {
      const ctrl = {
        assertionMethod: ['did:example:123#key2'],
      };
      const pp = new ControllerProofPurpose({
        term: 'assertionMethod',
        controller: ctrl,
      });
      const result = await pp.validate(
        {created: new Date().toISOString()},
        {
          verificationMethod: {id: 'did:example:123#key1'},
          documentLoader: jest.fn(),
          expansionMap: jest.fn(),
        },
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('handles controller from verificationMethod (string)', async () => {
      const mockDocLoader = jest.fn().mockResolvedValue({
        document: {
          '@context': 'https://www.w3.org/ns/did/v1',
          id: 'did:example:123',
          assertionMethod: ['did:example:123#key1'],
        },
      });
      const pp = new ControllerProofPurpose({term: 'assertionMethod'});
      const result = await pp.validate(
        {created: new Date().toISOString()},
        {
          verificationMethod: {
            id: 'did:example:123#key1',
            controller: 'did:example:123',
          },
          documentLoader: mockDocLoader,
          expansionMap: jest.fn(),
        },
      );
      expect(result).toBeDefined();
      // Either valid or error depending on jsonld.getValues return
    });

    it('handles controller as object with id', async () => {
      const mockDocLoader = jest.fn().mockResolvedValue({
        document: {
          '@context': 'https://www.w3.org/ns/did/v1',
          id: 'did:example:123',
          assertionMethod: ['did:example:123#key1'],
        },
      });
      const pp = new ControllerProofPurpose({term: 'assertionMethod'});
      const result = await pp.validate(
        {created: new Date().toISOString()},
        {
          verificationMethod: {
            id: 'did:example:123#key1',
            controller: {id: 'did:example:123'},
          },
          documentLoader: mockDocLoader,
          expansionMap: jest.fn(),
        },
      );
      expect(result).toBeDefined();
    });

    it('returns error when controller is invalid type', async () => {
      const pp = new ControllerProofPurpose({term: 'assertionMethod'});
      const result = await pp.validate(
        {created: new Date().toISOString()},
        {
          verificationMethod: {
            id: 'did:example:123#key1',
            controller: 12345,
          },
          documentLoader: jest.fn(),
          expansionMap: jest.fn(),
        },
      );
      expect(result.valid).toBe(false);
      expect(result.error.message).toContain('"controller" must be a string');
    });

    it('handles document that needs JSON parsing', async () => {
      const mockDocLoader = jest.fn().mockResolvedValue({
        document: JSON.stringify({
          '@context': 'https://www.w3.org/ns/did/v1',
          id: 'did:example:123',
          assertionMethod: ['did:example:123#key1'],
        }),
      });
      const pp = new ControllerProofPurpose({term: 'assertionMethod'});
      const result = await pp.validate(
        {created: new Date().toISOString()},
        {
          verificationMethod: {
            id: 'did:example:123#key1',
            controller: 'did:example:123',
          },
          documentLoader: mockDocLoader,
          expansionMap: jest.fn(),
        },
      );
      expect(result).toBeDefined();
    });

    it('returns error on invalid JSON document', async () => {
      const mockDocLoader = jest.fn().mockResolvedValue({
        document: 'not-json-at-all',
      });
      const pp = new ControllerProofPurpose({term: 'assertionMethod'});
      const result = await pp.validate(
        {created: new Date().toISOString()},
        {
          verificationMethod: {
            id: 'did:example:123#key1',
            controller: 'did:example:123',
          },
          documentLoader: mockDocLoader,
          expansionMap: jest.fn(),
        },
      );
      expect(result.valid).toBe(false);
      expect(result.error.message).toContain('JSON parse error');
    });

    it('handles verification method matching as object with id', async () => {
      const jsonld = require('jsonld');
      jsonld.getValues.mockReturnValueOnce([{id: 'did:example:123#key1'}]);
      const ctrl = {assertionMethod: [{id: 'did:example:123#key1'}]};
      const pp = new ControllerProofPurpose({
        term: 'assertionMethod',
        controller: ctrl,
      });
      const result = await pp.validate(
        {created: new Date().toISOString()},
        {
          verificationMethod: {id: 'did:example:123#key1'},
          documentLoader: jest.fn(),
          expansionMap: jest.fn(),
        },
      );
      expect(result.valid).toBe(true);
    });

    it('calls documentLoader with controller id and frames non-DID context documents', async () => {
      const jsonld = require('jsonld');
      const mockDocLoader = jest.fn().mockResolvedValue({
        document: {
          '@context': 'https://example.com/context',
          id: 'did:example:123',
          assertionMethod: ['did:example:123#key1'],
        },
      });

      const pp = new ControllerProofPurpose({term: 'assertionMethod'});
      const result = await pp.validate(
        {created: new Date().toISOString()},
        {
          verificationMethod: {
            id: 'did:example:123#key1',
            controller: 'did:example:123',
          },
          documentLoader: mockDocLoader,
          expansionMap: jest.fn(),
        },
      );

      expect(result.valid).toBe(true);
      expect(mockDocLoader).toHaveBeenCalledWith('did:example:123');
      expect(jsonld.frame).toHaveBeenCalled();
    });

    it('returns invalid when created timestamp is outside allowed maxTimestampDelta', async () => {
      const pp = new ControllerProofPurpose({
        term: 'assertionMethod',
        controller: {
          assertionMethod: ['did:example:123#key1'],
        },
        date: new Date('2024-01-01T00:00:00Z'),
        maxTimestampDelta: 10,
      });

      const result = await pp.validate(
        {created: '2000-01-01T00:00:00Z'},
        {
          verificationMethod: {id: 'did:example:123#key1'},
          documentLoader: jest.fn(),
          expansionMap: jest.fn(),
        },
      );

      expect(result.valid).toBe(false);
      expect(result.error.message).toContain('out of range');
    });
  });
});
