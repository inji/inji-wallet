/* eslint-disable @typescript-eslint/no-explicit-any */
import {shareImageToAllSupportedApps} from './imageUtils';
import RNShare from 'react-native-share';

jest.mock('react-native-share', () => ({
  open: jest.fn(),
}));

describe('imageUtils', () => {
  describe('shareImageToAllSupportedApps', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return true when sharing is successful', async () => {
      const mockShareOptions = {
        url: 'file://path/to/image.jpg',
        type: 'image/jpeg',
      };

      (RNShare.open as jest.Mock).mockResolvedValue({success: true});

      const result = await shareImageToAllSupportedApps(mockShareOptions);

      expect(result).toBe(true);
      expect(RNShare.open).toHaveBeenCalledWith(mockShareOptions);
    });

    it('should return false when sharing fails', async () => {
      const mockShareOptions = {
        url: 'file://path/to/image.jpg',
        type: 'image/jpeg',
      };

      (RNShare.open as jest.Mock).mockResolvedValue({success: false});

      const result = await shareImageToAllSupportedApps(mockShareOptions);

      expect(result).toBe(false);
    });

    it('should return false when an exception occurs', async () => {
      const mockShareOptions = {
        url: 'file://path/to/image.jpg',
        type: 'image/jpeg',
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (RNShare.open as jest.Mock).mockRejectedValue(new Error('Share failed'));

      const result = await shareImageToAllSupportedApps(mockShareOptions);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Exception while sharing image::',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle different share options', async () => {
      const mockShareOptions = {
        url: 'file://path/to/qr-code.png',
        type: 'image/png',
        title: 'Share QR Code',
      };

      (RNShare.open as jest.Mock).mockResolvedValue({success: true});

      const result = await shareImageToAllSupportedApps(mockShareOptions);

      expect(result).toBe(true);
      expect(RNShare.open).toHaveBeenCalledWith(mockShareOptions);
    });

    it('should handle user dismissing share dialog', async () => {
      const mockShareOptions = {
        url: 'file://path/to/image.jpg',
      };

      (RNShare.open as jest.Mock).mockRejectedValue({
        message: 'User did not share',
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await shareImageToAllSupportedApps(mockShareOptions);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Exception while sharing image::',
        expect.objectContaining({message: 'User did not share'}),
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
