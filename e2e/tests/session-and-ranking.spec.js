import { test, expect } from '@playwright/test';
import { registerViaUI, getAuthToken } from './helpers.js';

// La cámara y el modelo de pose (MoveNet) no se ejercitan aquí: no hay cámara
// real en un runner de CI, y simularla con un vídeo falso seguiría exigiendo
// cargar y correr TensorFlow.js contra el modelo real, lento y poco fiable
// en este contexto. En vez de eso, el envío del resultado se hace llamando
// a la API directamente, igual que haría el formulario final de la sesión
// (ver docs/fase-5-tests-despliegue.md para la checklist manual que sí
// cubre la cámara). Lo que este test SÍ verifica de extremo a extremo es el
// resto del flujo real: registro, sesión del día, guardado del resultado y
// que aparece en el ranking y en el historial.
test('completar una sesión (vía API) la refleja en el ranking y en el historial', async ({ page, request }) => {
  const user = await registerViaUI(page);
  const token = await getAuthToken(page);
  const headers = { Authorization: `Bearer ${token}` };

  const todayRes = await request.get('http://localhost:4000/api/sessions/today', { headers });
  expect(todayRes.ok()).toBeTruthy();
  const session = await todayRes.json();
  const slug = session.blocks[0].exerciseSlug;

  const submitRes = await request.post('http://localhost:4000/api/results', {
    headers,
    data: { dailySessionId: session.id, repsByExercise: { [slug]: 8 } },
  });
  expect(submitRes.ok()).toBeTruthy();

  await page.goto('/rankings');
  await expect(page.getByText(user.name)).toBeVisible();

  await page.goto('/history');
  await expect(page.getByText('1 d')).toBeVisible(); // racha de un día
  await expect(page.getByText('1', { exact: true })).toBeVisible(); // sesión totales = 1
});

test('el ranking se actualiza en vivo cuando otra persona completa la sesión', async ({ browser, request }) => {
  const viewerPage = await (await browser.newContext()).newPage();
  const scorerPage = await (await browser.newContext()).newPage();

  await registerViaUI(viewerPage);
  const scorer = await registerViaUI(scorerPage);
  const token = await getAuthToken(scorerPage);

  await viewerPage.goto('/rankings');
  await expect(viewerPage.getByText('En vivo')).toBeVisible();

  const headers = { Authorization: `Bearer ${token}` };
  const todayRes = await request.get('http://localhost:4000/api/sessions/today', { headers });
  const session = await todayRes.json();
  const slug = session.blocks[0].exerciseSlug;
  await request.post('http://localhost:4000/api/results', {
    headers,
    data: { dailySessionId: session.id, repsByExercise: { [slug]: 15 } },
  });

  // Sin recargar: el socket debe traer la fila de "scorer" a la página que
  // ya estaba abierta en viewerPage.
  await expect(viewerPage.getByText(scorer.name)).toBeVisible({ timeout: 5000 });
});
