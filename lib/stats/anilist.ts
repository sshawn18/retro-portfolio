const GRAPHQL_URL = "https://graphql.anilist.co";

const QUERY = `
query ($userName: String!, $type: MediaType!) {
  MediaListCollection(userName: $userName, type: $type) {
    lists {
      name
      status
      entries {
        score
        progress
        progressVolumes
        media {
          title { romaji english }
          coverImage { medium }
          episodes
          chapters
          volumes
          format
          siteUrl
        }
      }
    }
  }
}
`;

export type AnilistEntry = {
  title: string;
  format: string | null;
  score: number | null;
  progress: number;
  progressVolumes: number | null;
  total: number | null;
  cover: string | null;
  siteUrl: string | null;
};

export type AnilistStatus =
  | "CURRENT"
  | "COMPLETED"
  | "PLANNING"
  | "PAUSED"
  | "DROPPED";

export type AnilistStatusList = {
  status: AnilistStatus;
  entries: AnilistEntry[];
};

export type AnilistCollection = {
  username: string;
  type: "ANIME" | "MANGA";
  lists: AnilistStatusList[];
  error: string | null;
  fetchedAt: number;
};

type RawEntry = {
  score: number;
  progress: number;
  progressVolumes: number | null;
  media: {
    title: { romaji: string | null; english: string | null };
    coverImage: { medium: string | null } | null;
    episodes: number | null;
    chapters: number | null;
    volumes: number | null;
    format: string | null;
    siteUrl: string | null;
  };
};

function toEntry(raw: RawEntry): AnilistEntry {
  return {
    title: raw.media.title.romaji ?? raw.media.title.english ?? "Unknown",
    format: raw.media.format ?? null,
    score: raw.score > 0 ? raw.score : null,
    progress: raw.progress,
    progressVolumes: raw.progressVolumes ?? null,
    total: raw.media.episodes ?? raw.media.chapters ?? null,
    cover: raw.media.coverImage?.medium ?? null,
    siteUrl: raw.media.siteUrl ?? null,
  };
}

const STATUS_ORDER: AnilistStatus[] = [
  "CURRENT",
  "COMPLETED",
  "PLANNING",
  "PAUSED",
  "DROPPED",
];

// ── Activity feed ────────────────────────────────────────────

export type AnilistActivity = {
  id: number;
  verb: string;         // e.g. "watched episode", "completed", "read chapter"
  progress: string | null; // e.g. "5", "5 - 10"
  createdAt: number;    // Unix timestamp (seconds)
  mediaTitle: string;
  mediaCover: string | null;
  mediaType: "ANIME" | "MANGA";
  mediaSiteUrl: string | null;
};

export type AnilistActivityFeed = {
  username: string;
  activities: AnilistActivity[];
  error: string | null;
  fetchedAt: number;
};

const USER_ID_QUERY = `query ($name: String!) { User(name: $name) { id } }`;

const ACTIVITY_QUERY = `
query ($userId: Int!, $perPage: Int!) {
  Page(perPage: $perPage) {
    activities(userId: $userId, sort: [ID_DESC], type_in: [ANIME_LIST, MANGA_LIST]) {
      ... on ListActivity {
        id
        status
        progress
        createdAt
        media {
          title { romaji english }
          coverImage { medium }
          type
          siteUrl
        }
      }
    }
  }
}
`;

async function getUserId(username: string): Promise<number | null> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: USER_ID_QUERY, variables: { name: username } }),
      next: { revalidate: 86400 }, // user ID is stable — cache 24h
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { User?: { id: number } } };
    return json.data?.User?.id ?? null;
  } catch {
    return null;
  }
}

type RawActivity = {
  id?: number;
  status?: string;
  progress?: string | null;
  createdAt?: number;
  media?: {
    title: { romaji: string | null; english: string | null };
    coverImage: { medium: string | null } | null;
    type: string;
    siteUrl: string | null;
  };
};

export async function getAnilistActivity(
  username: string,
  limit = 30
): Promise<AnilistActivityFeed> {
  const base: AnilistActivityFeed = {
    username,
    activities: [],
    error: null,
    fetchedAt: Date.now(),
  };

  if (!username) return { ...base, error: "no anilist username configured" };

  const userId = await getUserId(username);
  if (!userId) return { ...base, error: "user not found on AniList" };

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query: ACTIVITY_QUERY,
        variables: { userId, perPage: limit },
      }),
      cache: "no-store", // always fetch fresh — this is a live feed
    });

    if (!res.ok) return { ...base, error: `anilist api ${res.status}` };

    const json = (await res.json()) as {
      data?: { Page?: { activities: RawActivity[] } };
      errors?: Array<{ message: string }>;
    };

    if (json.errors?.length) return { ...base, error: json.errors[0].message };

    const raw = json.data?.Page?.activities ?? [];
    const activities: AnilistActivity[] = raw
      .filter((a): a is RawActivity & { id: number } => a.id != null)
      .map((a) => ({
        id: a.id,
        verb: a.status ?? "",
        progress: a.progress ?? null,
        createdAt: a.createdAt ?? 0,
        mediaTitle:
          a.media?.title.romaji ?? a.media?.title.english ?? "Unknown",
        mediaCover: a.media?.coverImage?.medium ?? null,
        mediaType: (a.media?.type ?? "ANIME") as "ANIME" | "MANGA",
        mediaSiteUrl: a.media?.siteUrl ?? null,
      }));

    return { ...base, activities };
  } catch (err) {
    return {
      ...base,
      error: err instanceof Error ? err.message : "activity fetch failed",
    };
  }
}

// ── List collection ──────────────────────────────────────────

export async function getAnilistCollection(
  username: string,
  type: "ANIME" | "MANGA"
): Promise<AnilistCollection> {
  const base: AnilistCollection = {
    username,
    type,
    lists: [],
    error: null,
    fetchedAt: Date.now(),
  };

  if (!username) return { ...base, error: "no anilist username configured" };

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { userName: username, type } }),
      next: { revalidate: 1800 },
    });

    if (!res.ok) return { ...base, error: `anilist api ${res.status}` };

    const json = (await res.json()) as {
      data?: {
        MediaListCollection?: {
          lists: Array<{ name: string; status: string; entries: RawEntry[] }>;
        };
      };
      errors?: Array<{ message: string }>;
    };

    if (json.errors?.length) {
      return { ...base, error: json.errors[0].message };
    }

    const rawLists = json.data?.MediaListCollection?.lists ?? [];

    const lists: AnilistStatusList[] = STATUS_ORDER.map((status) => {
      const raw = rawLists.find((l) => l.status === status);
      return { status, entries: (raw?.entries ?? []).map(toEntry) };
    });

    return { ...base, lists };
  } catch (err) {
    return {
      ...base,
      error: err instanceof Error ? err.message : "anilist fetch failed",
    };
  }
}
