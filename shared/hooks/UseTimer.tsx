import React from 'react';

export function useTimer({
  initialValue,
}: {
  initialValue?: number;
}): [number, () => void] {
  const [time, setTime] = React.useState(initialValue || 10);
  const timerRef = React.useRef(time);
  const [timerId, setTimerId] = React.useState<NodeJS.Timeout | null>(null);

  const start = () => {
    const initiatedTimerId = setInterval(() => {
      timerRef.current -= 1;
      if (timerRef.current < 0) {
        clearInterval(initiatedTimerId);
      } else {
        setTime(timerRef.current);
      }
    }, 1000);
    setTimerId(initiatedTimerId);
  };

  React.useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, []);

  return [time, start];
}
