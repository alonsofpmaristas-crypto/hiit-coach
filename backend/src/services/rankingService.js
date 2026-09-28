import { prisma } from '../lib/prisma.js';
import { getRange } from '../utils/dates.js';

/** Asigna posición con empates (mismo score => misma posición). */
export function assignPositions(rows) {
  const sorted = [...rows].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  let pos = 0, prev = null;
  return sorted.map((r, i) => {
    if (r.score !== prev) { pos = i + 1; prev = r.score; }
    return { ...r, position: pos };
  });
}

export async function computeRanking(type, limit = 100) {
  const { from, to } = getRange(type);
  const groups = await prisma.sessionResult.groupBy({
    by: ['userId'],
    where: { dailySession: { date: { gte: from, lt: to } } },
    _sum: { totalScore: true },
    _count: { _all: true },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: groups.map((g) => g.userId) } },
    select: { id: true, name: true },
  });
  const names = Object.fromEntries(users.map((u) => [u.id, u.name]));

  const rows = groups.map((g) => ({
    userId: g.userId,
    name: names[g.userId] ?? 'Usuario',
    score: g._sum.totalScore ?? 0,
    sessions: g._count._all,
  }));
  return { type, from, to, ranking: assignPositions(rows).slice(0, limit) };
}
