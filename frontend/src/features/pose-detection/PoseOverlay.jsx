import { useEffect, useRef } from 'react';
import { isVisible } from './angles.js';

// Pares de keypoints que se dibujan como huesos del esqueleto.
const BONES = [
  ['left_shoulder', 'right_shoulder'], ['left_hip', 'right_hip'],
  ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
  ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
  ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'], ['right_knee', 'right_ankle'],
];

export default function PoseOverlay({ videoRef, keypoints }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!keypoints?.length) return;

    const byName = Object.fromEntries(keypoints.map((k) => [k.name, k]));

    ctx.strokeStyle = '#ff4f1f';
    ctx.lineWidth = 3;
    for (const [a, b] of BONES) {
      const A = byName[a], B = byName[b];
      if (isVisible(A) && isVisible(B)) {
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#101828';
    for (const kp of keypoints) {
      if (!isVisible(kp)) continue;
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [keypoints, videoRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
