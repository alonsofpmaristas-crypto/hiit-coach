import { prisma } from '../lib/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { mulberry32, shuffle } from '../utils/random.js';
import { startOfUTCDay } from '../utils/dates.js';

/** Devuelve la sesión del día; si no existe, la genera de forma determinista. */
export async function getOrCreateSessionForDate(date = startOfUTCDay()) {
  const existing = await prisma.dailySession.findUnique({ where: { date } });
  if (existing) return existing;

  const exercises = await prisma.exercise.findMany({ orderBy: { id: 'asc' } });
  if (exercises.length < 5) {
    throw new HttpError(503, 'No hay ejercicios suficientes. Ejecuta el seed (npm run db:seed).');
  }

  const seed = Number(date.toISOString().slice(0, 10).replaceAll('-', ''));
  const picked = shuffle(exercises, mulberry32(seed)).slice(0, 5);
  const blocks = picked.map((e) => ({
    exerciseSlug: e.slug, sets: 3, workSeconds: 40, restSeconds: 20,
  }));

  try {
    return await prisma.dailySession.create({
      data: { date, title: `Sesión HIIT del ${date.toISOString().slice(0, 10)}`, blocks },
    });
  } catch (e) {
    if (e.code === 'P2002') return prisma.dailySession.findUnique({ where: { date } }); // carrera
    throw e;
  }
}

/** Sesión + detalle de cada ejercicio (para que el frontend pinte la rutina). */
export async function withExercises(session) {
  const slugs = session.blocks.map((b) => b.exerciseSlug);
  const exercises = await prisma.exercise.findMany({ where: { slug: { in: slugs } } });
  const bySlug = Object.fromEntries(exercises.map((e) => [e.slug, e]));
  return { ...session, blocks: session.blocks.map((b) => ({ ...b, exercise: bySlug[b.exerciseSlug] })) };
}
