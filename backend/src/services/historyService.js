import { prisma } from '../lib/prisma.js';
import { computeStreak } from '../utils/streak.js';

export async function getHistorySummary(userId) {
  const results = await prisma.sessionResult.findMany({
    where: { userId },
    include: { dailySession: { select: { date: true } } },
  });

  const totalSessions = results.length;
  const totalReps = results.reduce(
    (sum, r) => sum + Object.values(r.repsByExercise).reduce((a, b) => a + b, 0),
    0,
  );
  const bestScore = results.reduce((max, r) => Math.max(max, r.totalScore), 0);
  const streak = computeStreak(results.map((r) => r.dailySession.date));

  return { totalSessions, totalReps, bestScore, streak };
}
