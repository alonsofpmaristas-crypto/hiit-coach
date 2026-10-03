import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { socket } from '../../services/socket';
import { useAsync } from '../../hooks/useAsync';
import { useAuthStore } from '../../store/authStore';

const TABS = [
  { id: 'daily', label: 'Hoy' },
  { id: 'weekly', label: 'Semana' },
  { id: 'monthly', label: 'Mes' },
];

export default function RankingsPage() {
  const [type, setType] = useState('daily');
  const userId = useAuthStore((s) => s.user?.id);
  const { data, error, loading, reload } = useAsync(() => api(`/rankings/${type}`), [type]);

  // Ranking en vivo: el servidor avisa cuando entra un resultado nuevo.
  useEffect(() => {
    socket.connect();
    socket.on('ranking:updated', reload);
    return () => { socket.off('ranking:updated', reload); socket.disconnect(); };
  }, [reload]);

  const rows = data?.ranking ?? [];

  return (
    <div>
      <h1 className="font-display text-5xl font-bold leading-none">Rankings</h1>

      <div role="tablist" className="mt-6 inline-flex rounded border border-line bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id} role="tab" aria-selected={type === t.id} onClick={() => setType(t.id)}
            className={`rounded px-4 py-1.5 text-sm font-medium ${type === t.id ? 'bg-ink text-white' : 'text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mt-6 text-work">{error.message}</p>}
      {loading && !data && <p className="mt-6 text-muted">Cargando…</p>}

      {data && rows.length === 0 && (
        <p className="mt-6 text-muted">Aún nadie ha completado sesiones en este periodo. Haz la sesión de hoy y sé el primero.</p>
      )}

      {rows.length > 0 && (
        <table className="mt-6 w-full text-left">
          <thead className="text-sm text-muted">
            <tr>
              <th className="py-2 pr-2 font-medium">Puesto</th>
              <th className="py-2 font-medium">Nombre</th>
              <th className="py-2 text-right font-medium">Sesiones</th>
              <th className="py-2 text-right font-medium">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.userId} className={`border-t border-line ${r.userId === userId ? 'bg-work/10 font-semibold' : ''}`}>
                <td className="py-3 pr-2 font-display text-2xl">{r.position}</td>
                <td className="py-3">{r.name}</td>
                <td className="py-3 text-right text-muted">{r.sessions}</td>
                <td className="py-3 text-right font-display text-2xl">{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
