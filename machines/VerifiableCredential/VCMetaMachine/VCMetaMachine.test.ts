import {
  VcMetaEvents,
  vcMetaMachine,
  createVcMetaMachine,
} from './VCMetaMachine';

describe('VCMetaMachine', () => {
  it('vcMetaMachine should be a valid state machine', () => {
    expect(vcMetaMachine).toBeDefined();
    expect(vcMetaMachine.id).toBeDefined();
  });

  it('createVcMetaMachine should be a function', () => {
    expect(typeof createVcMetaMachine).toBe('function');
  });
});
