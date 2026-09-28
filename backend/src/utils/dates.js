// Todas las fechas de sesión/ranking se manejan en UTC para evitar ambigüedades.
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);

export const startOfUTCDay = (d = new Date()) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/** Rango [from, to) de un ranking. La semana empieza en lunes. */
export function getRange(type, ref = new Date()) {
  const day = startOfUTCDay(ref);
  if (type === 'daily') return { from: day, to: addDays(day, 1) };
  if (type === 'weekly') {
    const offset = (day.getUTCDay() + 6) % 7; // lunes = 0
    const from = addDays(day, -offset);
    return { from, to: addDays(from, 7) };
  }
  if (type === 'monthly') {
    const y = day.getUTCFullYear(), m = day.getUTCMonth();
    return { from: new Date(Date.UTC(y, m, 1)), to: new Date(Date.UTC(y, m + 1, 1)) };
  }
  throw new Error(`Tipo de ranking inválido: ${type}`);
}
