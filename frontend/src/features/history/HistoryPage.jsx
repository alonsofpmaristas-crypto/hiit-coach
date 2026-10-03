import { api } from '../../services/api.js';
import { useAsync } from '../../hooks/useAsync.js';
import HistoryChart from './HistoryChart.jsx';

const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });

const StatTile = ({ label, value }) => (
  <div className="border-l-2 border-line pl-3">
    <p className="text-sm text-muted">{label}</p>
    <p className="font-display text-4xl font-bold">{value}</p>
  </div>
);

export default function HistoryPage() {
  const { data: summary, error: summaryError } = useAsync(() => api('/results/me/summary'));
  const { data: results, error: resultsError, loading } = useAsync(() => api('/results/me'));

  const error = summaryError ?? resultsError;
  if (error) return <p role="alert" className="text-work">{error.message}</p>;

  // El historial llega ordenado de más reciente a más antiguo; para el
  // gráfico interesa en orden cronológico y solo las últimas 14 sesiones.
  const points = (results ?? [])
    .slice(0, 14)
    .reverse()
    .map((r) => ({ score: r.totalScore, label: dateLabel(r.dailySession.date) }));

  return (
    <div>
      <h1 className="font-display text-5xl font-bold leading-none">Tu progreso</h1>

      {summary && (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <StatTile label="Racha actual" value={`${summary.streak} d`} />
          <StatTile label="Sesiones" value={summary.totalSessions} />
          <StatTile label="Repeticiones" value={summary.totalReps} />
          <StatTile label="Mejor puntuación" value={summary.bestScore} />
        </div>
      )}

      <h2 className="mt-10 font-display text-2xl font-semibold">Puntuación por sesión</h2>
      <div className="mt-3">
        {loading ? <p className="text-muted">Cargando…</p> : <HistoryChart points={points} />}
      </div>

      {results?.length > 0 && (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {results.slice(0, 20).map((r) => (
            <li key={r.id} className="flex items-baseline justify-between py-3">
              <span className="text-muted">{dateLabel(r.dailySession.date)}</span>
              <span className="font-display text-xl">{r.totalScore} pts</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
