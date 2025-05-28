import { useEffect, useState, useRef } from 'react';

export const useTimer = (isActive, delay = 10, turnStart = Date.now()) => {
  const [seconds, setSeconds] = useState(delay);

  useEffect(() => {
    if (!isActive) {
      setSeconds(delay);
      return;
    }

    const update = () => {
      const elapsedMs = Date.now() - turnStart;
      const remaining = Math.max(delay - Math.floor(elapsedMs / 1000), 0);
      setSeconds(remaining);
    };

    update();

    const interval = setInterval(update, 200); 

    return () => clearInterval(interval);
  }, [isActive, turnStart, delay]);

  return seconds;
};
