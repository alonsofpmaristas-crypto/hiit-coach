# HIIT Coach — Sesiones de HIIT con conteo de repeticiones por visión artificial

Trabajo de Fin de Máster (TFM)

> **Nota:** este README describe la arquitectura y el stack propuestos para el proyecto. Ajusta los nombres de carpetas, comandos y tecnologías concretas a medida que avance la implementación.

---

## a. Descripción general del proyecto

**HIIT Coach** es una aplicación web que permite a los usuarios realizar sesiones diarias de entrenamiento HIIT (High Intensity Interval Training) guiadas, utilizando únicamente la cámara de su propio dispositivo.

Cada día del mes la plataforma publica una **sesión de HIIT distinta**, compuesta por una combinación de ejercicios variados (burpees, flexiones, abdominales, jumping jacks, sentadillas, lunges, etc.), organizados en series con tiempos de trabajo y descanso.

Cuando un usuario inicia la sesión del día:

1. Se activa la cámara de su dispositivo.
2. Un módulo de visión artificial (pose estimation) analiza su movimiento en tiempo real.
3. La aplicación detecta y cuenta automáticamente las repeticiones **correctas** de cada ejercicio (validando el rango de movimiento).
4. Al finalizar, el resultado se envía al backend y se agrega a los sistemas de puntuación.

Con los resultados de todos los usuarios que completan la sesión de un día concreto, la aplicación genera:

- **Ranking diario**: repeticiones/puntuación de la sesión del día.
- **Ranking semanal**: acumulado de las sesiones de la semana.
- **Ranking mensual**: acumulado de todas las sesiones del mes.

El objetivo es fomentar la actividad física mediante gamificación (competición entre usuarios) y facilitar el entrenamiento guiado sin necesidad de equipamiento ni de que un entrenador supervise físicamente al usuario.

### Casos de uso principales
- Un usuario se registra, entra cada día y hace "la sesión del día".
- Un usuario compite en los rankings diarios/semanales/mensuales con otros usuarios.
- Un usuario consulta su historial de sesiones y evolución de repeticiones.

---

## b. Stack tecnológico utilizado

> **Todo el stack es 100% gratuito**: solo se usan librerías/frameworks open source (sin licencia de pago) y, para el despliegue, únicamente niveles gratuitos ("free tier") de proveedores cloud. Se indican los límites de cada free tier para tenerlos en cuenta en un TFM (tráfico y almacenamiento reducidos, pero suficientes para una demo/defensa).

### Frontend
- **React** (Vite) — SPA principal. *(Open source, gratis)*
- **TensorFlow.js** con el modelo **MoveNet** (o **MediaPipe Pose** de Google) — estimación de pose corporal en el navegador, en tiempo real, a partir del stream de la cámara (`getUserMedia`). *(Open source, gratis, corre en el cliente sin coste de servidor)*
- **Zustand** — gestión de estado (sesión activa, contador de reps, cronómetro). *(Open source, gratis)*
- **Socket.IO Client** — comunicación en tiempo real con el backend. *(Open source, gratis)*
- **TailwindCSS** — estilos. *(Open source, gratis)*
- **Chart.js** — visualización de progreso y estadísticas del usuario. *(Open source, gratis)*

### Backend
- **Node.js + Express** — API REST. *(Open source, gratis)*
- **Socket.IO Server** — canal en tiempo real para rankings en vivo. *(Open source, gratis)*
- **PostgreSQL** — base de datos relacional. *(Open source, gratis)*
- **Prisma ORM** — acceso a base de datos y migraciones. *(Open source, gratis)*
- **JWT (jsonwebtoken) + bcrypt** — autenticación y gestión segura de contraseñas. *(Open source, gratis)*

### Hosting / despliegue (todo con planes gratuitos)
- **Frontend** → **Vercel** o **Netlify** (free tier): despliegue directo desde GitHub, HTTPS incluido, sin coste mientras el tráfico se mantenga dentro de los límites gratuitos (más que suficiente para un TFM).
- **Backend** → **Render** (free tier de Web Services) o **Railway** (plan gratuito con horas incluidas): despliegue del servidor Node/Express y del socket. *Limitación a tener en cuenta:* en el free tier, Render "duerme" el servicio tras un rato de inactividad (arranque en frío al recibir la primera petición).
- **Base de datos** → **Supabase** o **Neon** (PostgreSQL gratuito en la nube, sin necesidad de tarjeta) o, alternativamente, **Railway PostgreSQL** (free tier). Cualquiera de las dos ofrece suficiente almacenamiento para el volumen de datos de un TFM.
- **Repositorio y CI/CD** → **GitHub** (repos públicos o privados gratis) + **GitHub Actions** (minutos gratuitos incluidos para tests y build).

### Entorno de desarrollo local
- **Docker + Docker Compose** — para levantar Postgres localmente sin instalarlo en el sistema. *(Open source, gratis)*

### Testing
- **Jest** + **React Testing Library** — tests unitarios frontend. *(Open source, gratis)*
- **Jest / Supertest** — tests de la API backend. *(Open source, gratis)*
- **Cypress** o **Playwright** — tests end-to-end. *(Open source, gratis)*

> El modelo de pose estimation corre **en el cliente** (navegador) para no depender de subir vídeo continuo al servidor: esto no solo reduce la latencia y protege la privacidad del usuario, sino que además evita costes de cómputo en la nube (no hace falta GPU ni servicios de inferencia de pago). El backend solo recibe el resumen numérico de la sesión (repeticiones válidas por ejercicio), no el vídeo.

### Alternativas descartadas (por tener coste o límites poco prácticos para un TFM)
- Servicios de pose estimation en la nube de pago (p. ej. APIs de terceros por llamada).
- Redis gestionado de pago — si se necesita caché, usar **Upstash** (free tier de Redis) en vez de un servicio de pago.
- VPS de pago (DigitalOcean, AWS EC2, etc.) — sustituido por Render/Railway free tier.

---

## c. Información sobre su instalación y ejecución

### Requisitos previos
- Node.js ≥ 18
- npm o pnpm
- Docker y Docker Compose (recomendado para levantar la base de datos)
- Navegador con acceso a cámara (Chrome/Edge recomendados por soporte de WebGL/TensorFlow.js)

### Clonar el repositorio
```bash
git clone https://github.com/<usuario>/hiit-coach.git
cd hiit-coach
```

### Variables de entorno
Crear un archivo `.env` en `backend/` a partir de `.env.example`:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5433/hiitcoach"
JWT_SECRET="cambia_este_valor"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

Y otro en `frontend/`:
```env
VITE_API_URL="http://localhost:4000"
VITE_SOCKET_URL="http://localhost:4000"
```

### Levantar servicios con Docker (base de datos)
```bash
docker compose up -d
```

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```
El servidor quedará disponible en `http://localhost:4000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
La aplicación quedará disponible en `http://localhost:5173`.

### Ejecutar tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# E2E
npm run test:e2e
```

### Build de producción
```bash
cd frontend && npm run build
cd backend && npm run build && npm start
```

---

## d. Estructura del proyecto

```
hiit-coach/
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes UI reutilizables
│   │   ├── features/
│   │   │   ├── session/        # Lógica de la sesión HIIT en curso
│   │   │   ├── pose-detection/ # Integración con TensorFlow.js / MoveNet
│   │   │   ├── rankings/       # Vistas de rankings diario/semanal/mensual
│   │   │   └── auth/           # Login / registro
│   │   ├── hooks/               # Hooks personalizados (useCamera, useRepCounter...)
│   │   ├── services/             # Llamadas API y sockets
│   │   ├── store/                 # Estado global
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/         # Controladores de rutas
│   │   ├── routes/               # Definición de endpoints REST
│   │   ├── services/              # Lógica de negocio (rankings, sesiones)
│   │   ├── sockets/                # Eventos Socket.IO
│   │   ├── middlewares/            # Auth, validación, manejo de errores
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo de datos
│   │   └── migrations/
│   └── package.json
│
├── docker-compose.yml
├── .github/workflows/            # CI/CD
└── README.md
```

### Modelo de datos (resumen)
- **User**: id, nombre, email, password_hash, fecha_registro.
- **Exercise**: id, nombre, tipo, descripción, articulaciones clave para su detección.
- **DailySession**: id, fecha, lista de ejercicios/series/tiempos.
- **SessionResult**: id, user_id, daily_session_id, repeticiones por ejercicio, puntuación total, fecha.
- **Ranking** (vista o tabla calculada): tipo (diario/semanal/mensual), user_id, puntuación agregada, posición.

---

## e. Funcionalidades principales

- **Autenticación de usuarios**: registro, login y perfil (JWT).
- **Sesión de HIIT diaria**: cada día se genera/publica automáticamente una rutina distinta con ejercicios variados y temporizador de series/descansos.
- **Conteo de repeticiones en tiempo real mediante visión artificial**: uso de la cámara del dispositivo y un modelo de pose estimation para detectar y contar solo las repeticiones ejecutadas con el rango de movimiento correcto.
- **Feedback en vivo durante el ejercicio**: contador de repeticiones, cronómetro y (opcional) indicaciones visuales sobre la postura.
- **Registro automático de resultados**: al terminar la sesión, se guarda el número de repeticiones válidas por ejercicio y la puntuación total del usuario.
- **Rankings competitivos**:
  - Ranking diario (usuarios que hicieron la sesión de ese día).
  - Ranking semanal (acumulado de la semana).
  - Ranking mensual (acumulado del mes).
- **Historial y estadísticas personales**: evolución de repeticiones y puntuación del usuario a lo largo del tiempo.
- **Panel de administración** (opcional/futuro): creación y edición de sesiones diarias y ejercicios disponibles.

### Posibles mejoras futuras
- Detección de errores de forma/postura (no solo contar, sino corregir).
- Modo "reto entre amigos" o ligas privadas.
- Notificaciones push recordando la sesión del día.
- Soporte offline con sincronización posterior de resultados.
