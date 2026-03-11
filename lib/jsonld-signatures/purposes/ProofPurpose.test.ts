import {ProofPurpose} from './ProofPurpose';

describe('ProofPurpose', () => {
  describe('constructor', () => {
    it('creates instance with required term', () => {
      const pp = new ProofPurpose({term: 'assertionMethod'});
      expect(pp.term).toBe('assertionMethod');
      expect(pp.maxTimestampDelta).toBe(Infinity);
    });

    it('throws if term is undefined', () => {
      expect(() => new ProofPurpose({})).toThrow('"term" is required.');
    });

    it('throws if no arguments provided', () => {
      expect(() => new ProofPurpose()).toThrow('"term" is required.');
    });

    it('sets date when provided as string', () => {
      const pp = new ProofPurpose({term: 'test', date: '2024-01-01'});
      expect(pp.date).toBeInstanceOf(Date);
    });

    it('sets date when provided as Date object', () => {
      const d = new Date('2024-06-15');
      const pp = new ProofPurpose({term: 'test', date: d});
      expect(pp.date.getTime()).toBe(d.getTime());
    });

    it('throws if date is invalid', () => {
      expect(
        () => new ProofPurpose({term: 'test', date: 'not-a-date'}),
      ).toThrow('is not a valid date');
    });

    it('sets maxTimestampDelta', () => {
      const pp = new ProofPurpose({
        term: 'test',
        maxTimestampDelta: 300,
      });
      expect(pp.maxTimestampDelta).toBe(300);
    });

    it('throws if maxTimestampDelta is not a number', () => {
      expect(
        () => new ProofPurpose({term: 'test', maxTimestampDelta: 'invalid'}),
      ).toThrow('"maxTimestampDelta" must be a number.');
    });
  });

  describe('validate', () => {
    it('returns valid:true when no timestamp check needed (Infinity)', async () => {
      const pp = new ProofPurpose({term: 'test'});
      const result = await pp.validate({created: new Date().toISOString()});
      expect(result.valid).toBe(true);
    });

    it('returns valid:true when proof created is within delta', async () => {
      const now = new Date();
      const pp = new ProofPurpose({
        term: 'test',
        date: now,
        maxTimestampDelta: 60,
      });
      const result = await pp.validate({created: now.toISOString()});
      expect(result.valid).toBe(true);
    });

    it('returns valid:false when proof created is out of range', async () => {
      const pastDate = new Date('2020-01-01');
      const pp = new ProofPurpose({
        term: 'test',
        date: new Date(),
        maxTimestampDelta: 60,
      });
      const result = await pp.validate({created: pastDate.toISOString()});
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('out of range');
    });

    it('returns valid:false when created is invalid date', async () => {
      const pp = new ProofPurpose({
        term: 'test',
        date: new Date(),
        maxTimestampDelta: 10,
      });
      const result = await pp.validate({created: 'not-a-date'});
      expect(result.valid).toBe(false);
    });
  });

  describe('update', () => {
    it('adds proofPurpose to proof', async () => {
      const pp = new ProofPurpose({term: 'assertionMethod'});
      const proof = {type: 'Ed25519Signature2020'};
      const result = await pp.update(proof);
      expect(result.proofPurpose).toBe('assertionMethod');
    });

    it('returns the same proof object', async () => {
      const pp = new ProofPurpose({term: 'test'});
      const proof = {existing: 'data'};
      const result = await pp.update(proof);
      expect(result).toBe(proof);
    });
  });

  describe('match', () => {
    it('returns true when proofPurpose matches term', async () => {
      const pp = new ProofPurpose({term: 'assertionMethod'});
      const result = await pp.match({proofPurpose: 'assertionMethod'});
      expect(result).toBe(true);
    });

    it('returns false when proofPurpose does not match', async () => {
      const pp = new ProofPurpose({term: 'assertionMethod'});
      const result = await pp.match({proofPurpose: 'authentication'});
      expect(result).toBe(false);
    });

    it('returns false when proofPurpose is undefined', async () => {
      const pp = new ProofPurpose({term: 'assertionMethod'});
      const result = await pp.match({});
      expect(result).toBe(false);
    });
  });
});
