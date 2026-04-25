/**
 * Tiny Web Audio synth for the Ether intro.
 * All sounds are generated on the fly — no binary assets shipped.
 *
 * NOTE: the AudioContext must be created AFTER a user gesture or
 * modern browsers will refuse to start it.
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
  master.gain.value = 0.85;
  master.connect(ctx.destination);

  // ── Pre-bake a short noise buffer (reused every keystroke) ──────────────
  // Creating a new buffer per-keystroke is expensive; bake once, replay many.
  const NOISE_SEC = 0.08; // 80 ms of noise — longer than any single click
  const noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * NOISE_SEC), ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

  /**
   * Mechanical keyboard click — two layers:
   *   1. A band-pass filtered noise burst → the sharp "click" transient.
   *   2. A short sine-wave pitch drop → the "thock" body resonance.
   * `variant` shifts the filter centre and thud pitch slightly so a fast
   * typing run never sounds like a single repeated sample.
   */
  const tick = (variant: number = 0) => {
    const now = ctx.currentTime;
    const v = variant % 4; // 4 subtle voices

    // ── 1. Click transient (noise + band-pass) ────────────────────────────
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const clickFilt = ctx.createBiquadFilter();
    clickFilt.type = "bandpass";
    // Centre freq varies 3.5 kHz – 5.5 kHz across voices (crisp click range)
    clickFilt.frequency.value = 3500 + v * 500;
    clickFilt.Q.value = 1.2;

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.55, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016); // ~16 ms decay

    noise.connect(clickFilt);
    clickFilt.connect(clickGain);
    clickGain.connect(master);
    noise.start(now);
    noise.stop(now + 0.022);

    // ── 2. Body thud (pitched sine drop) ─────────────────────────────────
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = "sine";
    // Start pitch 160–220 Hz, drop to ~50 Hz (key bottoming out)
    thud.frequency.setValueAtTime(160 + v * 15, now);
    thud.frequency.exponentialRampToValueAtTime(50, now + 0.03);
    thudGain.gain.setValueAtTime(0.18, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    thud.connect(thudGain);
    thudGain.connect(master);
    thud.start(now);
    thud.stop(now + 0.05);
  };

  // ── Chirp — used on mojibake decode (kept but made softer) ───────────────
  const chirp = () => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.15);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.18);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.2);
  };

  /**
   * One short dial-up blip — evokes the era, not a full handshake screech.
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
    master.gain.setTargetAtTime(muted ? 0 : 0.85, ctx.currentTime, 0.01);
  };

  const close = () => {
    try { ctx.close(); } catch { /* noop */ }
  };

  return { tick, chirp, modem, setMuted, close };
}
