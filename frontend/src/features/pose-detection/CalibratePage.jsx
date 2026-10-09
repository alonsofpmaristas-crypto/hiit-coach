import { useState } from 'react';
import { useCamera } from '../../hooks/useCamera.js';
import { usePoseRepCounter } from './usePoseRepCounter.js';
import PoseOverlay from './PoseOverlay.jsx';
import { METRICS } from './metrics.js';
import ExerciseGuide from './ExerciseGuide.jsx';

// Pantalla de calibración: enseña el valor en crudo de la métrica de cada
// ejercicio en tiempo real, para ajustar los umbrales de RepCounter.js
// antes de darlos por buenos en una sesión real.
export default function CalibratePage() {
  const [slug, setSlug] = useState('squat');
  const { videoRef, status: cameraStatus } = useCamera();
  const { status, reps, value, keypoints } = usePoseRepCounter({
    videoRef, exerciseSlug: slug, active: cameraStatus === 'ready',
  });

  return (
    <div>
      <h1 className="font-display text-4xl font-bold">Calibración de ejercicios</h1>
      <p className="mt-2 max-w-prose text-muted">
        Ponte delante de la cámara y comprueba que el contador reacciona como se espera antes de ajustar los umbrales.
      </p>

      <select
        value={slug} onChange={(e) => setSlug(e.target.value)}
        className="mt-4 rounded border border-line bg-white px-3 py-2"
      >
        {Object.keys(METRICS).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <div className="mt-6 grid items-start gap-6 md:grid-cols-2">
        {cameraStatus !== 'ready' ? (
          <div className="flex aspect-video items-center justify-center rounded bg-ink text-center text-white">
            <p>Esperando la cámara…</p>
          </div>
        ) : (
          <div className="relative aspect-video overflow-hidden rounded bg-ink">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
            <div className="absolute inset-0 -scale-x-100">
              <PoseOverlay videoRef={videoRef} keypoints={keypoints} />
            </div>
          </div>
        )}
        <ExerciseGuide exerciseSlug={slug} />
      </div>

      <dl className="mt-6 grid max-w-sm grid-cols-2 gap-y-2">
        <dt className="text-muted">Estado</dt><dd>{status}</dd>
        <dt className="text-muted">{METRICS[slug].unit}</dt><dd>{value !== null ? value.toFixed(1) : '—'}</dd>
        <dt className="text-muted">Repeticiones</dt><dd className="font-display text-2xl">{reps}</dd>
      </dl>
    </div>
  );
}
