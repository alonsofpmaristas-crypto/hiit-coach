import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

const app = createApp();
const email = `integration-${Date.now()}-${Math.random().toString(36).slice(2)}@test.dev`;
const password = 'integration-password-123';
let userId;
let token;

after(async () => {
  if (userId) await prisma.user.deleteMany({ where: { id: userId } });
  await prisma.$disconnect();
});

test('API: registro, autenticación, sesión diaria, resultado e historial', async (t) => {
  await t.test('health check responde', async () => {
    const response = await request(app).get('/health');
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { ok: true });
  });

  await t.test('las rutas protegidas rechazan peticiones sin token', async () => {
    const response = await request(app).get('/api/sessions/today');
    assert.equal(response.status, 401);
    assert.equal(response.body.error, 'Token requerido');
  });

  await t.test('registro valida y crea un usuario', async () => {
    const invalid = await request(app).post('/api/auth/register').send({
      name: 'A',
      email,
      password: 'short',
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error, 'Datos inválidos');

    const response = await request(app).post('/api/auth/register').send({
      name: 'Integration User',
      email,
      password,
    });
    assert.equal(response.status, 201);
    assert.equal(response.body.user.email, email);
    assert.ok(response.body.token);
    assert.equal('passwordHash' in response.body.user, false);
    userId = response.body.user.id;
    token = response.body.token;
  });

  await t.test('login y endpoint de usuario autenticado funcionan', async () => {
    const login = await request(app).post('/api/auth/login').send({ email, password });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.id, userId);
    assert.ok(login.body.token);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, email);
  });

  let sessionId;
  let exerciseSlug;
  await t.test('sesión de hoy devuelve bloques con ejercicios', async () => {
    const response = await request(app)
      .get('/api/sessions/today')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(response.status, 200);
    assert.ok(response.body.id);
    assert.ok(response.body.blocks.length >= 5);
    assert.ok(response.body.blocks.every((block) => block.exercise?.slug === block.exerciseSlug));
    sessionId = response.body.id;
    exerciseSlug = response.body.blocks[0].exerciseSlug;
  });

  await t.test('envío de resultado calcula puntuación y evita duplicados', async () => {
    const invalid = await request(app)
      .post('/api/results')
      .set('Authorization', `Bearer ${token}`)
      .send({ dailySessionId: sessionId, repsByExercise: { unknown: 8 } });
    assert.equal(invalid.status, 400);

    const result = await request(app)
      .post('/api/results')
      .set('Authorization', `Bearer ${token}`)
      .send({ dailySessionId: sessionId, repsByExercise: { [exerciseSlug]: 8 } });
    assert.equal(result.status, 201);
    assert.equal(result.body.repsByExercise[exerciseSlug], 8);
    assert.ok(result.body.totalScore > 0);

    const duplicate = await request(app)
      .post('/api/results')
      .set('Authorization', `Bearer ${token}`)
      .send({ dailySessionId: sessionId, repsByExercise: { [exerciseSlug]: 8 } });
    assert.equal(duplicate.status, 409);
  });

  await t.test('historial y ranking incluyen el resultado guardado', async () => {
    const history = await request(app)
      .get('/api/results/me')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(history.status, 200);
    assert.ok(history.body.some((result) => result.dailySessionId === sessionId));

    const summary = await request(app)
      .get('/api/results/me/summary')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(summary.status, 200);
    assert.equal(summary.body.totalSessions, 1);
    assert.equal(summary.body.totalReps, 8);

    const ranking = await request(app).get('/api/rankings/daily');
    assert.equal(ranking.status, 200);
    assert.ok(ranking.body.ranking.some((row) => row.userId === userId));
  });
});
