import {useEffect, useState} from 'react';

/** Native owns expiry; this timer only displays the remaining time. */
export function useCountdown(expiresAt?: number) {
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now);
  useEffect(() => {
    if (expiresAt === undefined) return;
    setCurrentTimestamp(Date.now());
    const intervalId = setInterval(() => setCurrentTimestamp(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [expiresAt]);
  const remainingSeconds = Math.max(
    0,
    Math.ceil(((expiresAt ?? currentTimestamp) - currentTimestamp) / 1000),
  );
  return {
    remainingSeconds,
    formattedTime: `${Math.floor(remainingSeconds / 60)}:${String(
      remainingSeconds % 60,
    ).padStart(2, '0')}`,
  };
}
