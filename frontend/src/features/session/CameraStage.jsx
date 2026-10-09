import { useCamera } from '../../hooks/useCamera.js';
import PoseOverlay from '../pose-detection/PoseOverlay.jsx';
import { usePoseRepCounter } from '../pose-detection/usePoseRepCounter.js';

const CAMERA_MESSAGES = {
  requesting: 'Pidiendo acceso a la cámara…',
  denied: 'No se puede usar la cámara. Revisa los permisos del navegador para este sitio.',
  unsupported: 'Este navegador no admite acceso a la cámara.',
};

/** Cámara + esqueleto + contador de repeticiones en vivo para un ejercicio. */
export default function CameraStage({ exerciseSlug, active, onRepsChange }) {
  const { videoRef, status: cameraStatus } = useCamera();
  const { status: trackingStatus, reps, keypoints } = usePoseRepCounter({
    videoRef, exerciseSlug, active: active && cameraStatus === 'ready',
  });

  if (reps !== undefined) onRepsChange?.(reps);

  if (cameraStatus !== 'ready') {
    return (
      <div className="flex aspect-video items-center justify-center rounded bg-ink text-center text-white">
        <p className="max-w-xs px-4">{CAMERA_MESSAGES[cameraStatus]}</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded bg-ink">
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
      <div className="absolute inset-0 -scale-x-100">
        <PoseOverlay videoRef={videoRef} keypoints={keypoints} />
      </div>
      <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-6 py-2 text-[28px] text-white">
        {trackingStatus === 'loading' && 'Cargando el modelo…'}
        {trackingStatus === 'error' && 'No se pudo cargar la detección de pose.'}
        {trackingStatus === 'tracking' && `${reps} repeticiones`}
      </div>
    </div>
  );
}
