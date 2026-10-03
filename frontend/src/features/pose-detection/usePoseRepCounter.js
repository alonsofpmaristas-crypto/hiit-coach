import { useEffect, useRef, useState } from 'react';
import { loadDetector, estimateKeypoints } from './poseDetector.js';
import { RepCounter } from './RepCounter.js';

/**
 * Ejecuta la estimación de pose sobre el vídeo en un bucle de rAF y alimenta
 * un RepCounter para el ejercicio indicado. Se detiene solo con `active`.
 */
export function usePoseRepCounter({ videoRef, exerciseSlug, active }) {
  const [state, setState] = useState({ status: 'loading', reps: 0, value: null, keypoints: [] });
  const counterRef = useRef(null);

  useEffect(() => {
    counterRef.current = new RepCounter(exerciseSlug);
    setState((s) => ({ ...s, reps: 0 }));
  }, [exerciseSlug]);

  useEffect(() => {
    if (!active) return;
    let rafId;
    let cancelled = false;

    loadDetector()
      .then((detector) => {
        if (cancelled) return;
        setState((s) => ({ ...s, status: 'tracking' }));

        const loop = async () => {
          if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
            rafId = requestAnimationFrame(loop);
            return;
          }
          const keypoints = await estimateKeypoints(detector, videoRef.current);
          const { reps, value } = counterRef.current.update(keypoints);
          setState({ status: 'tracking', reps, value, keypoints });
          rafId = requestAnimationFrame(loop);
        };
        loop();
      })
      .catch(() => setState((s) => ({ ...s, status: 'error' })));

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [active, videoRef]);

  return state;
}
