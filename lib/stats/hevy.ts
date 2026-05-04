const BASE = "https://api.hevyapp.com";

/* ── Types ───────────────────────────────────────────────────── */

export type HevySet = {
  index: number;
  set_type: string;
  weight_kg: number | null;
  reps: number | null;
  duration_seconds: number | null;
  rpe: number | null;
};

export type HevyExercise = {
  index: number;
  title: string;
  sets: HevySet[];
};

export type HevyWorkout = {
  id: string;
  title: string;
  start_time: string;   // ISO 8601
  end_time: string;     // ISO 8601
  exercises: HevyExercise[];
};

export type HevyFeed = {
  workouts: HevyWorkout[];
  page_count: number;
  error: string | null;
  fetchedAt: number;
};

/* ── Fetcher ─────────────────────────────────────────────────── */

export async function getHevyWorkouts(
  apiKey: string,
  pageSize = 10
): Promise<HevyFeed> {
  const base: HevyFeed = {
    workouts: [],
    page_count: 0,
    error: null,
    fetchedAt: Date.now(),
  };

  try {
    const res = await fetch(
      `${BASE}/v1/workouts?page=1&pageSize=${pageSize}`,
      {
        headers: { "api-key": apiKey, Accept: "application/json" },
        next: { revalidate: 300 }, // cache 5 min
      }
    );

    if (!res.ok) return { ...base, error: `hevy api ${res.status}` };

    const json = (await res.json()) as {
      workouts?: HevyWorkout[];
      page_count?: number;
    };

    return {
      ...base,
      workouts: json.workouts ?? [],
      page_count: json.page_count ?? 0,
    };
  } catch (err) {
    return {
      ...base,
      error: err instanceof Error ? err.message : "hevy fetch failed",
    };
  }
}
