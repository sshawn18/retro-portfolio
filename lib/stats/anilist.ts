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
