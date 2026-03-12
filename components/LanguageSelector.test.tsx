import React from 'react';
import {render} from '@testing-library/react-native';
import {LanguageSelector, changeLanguage} from './LanguageSelector';
import {Text} from 'react-native';

// Mock dependencies
jest.mock('react-native-restart', () => ({
  Restart: jest.fn(),
}));

jest.mock('./ui/Picker', () => ({
  Picker: jest.fn(() => null),
}));

jest.mock('../machines/store', () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
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

describe('changeLanguage', () => {
  it('should do nothing when language is same as current', async () => {
    const mockI18n = {language: 'en', changeLanguage: jest.fn()} as any;
    await changeLanguage(mockI18n, 'en');
    expect(mockI18n.changeLanguage).not.toHaveBeenCalled();
  });

  it('should change language when different', async () => {
    const {setItem} = require('../machines/store');
    const mockI18n = {
      language: 'en',
      changeLanguage: jest.fn().mockImplementation(async lang => {
        mockI18n.language = lang;
      }),
    } as any;
    await changeLanguage(mockI18n, 'fr');
    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('fr');
    expect(setItem).toHaveBeenCalled();
  });

  it('should propagate error when setItem fails', async () => {
    const {setItem} = require('../machines/store');
    setItem.mockRejectedValueOnce(new Error('storage write failed'));
    const mockI18n = {
      language: 'en',
      changeLanguage: jest.fn().mockImplementation(async lang => {
        mockI18n.language = lang;
      }),
    } as any;
    await expect(changeLanguage(mockI18n, 'fr')).rejects.toThrow(
      'storage write failed',
    );
    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('fr');
  });
});
