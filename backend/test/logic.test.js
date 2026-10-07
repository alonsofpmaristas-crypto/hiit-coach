import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getRange } from '../src/utils/dates.js';
import { scoreResult } from '../src/services/scoring.js';
import { mulberry32, shuffle } from '../src/utils/random.js';
import { computeStreak } from '../src/utils/streak.js';
import { isAllowedOrigin } from '../src/utils/cors.js';

test('rango semanal empieza en lunes', () => {
  const { from, to } = getRange('weekly', new Date('2026-09-30T10:00:00Z')); // miércoles
  assert.equal(from.toISOString().slice(0, 10), '2026-09-28');
  assert.equal(to.toISOString().slice(0, 10), '2026-10-05');
});

test('rango mensual', () => {
  const { from, to } = getRange('monthly', new Date('2026-09-28T00:00:00Z'));
  assert.equal(from.toISOString().slice(0, 10), '2026-09-01');
  assert.equal(to.toISOString().slice(0, 10), '2026-10-01');
});

test('puntuación = reps * puntos por ejercicio', () => {
  const blocks = [{ exerciseSlug: 'squat', sets: 3, workSeconds: 40 }, { exerciseSlug: 'burpee', sets: 3, workSeconds: 40 }];
  const exercises = [{ slug: 'squat', pointsPerRep: 1 }, { slug: 'burpee', pointsPerRep: 3 }];
  const { totalScore } = scoreResult(blocks, exercises, { squat: 30, burpee: 10 });
  assert.equal(totalScore, 60);
});

test('rechaza ejercicios ajenos y reps imposibles', () => {
  const blocks = [{ exerciseSlug: 'squat', sets: 1, workSeconds: 10 }];
  const exercises = [{ slug: 'squat', pointsPerRep: 1 }];
  assert.throws(() => scoreResult(blocks, exercises, { pushup: 5 }), /no pertenece/);
  assert.throws(() => scoreResult(blocks, exercises, { squat: 999 }), /no plausibles/);
});

test('la sesión diaria es determinista por semilla', () => {
  const a = shuffle([1, 2, 3, 4, 5, 6, 7, 8], mulberry32(20260928));
  const b = shuffle([1, 2, 3, 4, 5, 6, 7, 8], mulberry32(20260928));
  assert.deepEqual(a, b);
});

test('la racha cuenta días consecutivos hasta hoy', () => {
  const today = new Date('2026-09-29T00:00:00Z');
  const day = (n) => new Date(Date.UTC(2026, 8, n));
  const streak = computeStreak([day(29), day(28), day(27), day(24)], today);
  assert.equal(streak, 3);
});

test('la racha cuenta desde ayer si hoy aún no se ha entrenado', () => {
  const today = new Date('2026-09-29T00:00:00Z');
  const day = (n) => new Date(Date.UTC(2026, 8, n));
  const streak = computeStreak([day(28), day(27)], today);
  assert.equal(streak, 2);
});

test('la racha es 0 si se rompió antes de ayer', () => {
  const today = new Date('2026-09-29T00:00:00Z');
  const day = (n) => new Date(Date.UTC(2026, 8, n));
  const streak = computeStreak([day(25)], today);
  assert.equal(streak, 0);
});

test('CORS permite producción y previews del proyecto Vercel configurado', () => {
  const config = {
    clientUrl: 'https://hiit-coach-iota.vercel.app',
    vercelPreviewTeamSlug: 'alonso-fpm-aristas',
  };

  assert.equal(isAllowedOrigin(config.clientUrl, config), true);
  assert.equal(
    isAllowedOrigin('https://hiit-coach-dfp9bvyu1-alonso-fpm-aristas.vercel.app', config),
    true,
  );
  assert.equal(
    isAllowedOrigin('https://hiit-coach-git-main-alonso-fpm-aristas.vercel.app', config),
    true,
  );
  assert.equal(isAllowedOrigin('https://other-project-alonso-fpm-aristas.vercel.app', config), false);
  assert.equal(isAllowedOrigin('https://hiit-coach-preview.vercel.app', config), false);
  assert.equal(
    isAllowedOrigin('https://hiit-coach-preview-alonso-fpm-aristas.vercel.app.evil.com', config),
    false,
  );
});
