/**
 * Letterboxd HTML scraper — for the full diary and watchlist, which RSS
 * doesn't expose.
 *
 * Letterboxd's public HTML pages are Cloudflare-protected, but a realistic
 * User-Agent is enough to pass. We're polite: cache each page for 30 min
 * via Next's `revalidate`, and only fetch on demand.
 */

import * as cheerio from "cheerio";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Fuller set of headers that mimic a real Chrome visit. Cloudflare checks
 * more than User-Agent — Accept, Accept-Language, Sec-Fetch-*, and UA
 * client hints all factor into the bot score.
 */
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  "Sec-Ch-Ua":
    '"Chromium";v="131", "Not(A:Brand";v="99", "Google Chrome";v="131"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

export type WatchlistFilm = {
  title: string;
  year: number | null;
  link: string | null; // full URL
  slug: string | null;
};

export type DiaryEntry = {
  viewingId: string | null;
  title: string;
  year: number | null;
  rating: number | null; // 0.5–5.0 (null if unrated)
  liked: boolean;
  rewatch: boolean;
  hasReview: boolean;
  link: string | null;
};

export type PagedResult<T> = {
  username: string;
  page: number;
  items: T[];
  hasMore: boolean;
  total: number | null; // when known
  error: string | null;
  fetchedAt: number;
};

function parseTitleAndYear(input: string): { title: string; year: number | null } {
  // "The Phantom of the Opera (2004)" → { title, year }
  const m = input.match(/^(.+?)\s*\((\d{4})\)\s*$/);
  if (!m) return { title: input.trim(), year: null };
  return { title: m[1].trim(), year: Number(m[2]) };
}

function slugFromLink(link: string | null): string | null {
  if (!link) return null;
  const m = link.match(/\/film\/([^/]+)\/?/);
  return m ? m[1] : null;
}

function hasNextPage($: cheerio.CheerioAPI): boolean {
  // Letterboxd pagination: `<div class="pagination"><a class="next" ...>`
  return $(".paginate-nextprev .next").length > 0;
}

/** Parse a count like "157 films" out of the page header. */
function parseTotalFilms($: cheerio.CheerioAPI): number | null {
  const text = $("header h1, h1, .films-count").first().text();
  const m = text.match(/(\d[\d,]*)/);
  if (!m) return null;
  return Number(m[1].replace(/,/g, ""));
}

// ── Watchlist ───────────────────────────────────────────────

export async function getWatchlistPage(
  username: string,
  page = 1
): Promise<PagedResult<WatchlistFilm>> {
  const base: PagedResult<WatchlistFilm> = {
    username,
    page,
    items: [],
    hasMore: false,
    total: null,
    error: null,
    fetchedAt: Date.now(),
  };
  if (!username) return { ...base, error: "no username configured" };

  const url =
    page === 1
      ? `https://letterboxd.com/${encodeURIComponent(username)}/watchlist/`
      : `https://letterboxd.com/${encodeURIComponent(
          username
        )}/watchlist/page/${page}/`;

  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      next: { revalidate: 1800 }, // 30 min
    });
    if (!res.ok) return { ...base, error: `watchlist ${res.status}` };
    const html = await res.text();
    const $ = cheerio.load(html);

    const items: WatchlistFilm[] = [];
    $("[data-item-name][data-item-link]").each((_, el) => {
      const name = $(el).attr("data-item-name") ?? "";
      const link = $(el).attr("data-item-link") ?? null;
      if (!name) return;
      const { title, year } = parseTitleAndYear(name);
      const fullLink = link ? `https://letterboxd.com${link}` : null;
      items.push({
        title,
        year,
        link: fullLink,
        slug: slugFromLink(link),
      });
    });

    return {
      ...base,
      items,
      hasMore: hasNextPage($),
      total: parseTotalFilms($),
    };
  } catch (err) {
    return {
      ...base,
      error: err instanceof Error ? err.message : "watchlist fetch failed",
    };
  }
}

// ── Diary ───────────────────────────────────────────────────

export async function getDiaryPage(
  username: string,
  page = 1
): Promise<PagedResult<DiaryEntry>> {
  const base: PagedResult<DiaryEntry> = {
    username,
    page,
    items: [],
    hasMore: false,
    total: null,
    error: null,
    fetchedAt: Date.now(),
  };
  if (!username) return { ...base, error: "no username configured" };

  const url =
    page === 1
      ? `https://letterboxd.com/${encodeURIComponent(username)}/films/diary/`
      : `https://letterboxd.com/${encodeURIComponent(
          username
        )}/films/diary/page/${page}/`;

  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      next: { revalidate: 1800 }, // 30 min
    });
    if (!res.ok) return { ...base, error: `diary ${res.status}` };
    const html = await res.text();
    const $ = cheerio.load(html);

    const items: DiaryEntry[] = [];
    $("tr.diary-entry-row").each((_, el) => {
      const $row = $(el);
      const viewingId = $row.attr("data-viewing-id") ?? null;

      // Title: inside col-production → h2 → a
      const $titleLink = $row.find(".col-production h2 a").first();
      const title = $titleLink.text().trim();
      const relLink = $titleLink.attr("href") ?? null;
      const link = relLink ? `https://letterboxd.com${relLink}` : null;

      // Year: col-releaseyear (plain text, e.g. "2013")
      const yearText = $row.find(".col-releaseyear").first().text().trim();
      const year = /^\d{4}$/.test(yearText) ? Number(yearText) : null;

      // Rating: .rating.rated-N (N = 0..10)
      const ratingClass = $row.find(".col-rating .rating").attr("class") ?? "";
      const ratingMatch = ratingClass.match(/rated-(\d{1,2})/);
      const rating = ratingMatch ? Number(ratingMatch[1]) / 2 : null;

      // Rewatch, review, like: detect presence of `icon-status-off` =>
      // the icon is turned OFF. If the td is present WITHOUT that class,
      // the flag is on.
      const rewatchTd = $row.find(".col-rewatch");
      const rewatch =
        rewatchTd.length > 0 && !rewatchTd.hasClass("icon-status-off");

      const reviewTd = $row.find(".col-review");
      const hasReview =
        reviewTd.length > 0 && !reviewTd.hasClass("icon-status-off");

      const likeTd = $row.find(".col-like");
      const liked = likeTd.length > 0 && !likeTd.hasClass("icon-status-off");

      if (title) {
        items.push({
          viewingId,
          title,
          year,
          rating,
          liked,
          rewatch,
          hasReview,
          link,
        });
      }
    });

    return {
      ...base,
      items,
      hasMore: hasNextPage($),
      total: null, // diary header doesn't surface a clean total
    };
  } catch (err) {
    return {
      ...base,
      error: err instanceof Error ? err.message : "diary fetch failed",
    };
  }
}
