import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { prepareExerciseCue } from '../../services/exerciseCue.js';
import { useAsync } from '../../hooks/useAsync';
import IntervalStrip from './IntervalStrip.jsx';

const formatMinutes = (s) => `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ''}`;

export default function TodayPage() {
  const navigate = useNavigate();
  const { data: session, error, loading } = useAsync(() => api('/sessions/today'));

  if (loading) return <p className="text-muted">Cargando la sesión de hoy…</p>;
  if (error) return <p role="alert" className="text-work">{error.message}</p>;

  const totalSeconds = session.blocks.reduce((t, b) => t + b.sets * (b.workSeconds + b.restSeconds), 0);
  const date = new Date(session.date).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  });

  return (
    <div>
      <p className="text-muted capitalize">{date}</p>
      <h1 className="font-display text-6xl font-bold leading-none">{formatMinutes(totalSeconds)} de HIIT</h1>
      <p className="mt-3 max-w-prose text-muted">
        {session.blocks.length} ejercicios, {session.blocks[0].sets} series cada uno. Trabajas {session.blocks[0].workSeconds} s
        y descansas {session.blocks[0].restSeconds} s.
      </p>

      <div className="mt-8"><IntervalStrip blocks={session.blocks} /></div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {session.blocks.map((b) => (
          <li key={b.exerciseSlug} className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold">{b.exercise?.name}</h2>
              <span className="text-sm text-muted">{b.exercise?.pointsPerRep} pt por repetición</span>
            </div>
            <p className="mt-1 max-w-prose text-muted">{b.exercise?.description}</p>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          prepareExerciseCue();
          navigate('/session/run', { state: { session } });
        }}
        className="mt-8 rounded bg-ink px-6 py-3 font-semibold text-white"
      >
        Empezar sesión
      </button>
      <p className="mt-2 text-sm text-muted">Necesitarás dar permiso de cámara al navegador.</p>
    </div>
  );
}
