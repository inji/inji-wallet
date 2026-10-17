import {interpret} from 'xstate';

jest.mock('../shared/api', () => ({initializeFaceModel: jest.fn()}));
jest.mock('./store', () => ({
  StoreEvents: {
    GET: (key: string) => ({type: 'GET', key}),
    SET: (key: string, value: unknown) => ({type: 'SET', key, value}),
  },
}));
jest.mock('react-native-securerandom', () => ({
  generateSecureRandom: jest.fn(),
}));

import {AuthEvents, authMachine} from './auth';

// The machine with storage stubbed out and salt generation either succeeding or failing.
const startAuth = (generateSalt: () => Promise<string>) =>
  interpret(
    authMachine.withConfig({
      actions: {requestStoredContext: jest.fn(), storeContext: jest.fn()},
      services: {generatePasscodeSalt: () => generateSalt},
    }),
  ).start();

const restore = (
  service: ReturnType<typeof startAuth>,
  stored: Partial<typeof authMachine.context>,
) =>
  service.send(
    AuthEvents.STORE_RESPONSE({...authMachine.context, ...stored}) as any,
  );

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

describe('auth machine setup', () => {
  it('enters setup with the generated salt after the language is saved', async () => {
    const service = startAuth(() => Promise.resolve('generated-salt'));
    restore(service, {selectLanguage: false});
    expect(service.getSnapshot().value).toBe('languagesetup');

    service.send(AuthEvents.SELECT());
    await settle();

    expect(service.getSnapshot().value).toBe('settingUp');
    expect(service.getSnapshot().context.passcodeSalt).toBe('generated-salt');
  });

  it('stays on the language step when the salt cannot be generated', async () => {
    const service = startAuth(() => Promise.reject(new Error('no entropy')));
    restore(service, {selectLanguage: false});

    service.send(AuthEvents.SELECT());
    await settle();

    expect(service.getSnapshot().value).toBe('languagesetup');
    expect(service.getSnapshot().context.passcodeSalt).toBe('');
  });

  it('lets Save retry after a failed salt generation', async () => {
    const generateSalt = jest
      .fn()
      .mockRejectedValueOnce(new Error('no entropy'))
      .mockResolvedValueOnce('generated-salt');
    const service = startAuth(generateSalt);
    restore(service, {selectLanguage: false});

    service.send(AuthEvents.SELECT());
    await settle();
    service.send(AuthEvents.SELECT());
    await settle();

    expect(service.getSnapshot().value).toBe('settingUp');
    expect(service.getSnapshot().context.passcodeSalt).toBe('generated-salt');
  });

  it('generates a salt before setup when restarted without one', async () => {
    const service = startAuth(() => Promise.resolve('generated-salt'));
    restore(service, {selectLanguage: true, passcodeSalt: ''});
    expect(service.getSnapshot().value).toBe('introSlider');

    await settle();

    expect(service.getSnapshot().value).toBe('settingUp');
    expect(service.getSnapshot().context.passcodeSalt).toBe('generated-salt');
  });

  it('goes straight to setup when restarted with a salt', () => {
    const service = startAuth(() => Promise.resolve('unused'));
    restore(service, {selectLanguage: true, passcodeSalt: 'stored-salt'});

    expect(service.getSnapshot().value).toBe('settingUp');
    expect(service.getSnapshot().context.passcodeSalt).toBe('stored-salt');
  });
});
