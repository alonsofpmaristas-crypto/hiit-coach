import { METRICS } from './metrics.js';

// Umbrales por ejercicio: downThreshold/upThreshold definen un ciclo
// "extendido" -> "contraído" -> "extendido" = 1 repetición.
// La separación entre ambos umbrales (histéresis) evita contar de más por
// el ruido de la estimación de pose frame a frame.
const CONFIG = {
  squat: { downThreshold: 110, upThreshold: 155, minIntervalMs: 150 },
  lunge: { downThreshold: 110, upThreshold: 155, minIntervalMs: 150 },
  pushup: { downThreshold: 100, upThreshold: 155, minIntervalMs: 150 },
  situp: { downThreshold: 0.45, upThreshold: 0.2, minIntervalMs: 150, invert: true },
  'jumping-jack': { downThreshold: 0.55, upThreshold: 0.3, minIntervalMs: 150, invert: true },
  'high-knees': {
    downThreshold: -0.05,
    upThreshold: -0.35,
    minIntervalMs: 120,
    extendedHoldMs: 120,
    invert: true,
  },
  'mountain-climber': { downThreshold: 0.95, upThreshold: 1.25, minIntervalMs: 120 },
  burpee: { downThreshold: 0.35, upThreshold: 0.8, minIntervalMs: 300 },
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
    this.cyclePhases = this.metric.cycleFns ? ['extended', 'extended'] : null;
    this.cycleLastRepAt = this.cyclePhases ? [0, 0] : null;
    this.cycleExtendedSince = this.cyclePhases ? [null, null] : null;
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

    if (this.cyclePhases) {
      const values = this.metric.cycleFns(keypoints);
      values.forEach((sideValue, index) => {
        if (sideValue === null) return;
        const sidePastDown = invert ? sideValue >= downThreshold : sideValue <= downThreshold;
        const sidePastUp = invert ? sideValue <= upThreshold : sideValue >= upThreshold;
        if (this.cyclePhases[index] === 'extended' && sidePastDown) {
          this.cyclePhases[index] = 'contracted';
          this.cycleExtendedSince[index] = null;
        } else if (this.cyclePhases[index] === 'contracted') {
          if (sidePastUp) {
            this.cycleExtendedSince[index] ??= now;
            if (now - this.cycleExtendedSince[index] >= (this.config.extendedHoldMs ?? 0)) {
              this.cyclePhases[index] = 'extended';
              this.cycleExtendedSince[index] = null;
              if (now - this.cycleLastRepAt[index] >= minIntervalMs) {
                this.reps += 1;
                this.cycleLastRepAt[index] = now;
                this.lastRepAt = now;
              }
            }
          } else {
            this.cycleExtendedSince[index] = null;
          }
        }
      });
    } else if (this.phase === 'extended' && pastDown) {
      this.phase = 'contracted';
    } else if (this.phase === 'contracted' && pastUp) {
      this.phase = 'extended';
      if (now - this.lastRepAt >= minIntervalMs) {
        this.reps += 1;
        this.lastRepAt = now;
      }
    }
    return { reps: this.reps, value, tracking: true, phase: this.cyclePhases?.[0] ?? this.phase };
  }

  reset() {
    this.phase = 'extended';
    if (this.cyclePhases) {
      this.cyclePhases = ['extended', 'extended'];
      this.cycleLastRepAt = [0, 0];
      this.cycleExtendedSince = [null, null];
    }
    this.reps = 0;
    this.lastRepAt = 0;
  }
}
