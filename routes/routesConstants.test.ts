import {
  BOTTOM_TAB_ROUTES,
  SCAN_ROUTES,
  REQUEST_ROUTES,
  SETTINGS_ROUTES,
  AUTH_ROUTES,
} from './routesConstants';

describe('routesConstants', () => {
  describe('BOTTOM_TAB_ROUTES', () => {
    it('should be defined', () => {
      expect(BOTTOM_TAB_ROUTES).toBeDefined();
    });

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

    it('should have exactly 4 routes', () => {
      expect(Object.keys(BOTTOM_TAB_ROUTES)).toHaveLength(4);
    });
  });

  describe('SCAN_ROUTES', () => {
    it('should be defined', () => {
      expect(SCAN_ROUTES).toBeDefined();
    });

    it('should have ScanScreen route', () => {
      expect(SCAN_ROUTES.ScanScreen).toBe('ScanScreen');
    });

    it('should have SendVcScreen route', () => {
      expect(SCAN_ROUTES.SendVcScreen).toBe('SendVcScreen');
    });

    it('should have SendVPScreen route', () => {
      expect(SCAN_ROUTES.SendVPScreen).toBe('SendVPScreen');
    });

    it('should have exactly 3 routes', () => {
      expect(Object.keys(SCAN_ROUTES)).toHaveLength(3);
    });
  });

  describe('REQUEST_ROUTES', () => {
    it('should be defined', () => {
      expect(REQUEST_ROUTES).toBeDefined();
    });

    it('should have Request route', () => {
      expect(REQUEST_ROUTES.Request).toBe('Request');
    });

    it('should have RequestScreen route', () => {
      expect(REQUEST_ROUTES.RequestScreen).toBe('RequestScreen');
    });

    it('should have ReceiveVcScreen route', () => {
      expect(REQUEST_ROUTES.ReceiveVcScreen).toBe('ReceiveVcScreen');
    });

    it('should have exactly 3 routes', () => {
      expect(Object.keys(REQUEST_ROUTES)).toHaveLength(3);
    });
  });

  describe('SETTINGS_ROUTES', () => {
    it('should be defined', () => {
      expect(SETTINGS_ROUTES).toBeDefined();
    });

    it('should have KeyManagement route', () => {
      expect(SETTINGS_ROUTES.KeyManagement).toBe('KeyManagement');
    });

    it('should have exactly 1 route', () => {
      expect(Object.keys(SETTINGS_ROUTES)).toHaveLength(1);
    });
  });

  describe('AUTH_ROUTES', () => {
    it('should be defined', () => {
      expect(AUTH_ROUTES).toBeDefined();
    });

    it('should have AuthView route', () => {
      expect(AUTH_ROUTES.AuthView).toBe('AuthView');
    });

    it('should have exactly 1 route', () => {
      expect(Object.keys(AUTH_ROUTES)).toHaveLength(1);
    });
  });

  describe('Route constants structure', () => {
    it('all BOTTOM_TAB_ROUTES values should be strings', () => {
      Object.values(BOTTOM_TAB_ROUTES).forEach(route => {
        expect(typeof route).toBe('string');
      });
    });

    it('all SCAN_ROUTES values should be strings', () => {
      Object.values(SCAN_ROUTES).forEach(route => {
        expect(typeof route).toBe('string');
      });
    });

    it('all REQUEST_ROUTES values should be strings', () => {
      Object.values(REQUEST_ROUTES).forEach(route => {
        expect(typeof route).toBe('string');
      });
    });

    it('all SETTINGS_ROUTES values should be strings', () => {
      Object.values(SETTINGS_ROUTES).forEach(route => {
        expect(typeof route).toBe('string');
      });
    });

    it('all AUTH_ROUTES values should be strings', () => {
      Object.values(AUTH_ROUTES).forEach(route => {
        expect(typeof route).toBe('string');
      });
    });
  });
});
