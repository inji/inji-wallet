// Mock all screen components to avoid deep dependency chains
jest.mock('../screens/AuthScreen', () => ({AuthScreen: () => null}));
jest.mock('../screens/BiometricScreen', () => ({BiometricScreen: () => null}));
jest.mock('../screens/WelcomeScreen', () => ({WelcomeScreen: () => null}));
jest.mock('../screens/PasscodeScreen', () => ({PasscodeScreen: () => null}));
jest.mock('../screens/MainLayout', () => ({MainLayout: () => null}));
jest.mock('../screens/NotificationsScreen', () => ({
  NotificationsScreen: () => null,
}));
jest.mock('../screens/SetupLanguageScreen', () => ({
  SetupLanguageScreen: () => null,
}));
jest.mock('../screens/Home/IntroSlidersScreen', () => ({
  IntroSlidersScreen: () => null,
}));
jest.mock('../screens/Request/RequestLayout', () => ({
  RequestLayout: () => null,
}));
jest.mock('../screens/SplashScreen', () => ({SplashScreen: () => null}));
jest.mock('../screens/Settings/KeyManagementScreen', () => ({
  KeyManagementScreen: () => null,
}));
jest.mock('../screens/AuthWebViewScreen', () => ({
  __esModule: true,
  default: () => null,
}));

import {baseRoutes, authRoutes} from './index';

describe('routes/index', () => {
  describe('baseRoutes', () => {
    it('should be an array', () => {
      expect(Array.isArray(baseRoutes)).toBe(true);
    });

    it('should have SplashScreen route', () => {
      const splash = baseRoutes.find(r => r.name === 'SplashScreen');
      expect(splash).toBeDefined();
      expect(splash?.options?.headerShown).toBe(false);
    });

    it('should have Language route', () => {
      const lang = baseRoutes.find(r => r.name === 'Language');
      expect(lang).toBeDefined();
    });

    it('should have IntroSliders route', () => {
      const intro = baseRoutes.find(r => r.name === 'IntroSliders');
      expect(intro).toBeDefined();
      expect(intro?.options?.headerShown).toBe(false);
    });

    it('should have Auth route', () => {
      const auth = baseRoutes.find(r => r.name === 'Auth');
      expect(auth).toBeDefined();
    });

    it('should have Passcode route', () => {
      const passcode = baseRoutes.find(r => r.name === 'Passcode');
      expect(passcode).toBeDefined();
    });

    it('should have Biometric route', () => {
      const bio = baseRoutes.find(r => r.name === 'Biometric');
      expect(bio).toBeDefined();
    });

    it('should have Welcome route', () => {
      const welcome = baseRoutes.find(r => r.name === 'Welcome');
      expect(welcome).toBeDefined();
    });

    it('should have Request route', () => {
      const request = baseRoutes.find(r => r.name === 'Request');
      expect(request).toBeDefined();
      expect(request?.options?.headerShown).toBe(false);
    });

    it('should have KeyManagement route', () => {
      const km = baseRoutes.find(r => r.name === 'KeyManagement');
      expect(km).toBeDefined();
    });

    it('should have AuthView route', () => {
      const av = baseRoutes.find(r => r.name === 'AuthView');
      expect(av).toBeDefined();
    });

    it('all routes should have component', () => {
      baseRoutes.forEach(route => {
        expect(route.component).toBeDefined();
      });
    });
  });

  describe('authRoutes', () => {
    it('should be an array', () => {
      expect(Array.isArray(authRoutes)).toBe(true);
    });

    it('should have Main route', () => {
      const main = authRoutes.find(r => r.name === 'Main');
      expect(main).toBeDefined();
      expect(main?.options?.headerShown).toBe(false);
    });

    it('should have Notifications route', () => {
      const notif = authRoutes.find(r => r.name === 'Notifications');
      expect(notif).toBeDefined();
    });

    it('all routes should have component', () => {
      authRoutes.forEach(route => {
        expect(route.component).toBeDefined();
      });
    });
  });
});
