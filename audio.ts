import { SoundStyle } from '../types/timer';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a pleasant audio alert using Web Audio API synthesis
 */
export function playAlertSound(style: SoundStyle, volume: number = 0.8): void {
  if (style === 'none' || volume <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0), 1) * 0.4, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (style === 'tibetan') {
    // Rich resonant harmonic chime with slow decay
    const freqs = [216, 432, 648, 864];
    const gains = [0.6, 0.3, 0.15, 0.08];

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(gains[i], now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 3.2);
    });
  } else if (style === 'bell') {
    // Crisp minimalist bell chime (E5 and B5 harmonic)
    const notes = [
      { f: 659.25, time: 0, dur: 1.8 },
      { f: 880.0, time: 0.15, dur: 2.2 },
      { f: 1318.5, time: 0.3, dur: 2.4 },
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.time);

      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.7, now + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  } else if (style === 'marimba') {
    // Warm wooden percussive arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((f, idx) => {
      const startTime = now + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.9, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } else if (style === 'digital') {
    // Clean modern digital prompt beep
    const beeps = [880, 1174.66];
    beeps.forEach((f, idx) => {
      const startTime = now + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }
}

/**
 * Triggers haptic vibration if supported
 */
export function triggerVibration(enabled: boolean): void {
  if (!enabled || typeof window === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate([100, 50, 100, 50, 150]);
  } catch {
    // Ignore vibration error
  }
}
