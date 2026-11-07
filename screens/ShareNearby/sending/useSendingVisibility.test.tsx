import React from 'react';
import {Text} from 'react-native';
import {act, render} from '@testing-library/react-native';
import type {MdocPresentationRef} from '../../../machines/mdocPresentation/mdocPresentationMachine';
import {useSendingVisibility} from './useSendingVisibility';

const actor = {} as MdocPresentationRef;
type NativeStage = Parameters<typeof useSendingVisibility>[2];

function Sending({stage}: {stage: NativeStage}) {
  const visible = useSendingVisibility(actor, true, stage);
  return <Text>{visible ? 'sending' : 'outcome'}</Text>;
}

describe('minimum sending visibility', () => {
  beforeEach(() => {
    jest
      .spyOn(React, 'useState')
      .mockImplementation(jest.requireActual('react').useState);
    jest
      .spyOn(React, 'useEffect')
      .mockImplementation(jest.requireActual('react').useEffect);
    jest.useFakeTimers();
    jest.setSystemTime(0);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('keeps a fast successful transfer visible for a total of one second', () => {
    const screen = render(<Sending stage="sending" />);
    act(() => jest.advanceTimersByTime(700));
    screen.rerender(<Sending stage="completed" />);
    act(() => jest.advanceTimersByTime(299));
    expect(screen.getByText('sending')).toBeOnTheScreen();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.getByText('outcome')).toBeOnTheScreen();
  });

  it('adds no extra second when a real transfer has already taken longer', () => {
    const screen = render(<Sending stage="sending" />);
    act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByText('sending')).toBeOnTheScreen();
    screen.rerender(<Sending stage="completed" />);
    act(() => jest.advanceTimersByTime(0));
    expect(screen.getByText('outcome')).toBeOnTheScreen();
  });

  it('shows the bar even when native success is batched into the first sending render', () => {
    const screen = render(<Sending stage="completed" />);
    expect(screen.getByText('sending')).toBeOnTheScreen();
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.getByText('outcome')).toBeOnTheScreen();
  });

  it('bypasses the delay for cancellation or failure and clears the timer', () => {
    const screen = render(<Sending stage="completed" />);
    screen.rerender(<Sending stage="other" />);
    expect(screen.getByText('outcome')).toBeOnTheScreen();
    expect(jest.getTimerCount()).toBe(0);
  });
});
