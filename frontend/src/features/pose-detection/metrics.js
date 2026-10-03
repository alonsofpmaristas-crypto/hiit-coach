import { angleAt, avgValid, byName, dist, isVisible, torsoLength } from './angles.js';

// Cada métrica devuelve un número (mayor = "posición extendida") o null si no
// hay suficientes puntos visibles para calcular algo fiable en este frame.

function kneeAngle(kp) {
  const l = isVisible(kp.left_hip) && isVisible(kp.left_knee) && isVisible(kp.left_ankle)
    ? angleAt(kp.left_hip, kp.left_knee, kp.left_ankle) : null;
  const r = isVisible(kp.right_hip) && isVisible(kp.right_knee) && isVisible(kp.right_ankle)
    ? angleAt(kp.right_hip, kp.right_knee, kp.right_ankle) : null;
  return avgValid([l, r]);
}

function elbowAngle(kp) {
  const l = isVisible(kp.left_shoulder) && isVisible(kp.left_elbow) && isVisible(kp.left_wrist)
    ? angleAt(kp.left_shoulder, kp.left_elbow, kp.left_wrist) : null;
  const r = isVisible(kp.right_shoulder) && isVisible(kp.right_elbow) && isVisible(kp.right_wrist)
    ? angleAt(kp.right_shoulder, kp.right_elbow, kp.right_wrist) : null;
  return avgValid([l, r]);
}

function hipAngle(kp) {
  // Ángulo tronco-cadera-rodilla: se cierra al sentarse o hacer un abdominal.
  const l = isVisible(kp.left_shoulder) && isVisible(kp.left_hip) && isVisible(kp.left_knee)
    ? angleAt(kp.left_shoulder, kp.left_hip, kp.left_knee) : null;
  const r = isVisible(kp.right_shoulder) && isVisible(kp.right_hip) && isVisible(kp.right_knee)
    ? angleAt(kp.right_shoulder, kp.right_hip, kp.right_knee) : null;
  return avgValid([l, r]);
}

// Altura de una muñeca respecto al hombro, normalizada por el tronco.
// Positivo = muñeca por encima del hombro (brazo levantado).
function wristsAboveShoulders(kp) {
  const t = torsoLength(kp);
  if (!t) return null;
  const l = isVisible(kp.left_wrist) && isVisible(kp.left_shoulder)
    ? (kp.left_shoulder.y - kp.left_wrist.y) / t : null;
  const r = isVisible(kp.right_wrist) && isVisible(kp.right_shoulder)
    ? (kp.right_shoulder.y - kp.right_wrist.y) / t : null;
  return avgValid([l, r]);
}

// Separación entre tobillos, normalizada por el tronco (para jumping jacks).
function ankleSpread(kp) {
  const t = torsoLength(kp);
  if (!t || !isVisible(kp.left_ankle) || !isVisible(kp.right_ankle)) return null;
  return dist(kp.left_ankle, kp.right_ankle) / t;
}

// Altura de la rodilla más alta respecto a la cadera, normalizada (high-knees / mountain climbers).
function maxKneeLift(kp) {
  const t = torsoLength(kp);
  if (!t) return null;
  const l = isVisible(kp.left_knee) && isVisible(kp.left_hip) ? (kp.left_hip.y - kp.left_knee.y) / t : null;
  const r = isVisible(kp.right_knee) && isVisible(kp.right_hip) ? (kp.right_hip.y - kp.right_knee.y) / t : null;
  return Math.max(l ?? -Infinity, r ?? -Infinity) === -Infinity ? null : Math.max(l ?? -Infinity, r ?? -Infinity);
}

// Altura de la cadera respecto al tobillo, normalizada (para burpees: cae al tumbarse, sube al saltar).
function hipHeight(kp) {
  const t = torsoLength(kp);
  const ankleY = avgValid([kp.left_ankle?.y, kp.right_ankle?.y]);
  const hipY = avgValid([
    isVisible(kp.left_hip) ? kp.left_hip.y : null,
    isVisible(kp.right_hip) ? kp.right_hip.y : null,
  ]);
  if (!t || hipY === null || ankleY === null) return null;
  return (ankleY - hipY) / t;
}

export const METRICS = {
  squat: { fn: (kps) => kneeAngle(byName(kps)), unit: 'grados de rodilla' },
  lunge: { fn: (kps) => kneeAngle(byName(kps)), unit: 'grados de rodilla' },
  pushup: { fn: (kps) => elbowAngle(byName(kps)), unit: 'grados de codo' },
  situp: { fn: (kps) => hipAngle(byName(kps)), unit: 'grados de cadera' },
  'jumping-jack': { fn: (kps) => avgValid([wristsAboveShoulders(byName(kps)), ankleSpread(byName(kps))]), unit: 'apertura normalizada' },
  'high-knees': { fn: (kps) => maxKneeLift(byName(kps)), unit: 'elevación de rodilla' },
  'mountain-climber': { fn: (kps) => maxKneeLift(byName(kps)), unit: 'elevación de rodilla' },
  burpee: { fn: (kps) => hipHeight(byName(kps)), unit: 'altura de cadera' },
};
