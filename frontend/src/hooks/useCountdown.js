import { useEffect, useRef, useState } from 'react';

/** Cuenta atrás en segundos; llama a onDone una vez al llegar a 0. */
export function useCountdown(seconds, { active, onDone }) {
  const [remaining, setRemaining] = useState(seconds);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => setRemaining(seconds), [seconds]);

  useEffect(() => {
    if (!active) return;
    if (remaining <= 0) { onDoneRef.current?.(); return; }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [active, remaining]);

  return remaining;
}
