import React from 'react';
import {render} from '@testing-library/react-native';
import {ReceivedCards} from './ReceivedCards';

jest.mock('../../components/ui/svg', () => ({
  SvgImage: {
    ReceivedCards: () => 'ReceivedCardsIcon',
  },
}));

jest.mock('../Home/ReceivedVcsTabController', () => ({
  useReceivedVcsTab: () => ({
    isVisible: false,
    TOGGLE_RECEIVED_CARDS: jest.fn(),
  }),
}));

jest.mock('./ReceivedCardsModal', () => ({
  ReceivedCardsModal: () => 'ReceivedCardsModal',
}));

jest.mock('../../shared/commonUtil', () => jest.fn(() => ({})));

describe('ReceivedCards', () => {
  it('should match snapshot', () => {
    const {toJSON} = render(<ReceivedCards />);
    expect(toJSON()).toMatchSnapshot();
  });
});
