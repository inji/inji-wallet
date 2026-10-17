// react-native-safe-area-context ships its own jest mock (jest/mock.tsx), but it's ESM
// and sits under node_modules, which transformIgnorePatterns excludes from
// transformation — pulling it in as-is fails with "Cannot use import statement outside
// a module". This mirrors that official mock's actual approach (see its source) rather
// than reinventing one: keep every real export via jest.requireActual (SafeAreaView,
// SafeAreaProvider, the context objects — TrustModal's existing snapshot depends on the
// real SafeAreaView rendering as RNCSafeAreaView) and override only the two hooks that
// read context, which is what crashes ("No safe area value available") when a component
// like Header or MdocShareFlow renders outside a SafeAreaProvider in tests.
jest.mock('react-native-safe-area-context', () => {
  const RNSafeAreaContext = jest.requireActual(
    'react-native-safe-area-context',
  );
  const mockInsets = {top: 0, right: 0, bottom: 0, left: 0};
  const mockFrame = {x: 0, y: 0, width: 320, height: 640};
  return {
    ...RNSafeAreaContext,
    useSafeAreaInsets: () => mockInsets,
    useSafeAreaFrame: () => mockFrame,
  };
});
