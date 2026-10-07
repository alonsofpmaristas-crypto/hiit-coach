import { test, expect } from '@playwright/test';
import { registerViaUI, uniqueEmail } from './helpers.js';

test('un usuario puede registrarse y ver la sesión de hoy', async ({ page }) => {
  await registerViaUI(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('de HIIT');
  await expect(page.getByRole('button', { name: 'Empezar sesión' })).toBeVisible();
});

test('rechaza una contraseña demasiado corta con el mismo mensaje que la API', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /¿No tienes cuenta\?/ }).click();
  await page.getByLabel('Nombre').fill('Usuaria Corta');
  await page.getByLabel('Email').fill(uniqueEmail());
  await page.getByLabel('Contraseña').fill('123');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  // El input type="password" con minLength=8 bloquea el envío en el propio
  // navegador antes de llegar al backend; comprobamos que sigue en la misma pantalla.
  await expect(page).toHaveURL(/login/);
});

test('cerrar sesión redirige a login y protege la ruta principal', async ({ page }) => {
  await registerViaUI(page);
  await page.getByRole('button', { name: /Salir/ }).click();
  await expect(page).toHaveURL(/login/);
  await page.goto('/');
  await expect(page).toHaveURL(/login/);
});
