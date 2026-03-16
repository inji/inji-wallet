import {
  BOTTOM_TAB_ROUTES,
  SCAN_ROUTES,
  REQUEST_ROUTES,
  SETTINGS_ROUTES,
  AUTH_ROUTES,
} from './routesConstants';

describe('routesConstants', () => {
  describe('BOTTOM_TAB_ROUTES', () => {
    it('should have home route', () => {
      expect(BOTTOM_TAB_ROUTES.home).toBe('home');
    });

    it('should have share route', () => {
      expect(BOTTOM_TAB_ROUTES.share).toBe('share');
    });

    it('should have history route', () => {
      expect(BOTTOM_TAB_ROUTES.history).toBe('history');
    });

    it('should have settings route', () => {
      expect(BOTTOM_TAB_ROUTES.settings).toBe('settings');
    });
  });

  describe('SCAN_ROUTES', () => {
    it('should have ScanScreen route', () => {
      expect(SCAN_ROUTES.ScanScreen).toBe('ScanScreen');
    });

    it('should have SendVcScreen route', () => {
      expect(SCAN_ROUTES.SendVcScreen).toBe('SendVcScreen');
    });

    it('should have SendVPScreen route', () => {
      expect(SCAN_ROUTES.SendVPScreen).toBe('SendVPScreen');
    });
  });

  describe('REQUEST_ROUTES', () => {
    it('should have Request route', () => {
      expect(REQUEST_ROUTES.Request).toBe('Request');
    });

    it('should have RequestScreen route', () => {
      expect(REQUEST_ROUTES.RequestScreen).toBe('RequestScreen');
    });

    it('should have ReceiveVcScreen route', () => {
      expect(REQUEST_ROUTES.ReceiveVcScreen).toBe('ReceiveVcScreen');
    });
  });

  describe('SETTINGS_ROUTES', () => {
    it('should have KeyManagement route', () => {
      expect(SETTINGS_ROUTES.KeyManagement).toBe('KeyManagement');
    });
  });

  describe('AUTH_ROUTES', () => {
    it('should have AuthView route', () => {
      expect(AUTH_ROUTES.AuthView).toBe('AuthView');
    });
  });
});
