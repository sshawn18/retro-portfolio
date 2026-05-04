"use client";

import { useEffect, useState } from "react";
import type { HevyFeed, HevyWorkout, HevyExercise } from "@/lib/stats/hevy";

/* ── Helpers ─────────────────────────────────────────────────── */

function durationMin(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function totalSets(exercises: HevyExercise[]): number {
  return exercises.reduce((n, e) => n + e.sets.length, 0);
}

function bestSet(exercise: HevyExercise): string {
  const weighted = exercise.sets.filter((s) => s.weight_kg != null && s.reps != null);
  if (!weighted.length) {
    const timed = exercise.sets.find((s) => s.duration_seconds != null);
    if (timed) return `${Math.round((timed.duration_seconds ?? 0) / 60)}m`;
    return "–";
  }
  const best = weighted.reduce((a, b) =>
    (a.weight_kg ?? 0) * (a.reps ?? 0) > (b.weight_kg ?? 0) * (b.reps ?? 0) ? a : b
  );
  return `${best.weight_kg}kg × ${best.reps}`;
}

/* ── Sub-components ──────────────────────────────────────────── */

function WorkoutCard({ w }: { w: HevyWorkout }) {
  const [open, setOpen] = useState(false);
  const dur = durationMin(w.start_time, w.end_time);

  return (
    <li style={{ marginBottom: 8 }}>
      {/* Header row — click to expand */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          background: open ? "#000080" : "#e4e0d8",
          color: open ? "#fff" : "inherit",
          border: "1px solid",
          borderColor: open ? "#000080" : "#fff #808080 #808080 #fff",
          textAlign: "left",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 12,
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>🏋️</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {w.title || "Workout"}
          </div>
          <div style={{ fontSize: 10, opacity: 0.75 }}>
            {formatDate(w.start_time)} · {dur}min · {w.exercises.length} exercises · {totalSets(w.exercises)} sets
          </div>
        </div>
        <span style={{ fontSize: 10, flexShrink: 0, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Expanded exercise list */}
      {open && (
        <div
          style={{
            border: "1px solid #808080",
            borderTop: "none",
            background: "#fff",
            padding: "6px 10px",
          }}
        >
          {w.exercises.map((ex, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                paddingBottom: 3,
                marginBottom: 3,
                borderBottom: i < w.exercises.length - 1 ? "1px dashed #e0e0e0" : "none",
                fontSize: 11,
              }}
            >
              <span style={{ minWidth: 0, marginRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {ex.title}
              </span>
              <span style={{ flexShrink: 0, opacity: 0.6 }}>
                {ex.sets.length} sets · best {bestSet(ex)}
              </span>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export function HevyWindow() {
  const [data, setData] = useState<HevyFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/stats/hevy", { cache: "no-store" });
        const json = (await res.json()) as HevyFeed;
        if (!cancelled) setData(json);
      } catch { /* noop */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="text-[12px]" style={{ padding: 8, opacity: 0.7 }}>Loading workouts…</div>;
  }

  if (data?.error) {
    return (
      <div className="text-[12px]" style={{ padding: 8 }}>
        <p style={{ opacity: 0.7, marginBottom: 4 }}>⚠ {data.error}</p>
        <p style={{ fontSize: 11, opacity: 0.5 }}>
          Add <code>HEVY_API_KEY</code> to Vercel environment variables.
        </p>
      </div>
    );
  }

  if (!data || data.workouts.length === 0) {
    return <div className="text-[12px]" style={{ padding: 8, opacity: 0.7 }}>No workouts found.</div>;
  }

  return (
    <div className="text-[12px]">
      <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 8 }}>
        Last {data.workouts.length} workouts — tap to expand
      </div>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          maxHeight: 380,
          overflowY: "auto",
        }}
      >
        {data.workouts.map((w) => (
          <WorkoutCard key={w.id} w={w} />
        ))}
      </ul>

      <div className="status-bar mt-2">
        <p className="status-bar-field">Hevy</p>
        <p className="status-bar-field">{data.workouts.length} shown</p>
      </div>
    </div>
  );
}
