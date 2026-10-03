import { useEffect, useRef, useState } from 'react';

/** Cuenta atrás en segundos; llama a onDone una vez al llegar a 0. */
export function useCountdown(seconds, { active, onDone, resetKey }) {
  const [countdown, setCountdown] = useState(() => ({ resetKey, seconds, remaining: seconds }));
  const isCurrentCountdown = countdown.resetKey === resetKey && countdown.seconds === seconds;
  const remaining = isCurrentCountdown ? countdown.remaining : seconds;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => setCountdown({ resetKey, seconds, remaining: seconds }), [resetKey, seconds]);

  useEffect(() => {
    if (!active) return;
    if (remaining <= 0) { onDoneRef.current?.(); return; }
    const id = setTimeout(() => {
      setCountdown((current) => {
        if (current.resetKey !== resetKey || current.seconds !== seconds) return current;
        return { ...current, remaining: current.remaining - 1 };
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [active, remaining, resetKey, seconds]);

  return remaining;
}
