# AniList Window — Design Spec

**Date:** 2026-04-25  
**Username:** SHAWN18  
**Status:** Approved

---

## Goal

Add a Win98-style desktop window showing the user's full AniList library — all anime and manga across all status lists (Watching/Reading, Completed, Planning, Paused, Dropped).

---

## Architecture

### New files

| File | Responsibility |
|---|---|
| `lib/stats/anilist.ts` | GraphQL fetcher. Two exported functions: `getAnimeList(username)` and `getMangaList(username)`. Each fetches all status groups in a single query. Returns typed `AnilistCollection`. |
| `app/api/stats/anilist/route.ts` | GET route. Accepts `?type=ANIME` or `?type=MANGA`. Returns `AnilistCollection` JSON. 30 min ISR cache. |
| `components/desktop/windows/AnilistWindow.tsx` | Full UI. Anime/Manga top tabs + status dropdown inside each. Lazy-fetches Manga only when tab is first opened. |

### Modified files

| File | Change |
|---|---|
| `lib/desktop-types.ts` | Add `"anilist"` to `WindowId` union |
| `content/site.ts` | Add `anilistUsername: "SHAWN18"` |
| `components/desktop/Desktop.tsx` | Add AniList window template + desktop icon (`Mplayer11` or similar) |
| `components/desktop/StartMenu.tsx` | Add `{ id: "anilist", label: "Anime List", glyph: "📺" }` |

---

## Data

### API

- **Endpoint:** `https://graphql.anilist.co` (POST, no auth)
- **Query:** `MediaListCollection(userName: $username, type: $type)`
- **Fetched fields per entry:**

```graphql
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
    }
  }
}
```

### Types

```ts
type AnilistEntry = {
  title: string;           // romaji, fallback to english
  format: string | null;   // TV, MOVIE, OVA, MANGA, NOVEL, etc.
  score: number | null;    // 0–100, null if unscored
  progress: number;        // episodes or chapters watched/read
  progressVolumes: number | null; // manga volumes only
  total: number | null;    // total episodes or chapters (null if ongoing/unknown)
  cover: string | null;    // medium cover image URL
  siteUrl: string | null;  // link to anilist.co entry
};

type AnilistStatusList = {
  status: "CURRENT" | "COMPLETED" | "PLANNING" | "PAUSED" | "DROPPED";
  entries: AnilistEntry[];
};

type AnilistCollection = {
  username: string;
  type: "ANIME" | "MANGA";
  lists: AnilistStatusList[];
  error: string | null;
  fetchedAt: number;
};
```

---

## UI

### Window structure

```
┌─ Anime List — AniList ──────────────────── [_][□][×] ┐
│ [Anime] [Manga]                                       │
│ ┌─────────────────────────────────────────────────┐  │
│ │ Status: [Watching          ▼]   42 entries       │  │
│ │ ┌──────────────────────────────────────────────┐ │  │
│ │ │ [cover] Title                    12/24 eps   │ │  │
│ │ │         TV · 85/100              ─────────── │ │  │
│ │ │ [cover] Title 2                  ? /12 eps   │ │  │
│ │ │         MOVIE · (no score)                   │ │  │
│ │ └──────────────────────────────────────────────┘ │  │
│ └─────────────────────────────────────────────────┘  │
│ ┌─ anilist.co/user/SHAWN18 ──┬─ 42 shown ──────────┐ │
└───────────────────────────────────────────────────────┘
```

### Entry row

- **Cover:** 44×62px image with `1px inset #808080` border. Black placeholder if no cover.
- **Title:** bold, truncated, links to AniList page
- **Progress:** `12 / 24 eps` (anime) or `3 / 12 ch · 1 vol` (manga). Shows `?` for unknown totals.
- **Format badge:** small muted text — `TV`, `MOVIE`, `OVA`, `MANGA`, `NOVEL`, etc.
- **Score:** `85 / 100` if scored, hidden if 0/null

### Status dropdown options

| Anime label | Manga label | API status |
|---|---|---|
| Watching | Reading | CURRENT |
| Completed | Completed | COMPLETED |
| Planning | Planning | PLANNING |
| Paused | Paused | PAUSED |
| Dropped | Dropped | DROPPED |

### Empty / error states

- Empty list → `"no entries in this list"`
- Fetch error → `"could not load list"` + link to `anilist.co/user/SHAWN18`
- Loading → `"loading…"`

---

## Caching

- ISR revalidate: `1800` seconds (30 min) on the API route
- Client: Anime loaded on window open; Manga loaded lazily on first Manga tab click
- No pagination — full list loaded at once (AniList lists rarely exceed a few hundred entries)

---

## Out of scope

- Writing updates back to AniList (read-only)
- Character/staff details
- Recommendations
- Search within the list
