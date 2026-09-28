import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { HttpError, asyncHandler } from '../utils/httpError.js';
import { startOfUTCDay } from '../utils/dates.js';
import { scoreResult } from '../services/scoring.js';

const submitSchema = z.object({
  dailySessionId: z.number().int().positive(),
  repsByExercise: z.record(z.string(), z.number().int().min(0).max(1000)),
});

export const submitResult = asyncHandler(async (req, res) => {
  const { dailySessionId, repsByExercise } = submitSchema.parse(req.body);

  const session = await prisma.dailySession.findUnique({ where: { id: dailySessionId } });
  if (!session) throw new HttpError(404, 'Sesión no encontrada');
  if (session.date.getTime() !== startOfUTCDay().getTime()) {
    throw new HttpError(400, 'Solo se puede enviar el resultado de la sesión de hoy');
  }

  const exercises = await prisma.exercise.findMany({
    where: { slug: { in: session.blocks.map((b) => b.exerciseSlug) } },
  });
  const { cleanReps, totalScore } = scoreResult(session.blocks, exercises, repsByExercise);

  let result;
  try {
    result = await prisma.sessionResult.create({
      data: { userId: req.userId, dailySessionId, repsByExercise: cleanReps, totalScore },
    });
  } catch (e) {
    if (e.code === 'P2002') throw new HttpError(409, 'Ya has completado la sesión de hoy');
    throw e;
  }

  req.app.get('io')?.emit('ranking:updated', { date: session.date });
  res.status(201).json(result);
});

export const myHistory = asyncHandler(async (req, res) => {
  const results = await prisma.sessionResult.findMany({
    where: { userId: req.userId },
    include: { dailySession: { select: { date: true, title: true } } },
    orderBy: { completedAt: 'desc' },
    take: 90,
  });
  res.json(results);
});
