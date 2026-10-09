import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { playExerciseCue } from '../../services/exerciseCue.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import CameraStage from './CameraStage.jsx';

// Máquina de estados simple de la sesión completa:
// work -> rest -> work ... hasta acabar las series del bloque, luego el
// siguiente bloque, hasta terminar todos los ejercicios.
const EXERCISE_CHANGE_REST_SECONDS = 20;

export default function SessionRunner() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const session = state?.session;

  const [blockIndex, setBlockIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [phase, setPhase] = useState('work'); // work | rest | done
  const [restBetweenExercises, setRestBetweenExercises] = useState(false);
  const [repsByExercise, setRepsByExercise] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [currentReps, setCurrentReps] = useState(0);
  const [exerciseCountdown, setExerciseCountdown] = useState(3);
  const [nextExercisePrompt, setNextExercisePrompt] = useState(null);
  const announcedCountdownRef = useRef(null);

  const block = session?.blocks[blockIndex];

  useEffect(() => {
    if (!session || exerciseCountdown === 0) return;
    const countdownId = `${blockIndex}:${exerciseCountdown}`;
    if (announcedCountdownRef.current !== countdownId) {
      announcedCountdownRef.current = countdownId;
      playExerciseCue();
    }
    const id = setTimeout(() => setExerciseCountdown((count) => count - 1), 1000);
    return () => clearTimeout(id);
  }, [session, blockIndex, exerciseCountdown]);

  useEffect(() => {
    if (session && exerciseCountdown === 0) {
      playExerciseCue(true);
      setNextExercisePrompt(null);
    }
  }, [session, exerciseCountdown]);

  const finishBlock = useCallback((slug, reps) => {
    setRepsByExercise((prev) => ({ ...prev, [slug]: Math.max(prev[slug] ?? 0, reps) }));
  }, []);

  const advance = useCallback(() => {
    if (!session) return;
    if (block) finishBlock(block.exerciseSlug, currentReps);

    if (phase === 'work') {
      if (setIndex + 1 < block.sets) {
        setSetIndex((i) => i + 1);
        setPhase('rest');
        setRestBetweenExercises(false);
        setCurrentReps(0);
        return;
      }

      if (blockIndex + 1 < session.blocks.length) {
        setPhase('rest');
        setRestBetweenExercises(true);
        setCurrentReps(0);
        return;
      }

      setPhase('done');
      return;
    }

    if (phase === 'rest') {
      if (restBetweenExercises) {
        const nextBlock = session.blocks[blockIndex + 1];
        setBlockIndex((i) => i + 1);
        setSetIndex(0);
        setPhase('work');
        setRestBetweenExercises(false);
        setCurrentReps(0);
        setExerciseCountdown(3);
        setNextExercisePrompt(
          `Prepárate para el siguiente ejercicio de "${nextBlock.exercise?.name ?? nextBlock.exerciseSlug}"`,
        );
        return;
      }

      setPhase('work');
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, block, phase, setIndex, blockIndex, currentReps, finishBlock, restBetweenExercises]);

  const duration = phase === 'work'
    ? block?.workSeconds
    : restBetweenExercises
      ? EXERCISE_CHANGE_REST_SECONDS
      : block?.restSeconds;
  const remaining = useCountdown(duration ?? 0, {
    active: (phase === 'work' && exerciseCountdown === 0) || phase === 'rest',
    onDone: advance,
    resetKey: `${blockIndex}:${setIndex}:${phase}:${restBetweenExercises}`,
  });

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
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Sesión completada</h1>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {session.blocks.map((b) => (
            <li key={b.exerciseSlug} className="flex items-baseline justify-between gap-3 py-3">
              <span className="min-w-0 break-words">{b.exercise?.name ?? b.exerciseSlug}</span>
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
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="break-words font-display text-3xl font-bold sm:text-4xl">{block.exercise?.name ?? block.exerciseSlug}</h1>
        <span className="shrink-0 text-sm text-muted sm:text-base">Serie {setIndex + 1} de {block.sets}</span>
      </div>
      <p className={`mt-1 font-display text-6xl font-bold sm:text-7xl ${phase === 'rest' ? 'text-muted' : 'text-work'}`}>
        {remaining}s
      </p>
      <p className="text-muted">
        {phase === 'work' ? 'Trabajo' : restBetweenExercises ? 'Descanso entre ejercicios' : 'Descanso'}
      </p>

      <div className="mt-6">
        <CameraStage
          exerciseSlug={block.exerciseSlug}
          active={phase === 'work' && exerciseCountdown === 0}
          onRepsChange={setCurrentReps}
        />
      </div>

      <button
        className="mt-6 text-sm text-muted underline"
        onClick={() => exerciseCountdown > 0 ? setExerciseCountdown(0) : advance()}
      >
        {exerciseCountdown > 0 ? 'Empezar ahora' : phase === 'work' ? 'Saltar a descanso' : 'Saltar descanso'}
      </button>

      {exerciseCountdown > 0 && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 text-white" role="status" aria-live="assertive">
          <div className="flex flex-col items-center gap-6 px-6 text-center">
            {nextExercisePrompt && (
              <p className="max-w-3xl font-display text-2xl font-bold leading-tight sm:text-3xl">
                {nextExercisePrompt}
              </p>
            )}
            <span className="font-display text-[clamp(5rem,30vw,10rem)] font-bold leading-none tabular-nums">
              {exerciseCountdown}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
