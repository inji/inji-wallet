// Mock screen components to avoid deep dependency chains
jest.mock('../screens/Scan/ScanLayout', () => ({
  ScanLayout: () => null,
}));
jest.mock('../screens/History/HistoryScreen', () => ({
  HistoryScreen: () => null,
}));
jest.mock('../screens/HomeScreenLayout', () => ({
  HomeScreenLayout: () => null,
}));
jest.mock('../screens/Settings/SettingScreen', () => ({
  SettingScreen: () => null,
}));

import {mainRoutes, share} from './main';

describe('routes/main', () => {
  describe('mainRoutes', () => {
    it('should be an array of tab screens', () => {
      expect(Array.isArray(mainRoutes)).toBe(true);
      expect(mainRoutes.length).toBe(4);
    });

    it('all routes should have name, component and icon', () => {
      mainRoutes.forEach(route => {
        expect(route.name).toBeDefined();
        expect(typeof route.name).toBe('string');
        expect(route.component).toBeDefined();
        expect(route.icon).toBeDefined();
      });
    });

    it('should include home, share, history, settings routes', () => {
      const names = mainRoutes.map(r => r.name);
      expect(names).toContain('home');
      expect(names).toContain('share');
      expect(names).toContain('history');
      expect(names).toContain('settings');
    });

    it('home route should have headerShown false', () => {
      const home = mainRoutes.find(r => r.name === 'home');
      expect(home?.options?.headerShown).toBe(false);
    });

    it('share route should have headerShown false', () => {
      const shareRoute = mainRoutes.find(r => r.name === 'share');
      expect(shareRoute?.options?.headerShown).toBe(false);
    });
  });

  describe('share export', () => {
    it('should be a tab screen object', () => {
      expect(share.name).toBe('share');
      expect(share.icon).toBe('qr-code-scanner');
      expect(share.component).toBeDefined();
    });
  });
});
