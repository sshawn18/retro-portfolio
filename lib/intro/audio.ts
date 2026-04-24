/**
 * Tiny Web Audio synth for the Ether intro.
 * All sounds are generated on the fly — no binary assets shipped.
 *
 * NOTE: the AudioContext must be created AFTER a user gesture or
 * modern browsers will refuse to start it. `create()` returns null
 * if called too early or in a non-browser context.
 */

type EtherAudio = {
  tick: (variant?: number) => void;
  chirp: () => void;
  modem: () => void;
  setMuted: (muted: boolean) => void;
  close: () => void;
};

export function createAudio(): EtherAudio | null {
  if (typeof window === "undefined") return null;
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  let ctx: AudioContext;
  try {
    ctx = new Ctor();
  } catch {
    return null;
  }

  // Master gain so mute works cleanly
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  const tick = (variant: number = 0) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    // Three subtly-different frequencies so the train of ticks isn't robotic
    const base = 900 + ((variant % 3) * 140);
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 0.6, now + 0.018);
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.025);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.035);
  };

  const chirp = () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.18);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.2);
  };

  /**
   * One short dial-up blip — NOT the full screeching handshake, just a
   * quick modulated warble to evoke the era.
   */
  const modem = () => {
    const now = ctx.currentTime;
    const dur = 0.9;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 440;
    lfo.type = "sine";
    lfo.frequency.value = 6;
    lfoGain.gain.value = 180;

    lfo.connect(lfoGain).connect(osc.frequency);

    // Slow downward slide on the carrier
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(220, now + dur);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.05);
    gain.gain.setValueAtTime(0.03, now + dur - 0.15);
    gain.gain.linearRampToValueAtTime(0, now + dur);

    osc.connect(gain).connect(master);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + dur);
    lfo.stop(now + dur);
  };

  const setMuted = (muted: boolean) => {
    master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.01);
  };

  const close = () => {
    try {
      ctx.close();
    } catch {
      /* noop */
    }
  };

  return { tick, chirp, modem, setMuted, close };
}
