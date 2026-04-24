"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/content/site";
import { mojibake } from "@/lib/intro/mojibake";
import { createAudio } from "@/lib/intro/audio";

/* ── Types ─────────────────────────────────────────────────── */

type Tone = "system" | "dim" | "message" | "accent" | "highlight";

type Line = {
  id: number;
  prefix?: string;
  text: string;   // what's currently rendered
  target: string; // the final text (used internally)
  tone: Tone;
};

type Props = {
  onDone: () => void;
};

/* ── Constants ─────────────────────────────────────────────── */

// Tuned to match the cadence of the Ether BBS in All About Lily Chou-Chou:
// slow, meditative, "heart murmur" rhythm. Posts appear as complete
// mojibake blocks that hold for a beat, "reload" with a tap, and linger
// long enough to actually be read before moving on.

const TYPE_MS = 42;                // keyboard clack per char
const MOJIBAKE_HOLD_MS = 520;      // garbled block sits before refresh
const MOJIBAKE_SHUFFLE_MS = 130;   // each frantic re-shuffle while garbled
const MOJIBAKE_SHUFFLES = 2;       // number of reload taps before decode
const POST_DECODE_HOLD_MS = 1150;  // how long decoded line lingers
const LINE_PAUSE_MS = 240;         // breath after a typed system line
const BEAT_PAUSE_MS = 420;         // "heart murmur" pause between clusters
const LONG_BEAT_INITIAL = 500;     // opening breath before first line types

/* ── Helpers ───────────────────────────────────────────────── */

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
// Uneven human-ish jitter — the film's pacing isn't metronomic
const beat = (base: number, jitter = 0.3) =>
  sleep(base * (1 - jitter / 2 + Math.random() * jitter));

/* ── Component ─────────────────────────────────────────────── */

export function EtherIntro({ onDone }: Props) {
  const [phase, setPhase] = useState<"gate" | "running" | "fading" | "done">(
    "gate"
  );
  const [lines, setLines] = useState<Line[]>([]);
  const [muted, setMuted] = useState(false);
  const [gateText, setGateText] = useState("Welcome to my life");
  const [reducedMotion, setReducedMotion] = useState(false);

  const audioRef = useRef<ReturnType<typeof createAudio> | null>(null);
  const cancelledRef = useRef(false);
  const lineIdRef = useRef(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Keep the terminal scrolled to bottom
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [lines]);

  /* ── Gate mojibake flicker on the greeting ───────────────── */
  useEffect(() => {
    if (phase !== "gate" || reducedMotion) return;
    let iter = 0;
    const max = 14;
    const id = setInterval(() => {
      iter++;
      if (iter <= 8) {
        // shuffle garbled a few times
        setGateText(mojibake("Welcome to my life"));
      } else if (iter === 9) {
        // settle
        setGateText("Welcome to my life");
      } else if (iter >= max) {
        clearInterval(id);
      }
    }, 90);
    return () => clearInterval(id);
  }, [phase, reducedMotion]);

  /* ── Finish + dispose ────────────────────────────────────── */
  const finish = useCallback(() => {
    cancelledRef.current = true;
    setPhase("fading");
    setTimeout(() => {
      setPhase("done");
      audioRef.current?.close();
      audioRef.current = null;
      onDone();
    }, 520);
  }, [onDone]);

  /* ── Mutators ────────────────────────────────────────────── */

  const appendLine = useCallback(
    (partial: Omit<Line, "id" | "text" | "target"> & { text: string; target?: string }) => {
      const id = ++lineIdRef.current;
      setLines((prev) => [
        ...prev,
        {
          id,
          prefix: partial.prefix,
          tone: partial.tone,
          text: partial.text,
          target: partial.target ?? partial.text,
        },
      ]);
      return id;
    },
    []
  );

  const updateLine = useCallback((id: number, text: string) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, text } : l)));
  }, []);

  /* ── Beat runners ────────────────────────────────────────── */

  const typeSystemLine = useCallback(
    async (target: string, tone: Tone = "system", prefix?: string) => {
      if (cancelledRef.current) return;
      const audio = audioRef.current;
      const id = appendLine({ text: "", target, tone, prefix });
      for (let i = 1; i <= target.length; i++) {
        if (cancelledRef.current) return;
        updateLine(id, target.slice(0, i));
        if (target[i - 1] !== " ") audio?.tick(i);
        await sleep(TYPE_MS);
      }
    },
    [appendLine, updateLine]
  );

  /**
   * Present a line the way the film does:
   *  1. The whole garbled block appears at once (no letter typing).
   *  2. A handful of soft keyboard clacks as the "user" tries to parse it.
   *  3. One or two frantic re-shuffles (new garbled versions) with a tap each.
   *  4. A decisive refresh chirp, and the text decodes into place.
   *  5. The decoded line lingers long enough to actually be read.
   *
   * The returned promise resolves only AFTER the post-decode hold so the
   * caller can queue the next beat without extra bookkeeping.
   */
  const revealMojibakeLine = useCallback(
    async (target: string, tone: Tone = "message", prefix?: string) => {
      if (cancelledRef.current) return;
      const audio = audioRef.current;

      // 1. Whole garbled block appears at once.
      const id = appendLine({
        text: mojibake(target),
        target,
        tone,
        prefix,
      });
      // A couple of keyboard clacks — the "user" is trying to read it.
      audio?.tick(1);
      await sleep(80);
      audio?.tick(3);
      await sleep(Math.max(0, MOJIBAKE_HOLD_MS - 160));
      if (cancelledRef.current) return;

      // 2. Frantic reload attempts — each shuffles to a new garbled form.
      for (let s = 0; s < MOJIBAKE_SHUFFLES; s++) {
        if (cancelledRef.current) return;
        audio?.tick(5 + s);
        updateLine(id, mojibake(target));
        await sleep(MOJIBAKE_SHUFFLE_MS);
      }

      // 3. Decode — silent swap, no chirp.
      if (cancelledRef.current) return;
      updateLine(id, target);

      // 4. Let the viewer actually read it.
      await beat(POST_DECODE_HOLD_MS);
    },
    [appendLine, updateLine]
  );

  const runIntro = useCallback(async () => {
    // Reduced motion: dump everything and exit fast.
    if (reducedMotion) {
      setLines([
        { id: 1, text: "ETHER.BBS v0.1 — online", target: "", tone: "dim" },
      ]);
      await sleep(1200);
      finish();
      return;
    }

    // Beat 1 — boot (silent, just the keyboard ticks underneath)
    await sleep(LONG_BEAT_INITIAL);
    await typeSystemLine("ETHER.BBS  v0.1", "dim");
    await beat(LINE_PAUSE_MS);
    await typeSystemLine("connecting . . . . . . . ok", "dim");
    await beat(LINE_PAUSE_MS);
    await typeSystemLine("anon#14327 authenticated", "dim");
    await beat(BEAT_PAUSE_MS);

    // Blank spacer for breath
    appendLine({ text: " ", target: " ", tone: "dim" });
    await sleep(300);

    // Beat 2 — three messages from the ether. Each appears garbled,
    // refreshes, then lingers long enough to read before the next.
    await revealMojibakeLine("the flatline breathes", "message", ">>14321");
    await beat(BEAT_PAUSE_MS);
    await revealMojibakeLine("every song is an airlock", "message", ">>14322");
    await beat(BEAT_PAUSE_MS);
    await revealMojibakeLine(
      "we are all anonymous here",
      "message",
      ">>14323"
    );
    await beat(BEAT_PAUSE_MS * 1.4);

    // Beat 3 — transition
    await typeSystemLine("> starting desktop . . .", "dim");
    await sleep(900);
    finish();
  }, [
    appendLine,
    finish,
    reducedMotion,
    revealMojibakeLine,
    typeSystemLine,
  ]);

  /* ── Kick off on gate-click ──────────────────────────────── */
  const enter = useCallback(() => {
    if (phase !== "gate") return;
    // Create audio context INSIDE the user gesture so browsers permit it.
    if (!audioRef.current) audioRef.current = createAudio();
    setPhase("running");
    void runIntro();
  }, [phase, runIntro]);

  useEffect(() => {
    if (phase !== "gate") return;
    const handler = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === "Escape") return;
      enter();
    };
    window.addEventListener("click", handler);
    window.addEventListener("keydown", handler);
    window.addEventListener("touchstart", handler);
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("keydown", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, [phase, enter]);

  /* ── Skip with Escape at any phase ───────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "done") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish, phase]);

  /* ── Mute persistence ────────────────────────────────────── */
  useEffect(() => {
    audioRef.current?.setMuted(muted);
  }, [muted]);

  /* ── Styles ──────────────────────────────────────────────── */
  // Film-accurate palette: brief bits of white text on black.
  // Dim grey for system chrome, white for the ether posts themselves.
  const toneClass = useMemo(
    () => ({
      system: "text-[#d6d6d6]",
      dim: "text-[#6f6f6f]",
      message: "text-[#f5f5f5]",
      accent: "text-[#b0b0b0] italic",
      highlight: "text-white font-medium",
    } satisfies Record<Tone, string>),
    []
  );

  if (phase === "done") return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] overflow-hidden",
        "transition-opacity duration-500",
        phase === "fading" ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
      role="dialog"
      aria-label="Ether intro"
      aria-live="polite"
      style={{
        backgroundColor: "#000",
        fontFamily: "var(--font-plex-mono), ui-monospace, 'Courier New', monospace",
      }}
    >
      {/* CRT scanlines (subtler, neutral grey so it reads film-accurate) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
        }}
      />
      {/* barrel vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.70) 100%)",
        }}
      />

      {/* Gate */}
      {phase === "gate" ? (
        <div className="relative h-full w-full flex flex-col items-center justify-center px-6 text-center">
          <div
            className="text-white text-[clamp(1.4rem,4.2vw,2.6rem)] leading-tight tracking-wide"
            style={{ textShadow: "0 0 14px rgba(255,255,255,0.35)" }}
          >
            {gateText}
            <span className="inline-block animate-pulse ml-1 text-white">
              ▌
            </span>
          </div>
          <div
            className="mt-6 text-[#9c9c9c] text-[clamp(0.75rem,1.6vw,0.95rem)] tracking-[0.25em] uppercase"
            style={{ textShadow: "0 0 8px rgba(255,255,255,0.18)" }}
          >
            click anywhere to enter
          </div>
          <div className="absolute bottom-4 right-4 text-[10px] tracking-[0.2em] uppercase text-[#555555] select-none">
            [esc] skip
          </div>
        </div>
      ) : null}

      {/* Terminal */}
      {phase !== "gate" ? (
        <div
          ref={scrollerRef}
          className="relative h-full w-full px-6 sm:px-10 flex flex-col items-center justify-center"
          style={{ outline: "none", border: "none" }}
        >
          <div
            className="w-full max-w-[720px] text-[14px] sm:text-[15px] leading-[1.85] font-mono"
            style={{
              textShadow: "0 0 3px rgba(255,255,255,0.25)",
              background: "transparent",
              outline: "none",
              border: "none",
            }}
          >
            {lines.map((l) => (
              <div
                key={l.id}
                className={`${toneClass[l.tone]} break-words whitespace-pre-wrap`}
                style={{ background: "transparent" }}
              >
                {l.prefix ? (
                  <span className="text-[#6f6f6f] mr-2">{l.prefix}</span>
                ) : null}
                <span>{l.text}</span>
              </div>
            ))}
            {/* Blinking cursor tail */}
            <div className="mt-1 text-white leading-none">
              <span className="inline-block animate-pulse">▌</span>
            </div>
          </div>

          {/* Controls — plain text, overriding 98.css button chrome */}
          <div className="absolute top-3 right-3 flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase text-[#6f6f6f]">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={muted}
              style={{
                background: "transparent",
                border: "none",
                boxShadow: "none",
                padding: 0,
                minWidth: 0,
                minHeight: 0,
                cursor: "pointer",
                color: "inherit",
                fontFamily: "inherit",
              }}
              className="hover:text-white transition-colors"
            >
              {muted ? "sound off" : "sound on"}
            </button>
            <button
              type="button"
              onClick={finish}
              style={{
                background: "transparent",
                border: "none",
                boxShadow: "none",
                padding: 0,
                minWidth: 0,
                minHeight: 0,
                cursor: "pointer",
                color: "inherit",
                fontFamily: "inherit",
              }}
              className="hover:text-white transition-colors"
            >
              [esc] skip
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
