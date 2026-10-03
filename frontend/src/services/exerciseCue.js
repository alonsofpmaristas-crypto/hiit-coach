let audioContext;

export function prepareExerciseCue() {
  if (typeof window === 'undefined') return;
  const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextConstructor) return;

  audioContext ??= new AudioContextConstructor();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
}

export function playExerciseCue() {
  if (!audioContext) return;

  const play = () => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.21);
  };

  if (audioContext.state === 'running') play();
  else audioContext.resume().then(play).catch(() => {});
}