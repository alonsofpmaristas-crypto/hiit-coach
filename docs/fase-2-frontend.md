# Fase 2 — Frontend base

## Arranque
```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```
El backend debe estar en marcha (`npm run dev` en `backend/`).

## Pantallas
- `/login`: entrar o crear cuenta.
- `/` (protegida): sesión de hoy con la tira de intervalos trabajo/descanso.
- `/rankings`: diario, semanal y mensual; se actualiza en vivo por Socket.IO.

## Decisiones
- Tailwind v4 con el plugin de Vite: los colores y fuentes están como tokens en `src/index.css`.
- Zustand con `persist`: el token JWT sobrevive a recargas (clave `hiit-auth` en localStorage).
- `services/api.js` añade el token y cierra sesión automáticamente ante un 401.
- Tipografías con `@fontsource`: se empaquetan en el build, sin depender de Google Fonts.
