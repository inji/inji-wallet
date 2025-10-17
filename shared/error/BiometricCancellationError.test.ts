import {BiometricCancellationError} from './BiometricCancellationError';

describe('BiometricCancellationError', () => {
  it('should create an error instance with the correct message', () => {
    const errorMessage = 'User cancelled biometric authentication';
    const error = new BiometricCancellationError(errorMessage);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BiometricCancellationError);
    expect(error.message).toBe(errorMessage);
  });

  it('should have the correct error name', () => {
    const error = new BiometricCancellationError('Test error');

    expect(error.name).toBe('BiometricCancellationError');
  });

  it('should maintain the error stack trace', () => {
    const error = new BiometricCancellationError('Stack trace test');

    expect(error.stack).toBeDefined();
  });

  it('should handle empty message', () => {
    const error = new BiometricCancellationError('');

    expect(error.message).toBe('');
    expect(error.name).toBe('BiometricCancellationError');
  });
});
