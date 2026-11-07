import React from 'react';
import {Text} from 'react-native';
import {act, render} from '@testing-library/react-native';
import type {MdocPresentationRef} from '../../../machines/mdocPresentation/mdocPresentationMachine';
import {useEngagementSequence} from './useEngagementSequence';

type NativeStage = Parameters<typeof useEngagementSequence>[1];
const actor = {} as MdocPresentationRef;

function Sequence({stage}: {stage: NativeStage}) {
  const visibleStage = useEngagementSequence(actor, stage);
  return <Text>{visibleStage ?? 'request or outcome'}</Text>;
}

describe('connection phase pacing', () => {
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

  it('shows connecting and connected for two seconds each when the request arrives immediately', () => {
    const screen = render(<Sequence stage="showingCode" />);
    screen.rerender(<Sequence stage="reviewingRequest" />);
    expect(screen.getByText('connecting')).toBeOnTheScreen();
    act(() => jest.advanceTimersByTime(1999));
    expect(screen.getByText('connecting')).toBeOnTheScreen();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.getByText('waitingForRequest')).toBeOnTheScreen();
    act(() => jest.advanceTimersByTime(1999));
    expect(screen.getByText('waitingForRequest')).toBeOnTheScreen();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.getByText('request or outcome')).toBeOnTheScreen();
  });

  it('waits for the real connection and counts time already spent connected', () => {
    const screen = render(<Sequence stage="connecting" />);
    act(() => jest.advanceTimersByTime(5000));
    expect(screen.getByText('connecting')).toBeOnTheScreen();
    screen.rerender(<Sequence stage="waitingForRequest" />);
    act(() => jest.advanceTimersByTime(0));
    expect(screen.getByText('waitingForRequest')).toBeOnTheScreen();
    act(() => jest.advanceTimersByTime(5000));
    expect(screen.getByText('waitingForRequest')).toBeOnTheScreen();
    screen.rerender(<Sequence stage="reviewingRequest" />);
    act(() => jest.advanceTimersByTime(0));
    expect(screen.getByText('request or outcome')).toBeOnTheScreen();
  });

  it('shows an outcome immediately and clears the pending phase timer', () => {
    const screen = render(<Sequence stage="reviewingRequest" />);
    expect(screen.getByText('connecting')).toBeOnTheScreen();
    screen.rerender(<Sequence stage={undefined} />);
    expect(screen.getByText('request or outcome')).toBeOnTheScreen();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('starts a fresh sequence when a new QR is generated in the same session actor', () => {
    const screen = render(<Sequence stage="reviewingRequest" />);
    act(() => jest.advanceTimersByTime(2000));
    screen.rerender(<Sequence stage="showingCode" />);
    expect(jest.getTimerCount()).toBe(0);
    screen.rerender(<Sequence stage="reviewingRequest" />);
    expect(screen.getByText('connecting')).toBeOnTheScreen();
    act(() => jest.advanceTimersByTime(1999));
    expect(screen.getByText('connecting')).toBeOnTheScreen();
    screen.unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
