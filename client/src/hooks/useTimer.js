import { useEffect, useState } from 'react';

export const useTimer = (start, delay = 10) => {
  const [seconds, setSeconds] = useState(delay);

  useEffect(() => {
    if (!start) return;

    setSeconds(delay);
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev === 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [start]);

  return seconds;
};
