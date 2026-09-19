// Web Audio API procedural sound synthesizer for D&D combat
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

export function playHitSound(type: string = 'slashing', isCritical: boolean = false) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Impact oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'slashing' || type === 'piercing') {
      // White noise / metallic swoosh
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isCritical ? 800 : 440, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
      
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(200, now);

      gain.gain.setValueAtTime(isCritical ? 0.35 : 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'fire') {
      // Fire whoosh
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'bludgeoning' || type === 'force') {
      // Heavy deep thud
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Default magic/necrotic hit
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // Audio might be blocked by browser policy until user gesture
  }
}

export function playHealSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);

    gain.connect(ctx.destination);
    osc.connect(gain);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch {
    // ignore
  }
}

export function playBloodiedGong() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Deep ominous brass gong
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(135, now);
    osc2.frequency.exponentialRampToValueAtTime(40, now + 1.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1.5);
    osc2.stop(now + 1.5);
  } catch {
    // ignore
  }
}

export function playDefeatSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Solemn toll bell
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc.start(now);
    osc.stop(now + 2.5);
  } catch {
    // ignore
  }
}
