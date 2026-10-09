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
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3">
          <NavLink to="/" aria-label="HIIT Coach, inicio" className="shrink-0">
            <img src={logo} alt="HIIT Coach" className="h-9 w-auto sm:h-11" />
          </NavLink>
          {user ? (
            <button
              className="max-w-[45%] truncate text-right text-sm text-muted hover:text-ink sm:order-last"
              onClick={() => { logout(); navigate('/login'); }}
            >
              {user.name} · Salir
            </button>
          ) : (
            <NavLink to="/login" className="text-sm font-medium sm:order-last">Entrar</NavLink>
          )}
          <nav className="order-last flex w-full items-center gap-5 overflow-x-auto whitespace-nowrap pb-1 sm:order-none sm:w-auto sm:flex-1 sm:justify-center">
            <NavLink to="/" end className={linkClass}>Sesión de hoy</NavLink>
            <NavLink to="/rankings" className={linkClass}>Rankings</NavLink>
            <NavLink to="/history" className={linkClass}>Progreso</NavLink>
            <NavLink to="/calibrate" className={linkClass}>Calibración</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
