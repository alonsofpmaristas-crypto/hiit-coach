import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import logo from '../assets/hiit-coach-logo.svg';

const linkClass = ({ isActive }) =>
  `px-1 pb-1 border-b-2 font-medium ${isActive ? 'border-work' : 'border-transparent text-muted hover:text-ink'}`;

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" aria-label="HIIT Coach, inicio" className="shrink-0">
            <img src={logo} alt="HIIT Coach" className="h-11 w-auto" />
          </NavLink>
          <nav className="flex items-center gap-5">
            <NavLink to="/" end className={linkClass}>Sesión de hoy</NavLink>
            <NavLink to="/rankings" className={linkClass}>Rankings</NavLink>
            <NavLink to="/history" className={linkClass}>Progreso</NavLink>
            <NavLink to="/calibrate" className={linkClass}>Calibración</NavLink>
          </nav>
          {user ? (
            <button
              className="text-sm text-muted hover:text-ink"
              onClick={() => { logout(); navigate('/login'); }}
            >
              {user.name} · Salir
            </button>
          ) : (
            <NavLink to="/login" className="text-sm font-medium">Entrar</NavLink>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
