jest.mock('./ControllerProofPurpose', () => {
  return {
    ControllerProofPurpose: class {
      term: string;
      controller: any;
      date: any;
      maxTimestampDelta: number;
      constructor({term, controller, date, maxTimestampDelta}: any = {}) {
        this.term = term;
        this.controller = controller;
        this.date = date;
        this.maxTimestampDelta = maxTimestampDelta;
      }
    },
  };
});

import {PublicKeyProofPurpose} from './PublicKeyProofPurpose';

describe('PublicKeyProofPurpose', () => {
  it('creates instance with term "publicKey"', () => {
    const purpose = new PublicKeyProofPurpose();
    expect(purpose.term).toBe('publicKey');
  });

  it('passes controller to super', () => {
    const ctrl = {id: 'did:example:456'};
    const purpose = new PublicKeyProofPurpose({controller: ctrl});
    expect(purpose.controller).toBe(ctrl);
  });

  it('passes date to super', () => {
    const date = new Date('2024-06-15');
    const purpose = new PublicKeyProofPurpose({date});
    expect(purpose.date).toBe(date);
  });

  it('defaults maxTimestampDelta to Infinity', () => {
    const purpose = new PublicKeyProofPurpose();
    expect(purpose.maxTimestampDelta).toBe(Infinity);
  });

  it('is an instance of ControllerProofPurpose', () => {
    const {ControllerProofPurpose} = require('./ControllerProofPurpose');
    const purpose = new PublicKeyProofPurpose();
    expect(purpose).toBeInstanceOf(ControllerProofPurpose);
  });

  describe('update', () => {
    it('returns the proof unchanged', async () => {
      const purpose = new PublicKeyProofPurpose();
      const proof = {type: 'Ed25519Signature2020', created: '2024-01-01'};
      const result = await purpose.update(proof);
      expect(result).toBe(proof);
      expect(result).toEqual({
        type: 'Ed25519Signature2020',
        created: '2024-01-01',
      });
    });

    it('does not add proofPurpose to proof', async () => {
      const purpose = new PublicKeyProofPurpose();
      const proof = {};
      const result = await purpose.update(proof);
      expect(result.proofPurpose).toBeUndefined();
    });
  });

  describe('match', () => {
    it('returns true when proofPurpose is undefined', async () => {
      const purpose = new PublicKeyProofPurpose();
      const result = await purpose.match({type: 'some-sig'});
      expect(result).toBe(true);
    });

    it('returns true for empty proof object', async () => {
      const purpose = new PublicKeyProofPurpose();
      const result = await purpose.match({});
      expect(result).toBe(true);
    });

    it('returns false when proofPurpose is defined', async () => {
      const purpose = new PublicKeyProofPurpose();
      const result = await purpose.match({proofPurpose: 'assertionMethod'});
      expect(result).toBe(false);
    });

    it('returns false when proofPurpose is null', async () => {
      const purpose = new PublicKeyProofPurpose();
      const result = await purpose.match({proofPurpose: null});
      // null !== undefined, so this should be false
      expect(result).toBe(false);
    });

    it('returns false when proofPurpose is empty string', async () => {
      const purpose = new PublicKeyProofPurpose();
      const result = await purpose.match({proofPurpose: ''});
      // '' !== undefined
      expect(result).toBe(false);
    });
  });
});
