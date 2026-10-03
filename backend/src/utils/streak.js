import { startOfUTCDay } from './dates.js';

/**
 * Racha de días consecutivos con sesión completada, contando hacia atrás
 * desde hoy. Si hoy todavía no se ha completado, se cuenta desde ayer (para
 * no "romper" la racha a media noche mientras el usuario aún puede entrenar).
 */
export function computeStreak(sessionDates, today = startOfUTCDay()) {
  const days = new Set(sessionDates.map((d) => d.getTime()));
  const oneDay = 86400000;
  let cursor = today.getTime();
  if (!days.has(cursor)) cursor -= oneDay;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= oneDay;
  }
  return streak;
}
