# Fase 4 — Historial, rachas y pulido del ranking en vivo

## Backend

### `GET /api/results/me/summary` (nuevo, requiere JWT)
Devuelve un resumen agregado del usuario:
```json
{ "totalSessions": 12, "totalReps": 840, "bestScore": 210, "streak": 4 }
```

- `streak`: días **consecutivos** con sesión completada, contando hacia atrás
  desde hoy. Si hoy aún no se ha entrenado, cuenta desde ayer (para no
  "romper" la racha a las 00:00 mientras el usuario todavía puede hacerla).
  La lógica pura vive en `src/utils/streak.js`, separada de
  `historyService.js` (que sí toca Prisma), para poder testearla sin
  necesitar una base de datos real — son los tests
  `la racha cuenta...` en `test/logic.test.js`.

## Frontend

### `/history` — Tu progreso
- Cuatro indicadores: racha actual, sesiones totales, repeticiones totales y
  mejor puntuación (`GET /results/me/summary`).
- Gráfico de barras con **Chart.js** de la puntuación de las últimas 14
  sesiones (`GET /results/me`), con la sesión más reciente resaltada en
  naranja.
- Listado de las últimas 20 sesiones con fecha y puntuación.

### Ranking en vivo, con estado visible
`RankingsPage` ahora muestra un punto de estado ("En vivo" / "Conectando…")
en función del propio evento `connect`/`disconnect` del socket, y resalta
brevemente la tabla cuando llega un `ranking:updated`, para que el
"tiempo real" sea perceptible y no solo funcional.

### Aviso de sesión ya completada
`TodayPage` consulta el historial del usuario y, si la sesión de hoy ya está
en él, muestra un aviso y cambia el texto del botón a "Repetir sesión" en
vez de dejar que el usuario descubra el error 409 al enviar el resultado.

## Arranque
```bash
cd backend && npm install && npx prisma generate && npm test
cd ../frontend && npm install && npm run dev
```

## Siguiente: Fase 5
Tests de integración con Supertest sobre la API, tests E2E con Playwright
del flujo completo (registro → sesión → ranking), despliegue en
Vercel/Render/Neon y la memoria del TFM.
