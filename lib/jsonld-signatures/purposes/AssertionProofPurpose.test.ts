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

import {AssertionProofPurpose} from './AssertionProofPurpose';

describe('AssertionProofPurpose', () => {
  it('creates instance with default term "assertionMethod"', () => {
    const purpose = new AssertionProofPurpose();
    expect(purpose.term).toBe('assertionMethod');
  });

  it('passes custom term through', () => {
    const purpose = new AssertionProofPurpose({term: 'customTerm'});
    expect(purpose.term).toBe('customTerm');
  });

  it('passes controller to super', () => {
    const ctrl = {id: 'did:example:123'};
    const purpose = new AssertionProofPurpose({controller: ctrl});
    expect(purpose.controller).toBe(ctrl);
  });

  it('passes date to super', () => {
    const date = new Date('2024-01-01');
    const purpose = new AssertionProofPurpose({date});
    expect(purpose.date).toBe(date);
  });

  it('passes maxTimestampDelta to super', () => {
    const purpose = new AssertionProofPurpose({maxTimestampDelta: 300});
    expect(purpose.maxTimestampDelta).toBe(300);
  });

  it('defaults maxTimestampDelta to Infinity', () => {
    const purpose = new AssertionProofPurpose();
    expect(purpose.maxTimestampDelta).toBe(Infinity);
  });

  it('is an instance of ControllerProofPurpose', () => {
    const {ControllerProofPurpose} = require('./ControllerProofPurpose');
    const purpose = new AssertionProofPurpose();
    expect(purpose).toBeInstanceOf(ControllerProofPurpose);
  });
});
