import { useState, useEffect } from 'react';

export function useCountUp(target) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let current = 0;
    const step = target / 50;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(current));
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return val;
}
