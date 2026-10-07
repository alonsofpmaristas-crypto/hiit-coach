# Fase 5 — Tests de integración, E2E y despliegue

## 1. Tests de integración (Supertest)

A diferencia de `test/unit` (Fase 1), que prueba funciones puras sin
dependencias, `test/integration` lanza peticiones HTTP reales contra la
app de Express con una base de datos Postgres real detrás — comprueba que
rutas, middlewares, Prisma y validación encajan entre sí.

**Por qué una base de datos separada:** `resetDatabase()` borra todas las
filas antes de cada test. Si apuntara a la base de desarrollo, cada
ejecución de tests destruiría tus datos. Por eso:
- `docker-compose.yml` añade un segundo contenedor, `db-test`, en el puerto 5433.
- `test/integration/setup.js` **se niega a arrancar** si `DATABASE_URL` no
  contiene la palabra `test`, como salvaguarda adicional.

```bash
docker compose up -d          # levanta db y db-test
cd backend
cp .env.test.example .env.test
npm install
npm run test:integration      # aplica el esquema a db-test, siembra y corre los tests
```

`npm test` (sin `:integration`) sigue ejecutando solo los tests unitarios,
rápidos y sin dependencias — es el que correrías en cada guardado.

## 2. End-to-end (Playwright)

Viven en `/e2e`, fuera de `frontend/` y `backend/`, porque conducen a los
dos servidores a la vez. `playwright.config.js` los arranca solos con
`npm run dev` en cada carpeta.

```bash
docker compose up -d
cd backend && cp .env.example .env && npm install && npx prisma migrate dev && npm run db:seed && cd ..
cd frontend && cp .env.example .env && npm install && cd ..
cd e2e && npm install && npx playwright install chromium && npm run test:e2e
```

**Qué cubren y qué no.** `auth.spec.js` y `session-and-ranking.spec.js`
recorren registro, login, cierre de sesión, sesión del día, envío de
resultado, ranking (incluida la actualización **en vivo** por socket entre
dos sesiones de navegador distintas) e historial — con navegador real, no
simulado.

Lo que no cubren es la cámara y el modelo de pose en sí: no hay cámara en
un runner de CI, y simular un vídeo falso seguiría exigiendo cargar y
correr TensorFlow.js/MoveNet de verdad, lento y poco fiable en ese
contexto. En su lugar, el envío del resultado se hace llamando a la API
directamente (`request.post(...)`), igual que haría el botón final de la
sesión. Esa parte se verifica con la checklist manual de
`docs/checklist-manual-camara.md`. Es una limitación real que conviene
reconocer tal cual en la memoria del TFM, no disimular.

## 3. CI (GitHub Actions)

`.github/workflows/ci.yml` tiene tres jobs:
- **backend**: levanta un Postgres de servicio, corre `npm test` (unitarios)
  y luego los de integración.
- **frontend**: `npm run build`.
- **e2e**: levanta su propio Postgres, siembra los ejercicios, instala
  Playwright y navegadores, y corre la suite completa. Si falla, sube el
  informe de Playwright como artefacto para poder inspeccionarlo.

## 4. Despliegue (free tier)

### Base de datos — Neon o Supabase
Crea un proyecto Postgres gratuito y copia la cadena de conexión
(`postgresql://...`). Ejecuta las migraciones una vez contra ella:
```bash
DATABASE_URL="postgresql://neondb_owner:npg_6Uq5scAgPVwR@ep-shiny-water-b1hmlb24-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma migrate deploy
DATABASE_URL="postgresql://neondb_owner:npg_6Uq5scAgPVwR@ep-shiny-water-b1hmlb24-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run db:seed
```

### Backend — Render
`render.yaml` en la raíz es un blueprint: al conectar el repo en Render
("New +" → "Blueprint"), propone el servicio ya configurado (`rootDir:
backend`, build, start con `prisma migrate deploy` antes de arrancar).
Faltan por rellenar a mano en el panel:
- `DATABASE_URL`: la cadena de Neon/Supabase.
- `CLIENT_URL`: la URL que te dé Vercel en el paso siguiente.

**Free tier de Render:** el servicio se duerme tras ~15 min sin tráfico; la
primera petición tras dormir tarda unos segundos (arranque en frío). Normal
para una demo de TFM, pero conviene mencionarlo si la defensa es en vivo:
abre la app un par de minutos antes.

### Frontend — Vercel
Importa el repo en Vercel, selecciona `frontend` como Root Directory
(`vercel.json` ya fija el comando de build y las reescrituras para que
las rutas de React Router funcionen al recargar). Variables de entorno:
- `VITE_API_URL` y `VITE_SOCKET_URL`: la URL que te dé Render.

### Orden recomendado
1. Base de datos (Neon/Supabase) → migraciones + seed.
2. Backend (Render) con `DATABASE_URL` ya disponible.
3. Frontend (Vercel) con la URL del backend ya disponible.
4. Vuelve a Render y actualiza `CLIENT_URL` con la URL real de Vercel
   (si la pusiste antes de conocerla, CORS bloqueará las peticiones).

## 5. Qué contar en la memoria sobre esta fase
- La separación test unitario / integración / E2E, y por qué cada capa
  prueba algo que las otras no (funciones puras aisladas → piezas del
  backend encajando con una BD real → la aplicación completa en un
  navegador real).
- La decisión consciente de no automatizar la cámara en CI, y cómo se
  compensa con una checklist manual.
- Las limitaciones del free tier (arranque en frío de Render) como parte
  del análisis de stack del propio README, no como algo descubierto tarde.
