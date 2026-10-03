// Muestra la rutina como una tira de intervalos: naranja = trabajo, gris = descanso.
// El ancho de cada tramo es proporcional a su duración real.
export default function IntervalStrip({ blocks }) {
  return (
    <div className="flex gap-1.5" role="img" aria-label="Distribución de trabajo y descanso de la sesión">
      {blocks.map((b, i) => {
        const setSeconds = b.workSeconds + b.restSeconds;
        return (
          <div key={i} className="min-w-0" style={{ flexGrow: b.sets * setSeconds, flexBasis: 0 }}>
            <p className="truncate text-xs font-medium text-muted">{b.exercise?.name ?? b.exerciseSlug}</p>
            <div className="mt-1 flex h-8 gap-px">
              {Array.from({ length: b.sets }).flatMap((_, s) => [
                <div key={`w${s}`} className="bg-work" style={{ flexGrow: b.workSeconds, flexBasis: 0 }} />,
                <div key={`r${s}`} className="bg-rest" style={{ flexGrow: b.restSeconds, flexBasis: 0 }} />,
              ])}
            </div>
          </div>
        );
      })}
    </div>
  );
}
