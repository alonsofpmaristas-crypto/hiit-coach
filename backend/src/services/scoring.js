import { HttpError } from '../utils/httpError.js';

const MAX_REPS_PER_SECOND = 2; // tope de plausibilidad (anti-trampas básico)

/**
 * Valida las repeticiones enviadas por el cliente y calcula la puntuación.
 * @param blocks     bloques de la sesión [{exerciseSlug, sets, workSeconds}]
 * @param exercises  ejercicios de BD [{slug, pointsPerRep}]
 * @param reps       { slug: numeroDeRepeticiones }
 */
export function scoreResult(blocks, exercises, reps) {
  const pointsBySlug = Object.fromEntries(exercises.map((e) => [e.slug, e.pointsPerRep]));
  const maxBySlug = {};
  for (const b of blocks) {
    maxBySlug[b.exerciseSlug] =
      (maxBySlug[b.exerciseSlug] ?? 0) + b.sets * b.workSeconds * MAX_REPS_PER_SECOND;
  }

  const cleanReps = {};
  let totalScore = 0;
  for (const [slug, count] of Object.entries(reps)) {
    if (!(slug in maxBySlug)) throw new HttpError(400, `El ejercicio "${slug}" no pertenece a la sesión`);
    if (count > maxBySlug[slug]) throw new HttpError(400, `Repeticiones no plausibles en "${slug}"`);
    cleanReps[slug] = count;
    totalScore += count * (pointsBySlug[slug] ?? 1);
  }
  return { cleanReps, totalScore };
}
