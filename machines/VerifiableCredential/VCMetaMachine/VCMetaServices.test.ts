jest.mock('../../../shared/CloudBackupAndRestoreUtils', () => ({
  __esModule: true,
  default: {
    isSignedInAlready: jest.fn(),
  },
}));

import Cloud from '../../../shared/CloudBackupAndRestoreUtils';
import {VCMetaServices} from './VCMetaServices';

describe('VCMetaServices', () => {
  const services = VCMetaServices();

  describe('isUserSignedAlready', () => {
    it('should return the result of Cloud.isSignedInAlready', async () => {
      (Cloud.isSignedInAlready as jest.Mock).mockResolvedValue({
        isSignedIn: true,
      });
      const callback = services.isUserSignedAlready();
      const result = await callback();
      expect(result).toEqual({isSignedIn: true});
      expect(Cloud.isSignedInAlready).toHaveBeenCalled();
    });

    it('should handle signed out state', async () => {
      (Cloud.isSignedInAlready as jest.Mock).mockResolvedValue({
        isSignedIn: false,
      });
      const callback = services.isUserSignedAlready();
      const result = await callback();
      expect(result).toEqual({isSignedIn: false});
    });
  });
});
