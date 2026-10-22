import { defineConfig } from '@playwright/test';

// Arranca backend y frontend en modo dev antes de los tests, y los reutiliza
// si ya están corriendo (útil en local; en CI siempre arrancan limpios).
// Requiere que `docker compose up -d` y las migraciones ya se hayan
// ejecutado antes (ver docs/fase-5-tests-despliegue.md).
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // los tests comparten sesión diaria y ranking: en serie es más predecible
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:4000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
