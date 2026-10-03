import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import logo from '../../assets/hiit-coach-logo.svg';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const { token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = mode === 'login' ? { email: form.email, password: form.password } : form;
      setAuth(await api(`/auth/${mode}`, { method: 'POST', body }));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const input = 'mt-1 w-full rounded border border-line bg-white px-3 py-2';

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <img src={logo} alt="HIIT Coach" className="mx-auto mb-8 h-16 w-auto" />
      <h1 className="text-center font-display text-5xl font-bold leading-none">
        {mode === 'login' ? 'Entra y suda' : 'Crea tu cuenta'}
      </h1>
      <p className="mt-3 text-muted">Una sesión de HIIT nueva cada día, contada por tu cámara.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === 'register' && (
          <label className="block text-sm font-medium">
            Nombre
            <input className={input} value={form.name} onChange={update('name')} autoComplete="name" required minLength={2} />
          </label>
        )}
        <label className="block text-sm font-medium">
          Email
          <input className={input} type="email" value={form.email} onChange={update('email')} autoComplete="email" required />
        </label>
        <label className="block text-sm font-medium">
          Contraseña
          <input
            className={input} type="password" value={form.password} onChange={update('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : 1}
          />
          {mode === 'register' && <span className="text-xs text-muted">Mínimo 8 caracteres.</span>}
        </label>

        {error && <p role="alert" className="rounded bg-work/10 px-3 py-2 text-sm text-work">{error}</p>}

        <button disabled={busy} className="w-full rounded bg-ink py-2.5 font-semibold text-white disabled:opacity-50">
          {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <button
        className="mt-6 text-sm text-muted underline"
        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
      >
        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
      </button>
    </div>
  );
}
