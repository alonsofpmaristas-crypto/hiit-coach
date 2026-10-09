import './ExerciseGuide.css';

const GUIDES = {
  squat: {
    name: 'sentadilla',
    startLabel: 'De pie',
    endLabel: 'Baja flexionando las rodillas',
    start: { head: [160, 35], torso: 'M160 52 L160 104', arms: 'M160 65 L139 79 L135 96 M160 65 L181 79 L185 96', legs: 'M160 104 L145 133 L142 169 M160 104 L175 133 L178 169' },
    end: { head: [145, 47], torso: 'M150 65 L165 103', arms: 'M151 72 L128 83 L123 98 M151 72 L171 86 L182 98', legs: 'M165 103 L139 127 L142 166 M165 103 L188 127 L178 166' },
  },
  lunge: {
    name: 'zancada',
    startLabel: 'De pie',
    endLabel: 'Flexiona una pierna',
    start: { head: [160, 35], torso: 'M160 52 L160 104', arms: 'M160 65 L139 79 L135 96 M160 65 L181 79 L185 96', legs: 'M160 104 L146 135 L142 169 M160 104 L174 135 L178 169' },
    end: { head: [160, 35], torso: 'M160 52 L160 104', arms: 'M160 65 L139 79 L135 96 M160 65 L181 79 L185 96', legs: 'M160 104 L133 126 L121 161 M160 104 L188 131 L178 169' },
  },
  pushup: {
    name: 'flexión',
    startLabel: 'Cuerpo recto',
    endLabel: 'Baja flexionando los codos',
    start: { head: [62, 105], torso: 'M80 105 L178 110', arms: 'M103 107 L95 137 L89 165 M103 107 L111 137 L117 165', legs: 'M178 110 L224 124 L267 135 M178 110 L223 115 L267 115' },
    end: { head: [62, 125], torso: 'M80 125 L178 130', arms: 'M103 125 L96 144 L89 165 M103 125 L111 144 L117 165', legs: 'M178 130 L224 140 L267 145 M178 130 L223 135 L267 135' },
  },
  situp: {
    name: 'abdominal',
    startLabel: 'Tumbado, rodillas flexionadas',
    endLabel: 'Eleva el torso',
    start: { head: [70, 133], torso: 'M88 130 L151 128', arms: 'M106 130 L104 111 L91 99 M106 130 L113 111 L127 101', legs: 'M151 128 L190 143 L222 142 M151 128 L190 157 L222 157' },
    end: { head: [125, 61], torso: 'M133 78 L151 128', arms: 'M139 95 L119 109 L105 122 M139 95 L158 107 L169 122', legs: 'M151 128 L190 143 L222 142 M151 128 L190 157 L222 157' },
  },
  'jumping-jack': {
    name: 'salto de tijera',
    startLabel: 'Brazos y piernas juntos',
    endLabel: 'Abre brazos y piernas',
    start: { head: [160, 35], torso: 'M160 52 L160 105', arms: 'M160 65 L145 83 L143 102 M160 65 L175 83 L177 102', legs: 'M160 105 L153 137 L150 169 M160 105 L167 137 L170 169' },
    end: { head: [160, 35], torso: 'M160 52 L160 105', arms: 'M160 65 L137 47 L119 34 M160 65 L183 47 L201 34', legs: 'M160 105 L139 134 L123 164 M160 105 L181 134 L197 164' },
  },
  'high-knees': {
    name: 'rodillas altas',
    startLabel: 'De pie',
    endLabel: 'Eleva una rodilla',
    start: { head: [160, 35], torso: 'M160 52 L160 104', arms: 'M160 65 L142 82 L139 102 M160 65 L178 82 L181 102', legs: 'M160 104 L146 136 L142 169 M160 104 L174 136 L178 169' },
    end: { head: [160, 35], torso: 'M160 52 L160 104', arms: 'M160 65 L143 81 L139 99 M160 65 L179 82 L181 101', legs: 'M160 104 L139 124 L132 139 M160 104 L174 136 L178 169' },
  },
  'mountain-climber': {
    name: 'escalador',
    startLabel: 'Posición de plancha',
    endLabel: 'Lleva una rodilla al pecho',
    start: { head: [62, 83], torso: 'M80 88 L178 112', arms: 'M102 94 L95 127 L89 165 M102 94 L111 130 L117 165', legs: 'M178 112 L223 124 L267 135 M178 112 L223 136 L267 155' },
    end: { head: [62, 83], torso: 'M80 88 L178 112', arms: 'M102 94 L95 127 L89 165 M102 94 L111 130 L117 165', legs: 'M178 112 L199 125 L215 148 M178 112 L223 136 L267 155' },
  },
  burpee: {
    name: 'burpee',
    startLabel: 'De pie',
    endLabel: 'Baja hasta la plancha',
    start: { head: [160, 35], torso: 'M160 52 L160 104', arms: 'M160 65 L141 80 L137 99 M160 65 L179 80 L183 99', legs: 'M160 104 L146 136 L142 169 M160 104 L174 136 L178 169' },
    end: { head: [62, 98], torso: 'M80 102 L178 112', arms: 'M102 105 L95 137 L89 165 M102 105 L111 137 L117 165', legs: 'M178 112 L223 124 L267 135 M178 112 L223 136 L267 155' },
  },
};

function Figure({ pose, className }) {
  return (
    <g className={className}>
      <circle cx={pose.head[0]} cy={pose.head[1]} r="11" fill="currentColor" />
      {[pose.torso, pose.arms, pose.legs].map((path, index) => (
        <path key={index} d={path} fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </g>
  );
}

export default function ExerciseGuide({ exerciseSlug }) {
  const guide = GUIDES[exerciseSlug];
  if (!guide) return null;

  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="font-display text-2xl font-semibold">Guía de movimiento</h2>
      <svg
        className="mt-2 aspect-video w-full text-work"
        viewBox="0 0 320 190"
        role="img"
        aria-label={`Animación de ${guide.name}: ${guide.startLabel}, luego ${guide.endLabel}, y vuelve a la posición inicial para contar una repetición.`}
      >
        <path d="M20 170 H300" stroke="#dde2ea" strokeWidth="2" />
        <Figure pose={guide.start} className="exercise-guide__pose exercise-guide__start" />
        <Figure pose={guide.end} className="exercise-guide__pose exercise-guide__end" />
        <text x="160" y="187" textAnchor="middle" className="fill-current text-[11px] font-medium">
          {guide.startLabel} → {guide.endLabel} → vuelta al inicio
        </text>
      </svg>
      <p className="mt-2 text-sm text-muted">
        Completa el recorrido y vuelve a la posición inicial para contar una repetición.
      </p>
    </section>
  );
}
