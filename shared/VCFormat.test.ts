import {VCFormat} from './VCFormat';

describe('VCFormat', () => {
  it('should have ldp_vc format', () => {
    expect(VCFormat.ldp_vc).toBe('ldp_vc');
  });

  it('should have mso_mdoc format', () => {
    expect(VCFormat.mso_mdoc).toBe('mso_mdoc');
  });

  it('should have vc_sd_jwt format', () => {
    expect(VCFormat.vc_sd_jwt).toBe('vc+sd-jwt');
  });

  it('should have dc_sd_jwt format', () => {
    expect(VCFormat.dc_sd_jwt).toBe('dc+sd-jwt');
  });

  it('should have exactly 4 formats', () => {
    const formatCount = Object.keys(VCFormat).length;
    expect(formatCount).toBe(4);
  });

  it('should allow access via enum key', () => {
    expect(VCFormat['ldp_vc']).toBe('ldp_vc');
    expect(VCFormat['mso_mdoc']).toBe('mso_mdoc');
    expect(VCFormat['vc_sd_jwt']).toBe('vc+sd-jwt');
    expect(VCFormat['dc_sd_jwt']).toBe('dc+sd-jwt');
  });

  it('should have all unique values', () => {
    const values = Object.values(VCFormat);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});
