// Carga perezosa y única de TensorFlow.js + MoveNet (SinglePose Lightning).
// Se hace una sola vez por sesión de navegación y se reutiliza en toda la app.
let detectorPromise = null;

export function loadDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const tf = await import('@tensorflow/tfjs-core');
      await import('@tensorflow/tfjs-backend-webgl');
      const poseDetection = await import('@tensorflow-models/pose-detection');
      await tf.setBackend('webgl');
      await tf.ready();
      return poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      });
    })();
  }
  return detectorPromise;
}

/** Devuelve los keypoints (o []) de la persona más visible en el frame de vídeo. */
export async function estimateKeypoints(detector, videoEl) {
  const poses = await detector.estimatePoses(videoEl, { flipHorizontal: false });
  return poses[0]?.keypoints ?? [];
}
