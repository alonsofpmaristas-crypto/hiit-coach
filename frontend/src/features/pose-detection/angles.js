// Geometría sobre keypoints de MoveNet (formato: { x, y, score, name }).

/** Ángulo en B (grados) formado por los segmentos B→A y B→C. */
export function angleAt(A, B, C) {
  const v1 = { x: A.x - B.x, y: A.y - B.y };
  const v2 = { x: C.x - B.x, y: C.y - B.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.hypot(v1.x, v1.y);
  const mag2 = Math.hypot(v2.x, v2.y);
  if (mag1 === 0 || mag2 === 0) return null;
  const cos = Math.min(1, Math.max(-1, dot / (mag1 * mag2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function byName(keypoints) {
  const map = {};
  for (const kp of keypoints) map[kp.name] = kp;
  return map;
}

/** Distancia hombro-cadera, usada para normalizar distancias por la escala de la persona. */
export function torsoLength(kp) {
  const l = dist(kp.left_shoulder, kp.left_hip);
  const r = dist(kp.right_shoulder, kp.right_hip);
  return avgValid([l, r]);
}

export function dist(A, B) {
  if (!A || !B) return null;
  return Math.hypot(A.x - B.x, A.y - B.y);
}

/** Media de los valores no nulos; null si no hay ninguno válido. */
export function avgValid(values) {
  const v = values.filter((x) => x !== null && x !== undefined && !Number.isNaN(x));
  if (!v.length) return null;
  return v.reduce((a, b) => a + b, 0) / v.length;
}

export const MIN_SCORE = 0.35;
export const isVisible = (kp) => !!kp && kp.score >= MIN_SCORE;
