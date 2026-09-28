# Fase 1 — Backend

## Arranque rápido
```bash
docker compose up -d
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## API
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | /api/auth/register | – | Registro → `{ token, user }` |
| POST | /api/auth/login | – | Login → `{ token, user }` |
| GET | /api/auth/me | JWT | Usuario actual |
| GET | /api/sessions/today | JWT | Sesión del día (se genera si no existe) |
| POST | /api/results | JWT | Envía `{ dailySessionId, repsByExercise }` |
| GET | /api/results/me | JWT | Historial del usuario |
| GET | /api/rankings/:type | – | `daily`, `weekly` o `monthly` |

Evento Socket.IO: `ranking:updated` (servidor → clientes).
