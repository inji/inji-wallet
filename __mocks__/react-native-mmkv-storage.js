const mockStore = {};

const mmkvInstance = {
  getItem: jest.fn(key => Promise.resolve(mockStore[key] || null)),
  setItem: jest.fn((key, value) => {
    mockStore[key] = value;
    return Promise.resolve(true);
  }),
  removeItem: jest.fn(key => {
    delete mockStore[key];
    return Promise.resolve(true);
  }),
  clearStore: jest.fn(() => {
    Object.keys(mockStore).forEach(key => delete mockStore[key]);
    return Promise.resolve(true);
  }),
  indexer: {
    strings: {
      getKeys: jest.fn(() => Promise.resolve(Object.keys(mockStore))),
    },
  },
};

class MockMMKVLoader {
  constructor() {}

  load() {
    return this;
  }

  save() {
    return this;
  }

  withEncryption() {
    return this;
  }

  withInstanceID() {
    return this;
  }

  initialize() {
    return mmkvInstance;
  }
}

export {MockMMKVLoader as MMKVLoader};
