/**
 * Letterboxd recent-films fetcher.
 *
 * No OAuth — Letterboxd publishes a public RSS feed at
 *   https://letterboxd.com/<username>/rss/
 * with custom namespaces (`letterboxd:`, `tmdb:`) carrying ratings,
 * watched date, TMDB id, and an embedded poster in the <description>.
 *
 * Cache on the server for 10 minutes (feed updates infrequently; being
 * kind to letterboxd.com).
 */

import { XMLParser } from "fast-xml-parser";

export type LetterboxdFilm = {
  title: string;
  year: number | null;
  rating: number | null; // 0.5–5.0, or null if unrated
  liked: boolean;
  rewatch: boolean;
  watchedDate: string | null; // ISO yyyy-mm-dd
  poster: string | null;
  link: string | null;
  tmdbId: string | null;
};

export type LetterboxdFeed = {
  username: string;
  films: LetterboxdFilm[];
  error: string | null;
  fetchedAt: number;
};

const FEED_FOR = (u: string) =>
  `https://letterboxd.com/${encodeURIComponent(u)}/rss/`;

// Minimal typed shape of the fields we actually read.
type RawItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  "letterboxd:filmTitle"?: string | number;
  "letterboxd:filmYear"?: string | number;
  "letterboxd:memberRating"?: string | number;
  "letterboxd:memberLike"?: string;
  "letterboxd:rewatch"?: string;
  "letterboxd:watchedDate"?: string;
  "tmdb:movieId"?: string | number;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Keep the namespace prefixes on tag names so we can read letterboxd:*
  removeNSPrefix: false,
  parseTagValue: false, // preserve strings so ratings like "5.0" don't become 5
  parseAttributeValue: false,
  trimValues: true,
});

/** Extract the first <img src="…"> from an RSS description HTML blob. */
function extractPoster(html: string | undefined): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function toNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function getLetterboxd(
  username: string,
  limit = 6
): Promise<LetterboxdFeed> {
  const base: LetterboxdFeed = {
    username,
    films: [],
    error: null,
    fetchedAt: Date.now(),
  };

  if (!username) {
    return { ...base, error: "no username configured" };
  }

  try {
    const res = await fetch(FEED_FOR(username), {
      // Some RSS servers reject the default fetch UA; Letterboxd seems fine
      // either way, but a polite UA is nice.
      headers: { "User-Agent": "retro-portfolio/0.1 (+letterboxd rss reader)" },
      next: { revalidate: 600 }, // 10 min ISR hint
    });
    if (!res.ok) {
      return {
        ...base,
        error: `letterboxd rss ${res.status}`,
      };
    }
    const xml = await res.text();
    const parsed = parser.parse(xml) as {
      rss?: { channel?: { item?: RawItem | RawItem[] } };
    };

    const rawItems = parsed.rss?.channel?.item ?? [];
    const items: RawItem[] = Array.isArray(rawItems) ? rawItems : [rawItems];

    const films: LetterboxdFilm[] = items.slice(0, limit).map((it) => {
      const year = toNum(it["letterboxd:filmYear"]);
      const rating = toNum(it["letterboxd:memberRating"]);
      const liked =
        String(it["letterboxd:memberLike"] ?? "").toLowerCase() === "yes";
      const rewatch =
        String(it["letterboxd:rewatch"] ?? "").toLowerCase() === "yes";
      const tmdbIdRaw = it["tmdb:movieId"];
      return {
        title: String(it["letterboxd:filmTitle"] ?? it.title ?? ""),
        year,
        rating,
        liked,
        rewatch,
        watchedDate: it["letterboxd:watchedDate"] ?? null,
        poster: extractPoster(it.description),
        link: it.link ?? null,
        tmdbId: tmdbIdRaw != null ? String(tmdbIdRaw) : null,
      };
    });

    return { ...base, films };
  } catch (err) {
    return {
      ...base,
      error: err instanceof Error ? err.message : "letterboxd fetch failed",
    };
  }
}
