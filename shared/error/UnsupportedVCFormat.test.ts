import {UnsupportedVcFormat} from './UnsupportedVCFormat';

describe('UnsupportedVcFormat', () => {
  it('should create an error instance with the correct format message', () => {
    const format = 'jwt_vc_json';
    const error = new UnsupportedVcFormat(format);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(UnsupportedVcFormat);
    expect(error.message).toBe(format);
  });

  it('should have the correct error name', () => {
    const error = new UnsupportedVcFormat('ldp_vc');

    expect(error.name).toBe('UnsupportedVcFormat');
  });

  it('should maintain the error stack trace', () => {
    const error = new UnsupportedVcFormat('custom_format');

    expect(error.stack).toBeDefined();
  });

  it('should handle empty format string', () => {
    const error = new UnsupportedVcFormat('');

    expect(error.message).toBe('');
    expect(error.name).toBe('UnsupportedVcFormat');
  });

  it('should handle complex format strings', () => {
    const format = 'application/vc+sd-jwt';
    const error = new UnsupportedVcFormat(format);

    expect(error.message).toBe(format);
  });
});
