// jest.config.js
const {defaults: tsjPreset} = require('ts-jest/presets');
module.exports = {
  ...tsjPreset,
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '\\.snap$'],
  cacheDirectory: '.jest/cache',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    __DEV__: true,
  },
  transform: {
    '^.+\\.jsx$': 'babel-jest',
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // TODO: Remove this to log the type mismatch errors later.
        diagnostics: {
          exclude: ['**'],
        },
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  // This line should be kept even with nothing to be ignored, otherwise the transform will not take place.
  // Not quite sure about the reason.
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  coveragePathIgnorePatterns: [
    'node_modules',
    'test-config',
    'interfaces',
    'jestGlobalMocks.ts',
    '__mocks__/*',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    'node_modules/(?!(@react-native|react-native|react-native-argon2|@react-navigation|react-native-elements|react-native-size-matters|react-native-ratings|expo-constants|base58-universal|@react-native-*|react-native-google-signin|react-native-linear-gradient|expo-camera|base58-universal/*|react-native-*)/).*/',
  ],
  setupFiles: [
    '<rootDir>/__mocks__/svg.mock.js',
    '<rootDir>/__mocks__/jest-init.js',
    '<rootDir>/__mocks__/mmkv-db-setup.js',
    '<rootDir>/__mocks__/react-native.mock.js',
    '<rootDir>/__mocks__/telemetry-sdk.mock.js',
    '<rootDir>/__mocks__/expo-constants.mock.js',
    '<rootDir>/node_modules/react-native-mmkv-storage/jest/mmkvJestSetup.js',
    '<rootDir>/node_modules/@react-native-community/netinfo/jest/netinfo-mock.js',
    '<rootDir>/__mocks__/react-native-argon2.mock.js',
    '<rootDir>/__mocks__/inji-native-bridge.js',
    '<rootDir>/__mocks__/@noble/mock-secp256k1.js',
    '<rootDir>/__mocks__/@noble/mock-ed25519.js',
    '<rootDir>/__mocks__/react-native-base64.js',
    '<rootDir>__mocks__/mockCrytoUtil.js',
    '<rootDir>__mocks__/text-encoder.js',
    // https://github.com/react-native-google-signin/google-signin?tab=readme-ov-file#jest-module-mock
    '<rootDir>/node_modules/@react-native-google-signin/google-signin/jest/build/setup.js',
  ],
  // TODO: enable this to also collect coverage
  collectCoverage: false,
  collectCoverageFrom: [
    'routes/*.ts',
    'screens/**',
    'machines/**',
    'lib/jsonld-signatures/**',
    'components/**',
    'machines/**',
    'shared/**',
    '**/*.{js,jsx}',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    // https://stackoverflow.com/a/54513338
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(svg)$': '<rootDir>/__mocks__/svg.mock.js',
    '^\\.\\/locales\\/en\\.json$': '<rootDir>/__mocks__/en.mock.json',
    '^react-native-biometrics-changed$':
      '<rootDir>/__mocks__/react-native-biometrics-changed.js',
  },
};
