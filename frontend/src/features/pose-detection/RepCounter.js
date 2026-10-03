import { METRICS } from './metrics.js';

// Umbrales por ejercicio: downThreshold/upThreshold definen un ciclo
// "extendido" -> "contraído" -> "extendido" = 1 repetición.
// La separación entre ambos umbrales (histéresis) evita contar de más por
// el ruido de la estimación de pose frame a frame.
const CONFIG = {
  squat: { downThreshold: 110, upThreshold: 155, minIntervalMs: 400 },
  lunge: { downThreshold: 110, upThreshold: 155, minIntervalMs: 400 },
  pushup: { downThreshold: 100, upThreshold: 155, minIntervalMs: 400 },
  situp: { downThreshold: 90, upThreshold: 140, minIntervalMs: 400 },
  'jumping-jack': { downThreshold: 0.55, upThreshold: 0.3, minIntervalMs: 300, invert: true },
  'high-knees': { downThreshold: 0.55, upThreshold: 0.25, minIntervalMs: 250, invert: true },
  'mountain-climber': { downThreshold: 0.5, upThreshold: 0.25, minIntervalMs: 250, invert: true },
  burpee: { downThreshold: 0.35, upThreshold: 0.8, minIntervalMs: 600 },
};

/**
 * Cuenta repeticiones de un ejercicio a partir de una métrica escalar.
 * "invert: true" significa que valores ALTOS son la posición contraída
 * (p. ej. rodilla arriba), al contrario que en sentadillas o flexiones.
 */
export class RepCounter {
  constructor(exerciseSlug) {
    this.metric = METRICS[exerciseSlug];
    this.config = CONFIG[exerciseSlug];
    if (!this.metric || !this.config) throw new Error(`Ejercicio sin contador: ${exerciseSlug}`);
    this.phase = 'extended'; // 'extended' | 'contracted'
    this.reps = 0;
    this.lastRepAt = 0;
    this.lastValue = null;
  }

  /** @param keypoints keypoints del frame actual @param now timestamp en ms */
  update(keypoints, now = performance.now()) {
    const value = this.metric.fn(keypoints);
    if (value === null) return { reps: this.reps, value: this.lastValue, tracking: false };
    this.lastValue = value;

    const { downThreshold, upThreshold, minIntervalMs, invert } = this.config;
    const pastDown = invert ? value >= downThreshold : value <= downThreshold;
    const pastUp = invert ? value <= upThreshold : value >= upThreshold;

    if (this.phase === 'extended' && pastDown) {
      this.phase = 'contracted';
    } else if (this.phase === 'contracted' && pastUp) {
      this.phase = 'extended';
      if (now - this.lastRepAt >= minIntervalMs) {
        this.reps += 1;
        this.lastRepAt = now;
      }
    }
    return { reps: this.reps, value, tracking: true, phase: this.phase };
  }

  reset() {
    this.phase = 'extended';
    this.reps = 0;
    this.lastRepAt = 0;
  }
}
