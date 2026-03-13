import {VCMetaGuards} from './VCMetaGuards';

describe('VCMetaGuards', () => {
  const guards = VCMetaGuards();

  describe('isSignedIn', () => {
    it('should return true when isSignedIn is true', () => {
      const event = {data: {isSignedIn: true}};
      expect(guards.isSignedIn({}, event)).toBe(true);
    });

    it('should return false when isSignedIn is false', () => {
      const event = {data: {isSignedIn: false}};
      expect(guards.isSignedIn({}, event)).toBe(false);
    });
  });

  describe('isAnyVcTampered', () => {
    it('should return true when tamperedVcs has entries', () => {
      const context = {tamperedVcs: ['vc1', 'vc2']};
      expect(guards.isAnyVcTampered(context)).toBe(true);
    });

    it('should return false when tamperedVcs is empty', () => {
      const context = {tamperedVcs: []};
      expect(guards.isAnyVcTampered(context)).toBe(false);
    });
  });
});
