import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import CameraStage from './CameraStage.jsx';

// Máquina de estados simple de la sesión completa:
// work -> rest -> work ... hasta acabar las series del bloque, luego el
// siguiente bloque, hasta terminar todos los ejercicios.
export default function SessionRunner() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const session = state?.session;

  const [blockIndex, setBlockIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState('work'); // work | rest | done
  const [repsByExercise, setRepsByExercise] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentReps, setCurrentReps] = useState(0);

  const block = session?.blocks[blockIndex];

  const finishBlock = useCallback((slug, reps) => {
    setRepsByExercise((prev) => ({ ...prev, [slug]: Math.max(prev[slug] ?? 0, reps) }));
  }, []);

  const advance = useCallback(() => {
    if (!session) return;
    if (block) finishBlock(block.exerciseSlug, currentReps);

    if (phase === 'work' && setIndex + 1 < block.sets) {
      setSetIndex((i) => i + 1);
      setPhase('rest');
      setCurrentReps(0);
      return;
    }
    if (phase === 'rest') { setPhase('work'); return; }
    // Se acaban las series de este bloque: pasar al siguiente ejercicio.
    if (blockIndex + 1 < session.blocks.length) {
      setBlockIndex((i) => i + 1);
      setSetIndex(0);
      setPhase('work');
      setCurrentReps(0);
    } else {
      setPhase('done');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, block, phase, setIndex, blockIndex, currentReps, finishBlock]);

  const duration = phase === 'work' ? block?.workSeconds : block?.restSeconds;
  const remaining = useCountdown(duration ?? 0, { active: phase === 'work' || phase === 'rest', onDone: advance });

  const finalReps = useMemo(() => {
    if (!block) return repsByExercise;
    return { ...repsByExercise, [block.exerciseSlug]: Math.max(repsByExercise[block.exerciseSlug] ?? 0, currentReps) };
  }, [repsByExercise, block, currentReps]);

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api('/results', { method: 'POST', body: { dailySessionId: session.id, repsByExercise: finalReps } });
      navigate('/rankings');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <div>
        <p className="text-muted">No hay ninguna sesión en curso.</p>
        <button className="mt-4 underline" onClick={() => navigate('/')}>Volver a la sesión de hoy</button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div>
        <h1 className="font-display text-5xl font-bold">Sesión completada</h1>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {session.blocks.map((b) => (
            <li key={b.exerciseSlug} className="flex items-baseline justify-between py-3">
              <span>{b.exercise?.name ?? b.exerciseSlug}</span>
              <span className="font-display text-2xl">{finalReps[b.exerciseSlug] ?? 0} reps</span>
            </li>
          ))}
        </ul>
        {submitError && <p role="alert" className="mt-4 text-work">{submitError}</p>}
        <button
          disabled={submitting} onClick={submit}
          className="mt-6 rounded bg-ink px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {submitting ? 'Enviando…' : 'Guardar resultado y ver el ranking'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-4xl font-bold">{block.exercise?.name ?? block.exerciseSlug}</h1>
        <span className="text-muted">Serie {setIndex + 1} de {block.sets}</span>
      </div>
      <p className={`mt-1 font-display text-7xl font-bold ${phase === 'rest' ? 'text-muted' : 'text-work'}`}>
        {remaining}s
      </p>
      <p className="text-muted">{phase === 'work' ? 'Trabajo' : 'Descanso'}</p>

      <div className="mt-6">
        <CameraStage exerciseSlug={block.exerciseSlug} active={phase === 'work'} onRepsChange={setCurrentReps} />
      </div>

      <button className="mt-6 text-sm text-muted underline" onClick={advance}>
        {phase === 'work' ? 'Saltar a descanso' : 'Saltar descanso'}
      </button>
    </div>
  );
}
