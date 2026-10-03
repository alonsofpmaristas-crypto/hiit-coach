let audioContext;

export function prepareExerciseAudio() {
  if (typeof window === 'undefined') return;
  const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextConstructor) return;

  audioContext ??= new AudioContextConstructor();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
}

export function playExerciseCue(isStart = false) {
  if (!audioContext) return;

  const play = () => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime;
    const duration = isStart ? 0.32 : 0.14;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(isStart ? 1046 : 740, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  };

  if (audioContext.state === 'running') play();
  else audioContext.resume().then(play).catch(() => {});
}