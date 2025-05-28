import { useEffect, useState, useRef } from 'react';

export const useTimer = (isActive, delay = 10, turnStart = Date.now()) => {
  const [seconds, setSeconds] = useState(delay);

  useEffect(() => {
    console.log('Timer useEffect triggered. isActive:', isActive, 'delay:', delay, 'turnStart:', turnStart);

    if (!isActive) {
      console.log('Timer not active, resetting seconds to delay:', delay);
      setSeconds(delay);
      return;
    }

    const update = () => {
      const now = Date.now();
      const elapsedMs = now - turnStart;
      const remaining = Math.max(delay - Math.floor(elapsedMs / 1000), 0);
      console.log(`Timer update: now=${now}, turnStart=${turnStart}, elapsedMs=${elapsedMs}, remaining=${remaining}`);
      setSeconds(remaining);
    };

    console.log('Timer active, performing initial update...');
    update();

    const interval = setInterval(update, 200);

    return () => {
      console.log('Cleaning up timer interval');
      clearInterval(interval);
    };
  }, [isActive, turnStart, delay]);

  console.log('Timer hook returning seconds:', seconds);
  return seconds;
};
