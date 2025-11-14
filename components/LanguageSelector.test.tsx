import React from 'react';
import {render} from '@testing-library/react-native';
import {LanguageSelector} from './LanguageSelector';
import {Text} from 'react-native';

// Mock dependencies
jest.mock('react-native-restart', () => ({
  Restart: jest.fn(),
}));

jest.mock('./ui/Picker', () => ({
  Picker: jest.fn(() => null),
}));

describe('LanguageSelector Component', () => {
  const defaultTrigger = <Text>Select Language</Text>;

  it('should match snapshot with default trigger', () => {
    const {toJSON} = render(
      <LanguageSelector triggerComponent={defaultTrigger} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom trigger component', () => {
    const customTrigger = <Text>Choose Language</Text>;
    const {toJSON} = render(
      <LanguageSelector triggerComponent={customTrigger} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
