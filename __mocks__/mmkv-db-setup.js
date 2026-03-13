jest.mock('react-native-mmkv-storage', () => {
  const store = {};
  const mmkvInstance = {
    getItem: jest.fn(key => Promise.resolve(store[key] || null)),
    setItem: jest.fn((key, data) => {
      store[key] = data;
      return Promise.resolve(true);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
      return Promise.resolve(true);
    }),
    clearStore: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve(true);
    }),
    indexer: {
      strings: {
        getKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
      },
    },
  };
  return {
    MMKVLoader: jest.fn().mockImplementation(() => ({
      initialize: jest.fn(() => mmkvInstance),
      withEncryption: jest.fn().mockReturnThis(),
      withInstanceID: jest.fn().mockReturnThis(),
    })),
  };
});
