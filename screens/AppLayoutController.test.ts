const mockAuthService = {};

jest.mock('@xstate/react', () => ({
  useSelector: jest.fn(() => false),
}));
jest.mock('../machines/auth', () => ({
  selectAuthorized: 'selectAuthorized',
  selectLanguagesetup: 'selectLanguagesetup',
  selectUnauthorized: 'selectUnauthorized',
}));
jest.mock('../shared/GlobalContext', () => ({
  GlobalContext: {_currentValue: {appService: {children: new Map()}}},
}));

const React = require('react');
jest.spyOn(React, 'useContext').mockReturnValue({
  appService: {children: {get: () => mockAuthService}},
});

import {useAppLayout} from './AppLayoutController';
import {useSelector} from '@xstate/react';

describe('useAppLayout', () => {
  beforeEach(() => {
    jest.spyOn(React, 'useContext').mockReturnValue({
      appService: {children: {get: () => mockAuthService}},
    });
  });

  it('should call useSelector with correct selectors', () => {
    useAppLayout();
    expect(useSelector).toHaveBeenCalledWith(
      mockAuthService,
      'selectLanguagesetup',
    );
    expect(useSelector).toHaveBeenCalledWith(
      mockAuthService,
      'selectAuthorized',
    );
    expect(useSelector).toHaveBeenCalledWith(
      mockAuthService,
      'selectUnauthorized',
    );
  });
});
