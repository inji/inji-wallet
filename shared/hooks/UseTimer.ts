import React from "react";

export function useTimer({
                           initialValue,
                         }: {
  initialValue?: number;
}): [number, () => void] {
  const [time, setTime] = React.useState(initialValue ?? 10);
  const timerRef = React.useRef(time);
  const timerIdRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    timerRef.current = time;
  }, [time]);

  const start = () => {
    timerIdRef.current = setInterval(() => {
      timerRef.current -= 1;

      if (timerRef.current < 0) {
        if (timerIdRef.current) {
          clearInterval(timerIdRef.current);
        }
      } else {
        setTime(timerRef.current);
      }
    }, 1000);
  };

  React.useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  }, []);

  return [time, start];
}
