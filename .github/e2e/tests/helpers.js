// Email único por ejecución, para que relanzar los tests no choque con el
// "email ya registrado" del backend.
export function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.dev`;
}

/** Registra un usuario a través de la UI real y espera a que aterrice en "/". */
export async function registerViaUI(page, { name = 'Usuaria E2E', email = uniqueEmail(), password = 'password123' } = {}) {
  await page.goto('/login');
  await page.getByRole('button', { name: /¿No tienes cuenta\?/ }).click();
  await page.getByLabel('Nombre').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await page.waitForURL('/');
  return { name, email, password };
}

/** Lee el token JWT que Zustand (persist) guarda en localStorage tras el login/registro. */
export async function getAuthToken(page) {
  const raw = await page.evaluate(() => localStorage.getItem('hiit-auth'));
  return JSON.parse(raw).state.token;
}
