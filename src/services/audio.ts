/**
 * Motor de audio de BLOKANA.
 * Sonidos sintetizados con WebAudio (0 KB de descarga, mínima memoria/batería).
 */

type Sfx = "tomar" | "colocar" | "invalido" | "linea" | "combo" | "gameover" | "boton";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private step = 0;
  sfxEnabled = true;
  musicEnabled = false;

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.16;
      this.musicGain.connect(this.master);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  unlock() {
    this.ensure();
    if (this.musicEnabled) this.startMusic();
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    when = 0,
    slideTo?: number,
    dest?: AudioNode,
  ) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(dest ?? this.master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  play(name: Sfx, intensity = 0) {
    if (!this.sfxEnabled) return;
    switch (name) {
      case "tomar":
        this.tone(520, 0.07, "triangle", 0.18);
        break;
      case "boton":
        this.tone(380, 0.06, "square", 0.12);
        break;
      case "colocar":
        this.tone(300, 0.09, "triangle", 0.22, 0, 190);
        break;
      case "invalido":
        this.tone(150, 0.12, "sawtooth", 0.1, 0, 90);
        break;
      case "linea": {
        const base = 520 + Math.min(intensity, 6) * 60;
        [0, 1, 2].forEach((i) => this.tone(base * (1 + i * 0.26), 0.16, "triangle", 0.2, i * 0.055));
        break;
      }
      case "combo": {
        const notes = [523, 659, 784, 1046, 1318];
        notes.forEach((n, i) => this.tone(n, 0.18, "sine", 0.19, i * 0.06));
        break;
      }
      case "gameover":
        [440, 370, 294, 220].forEach((n, i) => this.tone(n, 0.35, "triangle", 0.2, i * 0.16));
        break;
    }
  }

  /** Loop melódico suave y muy liviano (un oscilador por nota). */
  startMusic() {
    const ctx = this.ensure();
    if (!ctx || this.musicTimer !== null) return;
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
    const bass = [130.81, 146.83, 164.81, 196.0];
    this.musicTimer = window.setInterval(() => {
      if (!this.musicEnabled || document.hidden) return;
      const n = scale[(Math.random() * scale.length) | 0];
      this.tone(n, 0.5, "sine", 0.13, 0, undefined, this.musicGain ?? undefined);
      if (this.step % 4 === 0)
        this.tone(bass[(this.step / 4) % bass.length], 0.7, "triangle", 0.1, 0, undefined, this.musicGain ?? undefined);
      this.step++;
    }, 480);
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  setMusic(on: boolean) {
    this.musicEnabled = on;
    if (on) this.startMusic();
    else this.stopMusic();
  }

  setSfx(on: boolean) {
    this.sfxEnabled = on;
  }
}

export const audio = new AudioEngine();

export function vibrate(pattern: number | number[], enabled: boolean) {
  if (!enabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* noop */
  }
}
