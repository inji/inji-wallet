import {useEffect, useRef, useState} from 'react';

export const useOverlayVisibleAfterTimeout = (
  visibleStart = false,
  ms = 1000
) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (visibleStart) {
      timeoutRef.current = setTimeout(() => {
        setVisible(true);
      }, ms);
    } else {
      setVisible(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [visibleStart, ms]);

  return visible;
};
