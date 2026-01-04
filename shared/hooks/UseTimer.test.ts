import { renderHook, act } from '@testing-library/react-hooks';
import { useTimer } from './useTimer';

jest.useFakeTimers();

describe('useTimer', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should initialize with default value (10)', () => {
    const { result } = renderHook(() => useTimer({}));

    const [time] = result.current;
    expect(time).toBe(10);
  });

  it('should initialize with provided initialValue', () => {
    const { result } = renderHook(() => useTimer({ initialValue: 5 }));

    const [time] = result.current;
    expect(time).toBe(5);
  });
});
