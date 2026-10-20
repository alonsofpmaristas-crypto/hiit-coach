import { angleAt, avgValid, byName, dist, isVisible, torsoLength } from './angles.js';

// Cada métrica devuelve un número para el frame o null si no hay suficientes
// puntos visibles. Algunos ejercicios alternos también exponen valores por lado.

function kneeAngle(kp) {
  const l = isVisible(kp.left_hip) && isVisible(kp.left_knee) && isVisible(kp.left_ankle)
    ? angleAt(kp.left_hip, kp.left_knee, kp.left_ankle) : null;
  const r = isVisible(kp.right_hip) && isVisible(kp.right_knee) && isVisible(kp.right_ankle)
    ? angleAt(kp.right_hip, kp.right_knee, kp.right_ankle) : null;
  return avgValid([l, r]);
}

function bentKneeAngle(kp) {
  const l = isVisible(kp.left_hip) && isVisible(kp.left_knee) && isVisible(kp.left_ankle)
    ? angleAt(kp.left_hip, kp.left_knee, kp.left_ankle) : null;
  const r = isVisible(kp.right_hip) && isVisible(kp.right_knee) && isVisible(kp.right_ankle)
    ? angleAt(kp.right_hip, kp.right_knee, kp.right_ankle) : null;
  return l === null ? r : r === null ? l : Math.min(l, r);
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

function situpRise(kp) {
  const shoulders = avgValid([
    isVisible(kp.left_shoulder) ? kp.left_shoulder.y : null,
    isVisible(kp.right_shoulder) ? kp.right_shoulder.y : null,
  ]);
  const hips = avgValid([
    isVisible(kp.left_hip) ? kp.left_hip.y : null,
    isVisible(kp.right_hip) ? kp.right_hip.y : null,
  ]);
  const torso = avgValid([
    isVisible(kp.left_shoulder) && isVisible(kp.left_hip) ? dist(kp.left_shoulder, kp.left_hip) : null,
    isVisible(kp.right_shoulder) && isVisible(kp.right_hip) ? dist(kp.right_shoulder, kp.right_hip) : null,
  ]);
  if (shoulders === null || hips === null || !torso) return null;
  return (hips - shoulders) / torso;
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

// Elevación de cada rodilla respecto a la cadera, normalizada.
function kneeLiftValues(kp) {
  const t = torsoLength(kp);
  if (!t) return [null, null];
  const l = isVisible(kp.left_knee) && isVisible(kp.left_hip) ? (kp.left_hip.y - kp.left_knee.y) / t : null;
  const r = isVisible(kp.right_knee) && isVisible(kp.right_hip) ? (kp.right_hip.y - kp.right_knee.y) / t : null;
  return [l, r];
}

function maxKneeLift(kp) {
  const [l, r] = kneeLiftValues(kp);
  return l === null ? r : r === null ? l : Math.max(l, r);
}

function kneeToShoulderDistances(kp) {
  const torso = torsoLength(kp);
  if (!torso) return [null, null];
  const left = isVisible(kp.left_shoulder) && isVisible(kp.left_knee)
    ? dist(kp.left_shoulder, kp.left_knee) / torso : null;
  const right = isVisible(kp.right_shoulder) && isVisible(kp.right_knee)
    ? dist(kp.right_shoulder, kp.right_knee) / torso : null;
  return [left, right];
}

function maxKneeToShoulderDistance(kp) {
  const [left, right] = kneeToShoulderDistances(kp);
  return left === null ? right : right === null ? left : Math.max(left, right);
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
  lunge: { fn: (kps) => bentKneeAngle(byName(kps)), unit: 'grados de rodilla' },
  pushup: { fn: (kps) => elbowAngle(byName(kps)), unit: 'grados de codo' },
  situp: { fn: (kps) => situpRise(byName(kps)), unit: 'elevación normalizada del torso' },
  'jumping-jack': { fn: (kps) => avgValid([wristsAboveShoulders(byName(kps)), ankleSpread(byName(kps))]), unit: 'apertura normalizada' },
  'high-knees': {
    fn: (kps) => maxKneeLift(byName(kps)),
    cycleFns: (kps) => kneeLiftValues(byName(kps)),
    unit: 'elevación de rodilla',
  },
  'mountain-climber': {
    fn: (kps) => maxKneeToShoulderDistance(byName(kps)),
    cycleFns: (kps) => kneeToShoulderDistances(byName(kps)),
    unit: 'distancia normalizada rodilla-hombro',
  },
  burpee: { fn: (kps) => hipHeight(byName(kps)), unit: 'altura de cadera' },
};
