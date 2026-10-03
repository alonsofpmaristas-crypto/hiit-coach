import { useAuthStore } from '../store/authStore';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function api(path, { method = 'GET', body } = {}) {
  const { token, logout } = useAuthStore.getState();
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No se puede conectar con el servidor. ¿Está arrancado el backend?');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) logout();
    throw new Error(data?.error ?? 'Ha ocurrido un error inesperado');
  }
  return data;
}
