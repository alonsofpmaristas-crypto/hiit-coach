import { useEffect, useRef, useState } from 'react';

/** Pide la cámara frontal y la conecta a un <video>. Libera la pista al desmontar. */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('requesting'); // requesting | ready | denied | unsupported

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        streamRef.current = s;
        setStatus('ready');
      })
      .catch(() => setStatus('denied'));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (status !== 'ready' || !video || !stream) return;

    video.srcObject = stream;
    video.play().catch(() => {});

    return () => {
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [status]);

  return { videoRef, status };
}
