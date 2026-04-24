# AniList Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Win98-style desktop window showing the user's full AniList library (anime + manga, all status lists) using AniList's public GraphQL API.

**Architecture:** `lib/stats/anilist.ts` fetches all lists in one GraphQL query per media type. An API route at `/api/stats/anilist` serves it with 30-min ISR cache. `AnilistWindow.tsx` renders Anime/Manga tabs + a status dropdown, lazily fetching manga only when that tab is first clicked.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, AniList GraphQL API (no auth), cheerio already installed, 98.css for Win98 chrome, @react95/icons

---

### Task 1: Add `anilistUsername` to site config + `"anilist"` to WindowId

**Files:**
- Modify: `content/site.ts`
- Modify: `lib/desktop-types.ts`

- [ ] **Step 1: Update `SiteConfig` type and `site` object in `content/site.ts`**

```ts
// content/site.ts
export type SiteConfig = {
  name: string;
  handle: string;
  tagline: string;
  role: string;
  bio: string[];
  email: string;
  socials: SocialLink[];
  credit: string;
  letterboxdUsername: string;
  anilistUsername: string; // ← add this line
};

export const site: SiteConfig = {
  // ...all existing fields unchanged...
  letterboxdUsername: "SHAWN_18",
  anilistUsername: "SHAWN18", // ← add this line
};
```

- [ ] **Step 2: Add `"anilist"` to the `WindowId` union in `lib/desktop-types.ts`**

```ts
export type WindowId =
  | "welcome"
  | "about"
  | "mycomputer"
  | "projects"
  | "now"
  | "letterboxd"
  | "anilist"   // ← add this line
  | "blog"
  | "contact"
  | "recycle";
```

- [ ] **Step 3: Type-check**

```bash
cd X:/CC/retro-portfolio && npx tsc --noEmit
```

Expected: errors about `templates` missing `"anilist"` key — that's fine, we'll fix in Task 4.

---

### Task 2: Create `lib/stats/anilist.ts` — GraphQL fetcher

**Files:**
- Create: `lib/stats/anilist.ts`

- [ ] **Step 1: Create the file with types and fetcher**

```ts
// lib/stats/anilist.ts

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
  score: number | null;      // 0–100; null if unscored (0)
  progress: number;
  progressVolumes: number | null;
  total: number | null;      // episodes (anime) or chapters (manga)
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

function toEntry(raw: {
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
}): AnilistEntry {
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
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { userName: username, type } }),
      next: { revalidate: 1800 },
    });

    if (!res.ok) return { ...base, error: `anilist api ${res.status}` };

    const json = (await res.json()) as {
      data?: {
        MediaListCollection?: {
          lists: Array<{
            name: string;
            status: string;
            entries: Parameters<typeof toEntry>[0][];
          }>;
        };
      };
      errors?: Array<{ message: string }>;
    };

    if (json.errors?.length) {
      return { ...base, error: json.errors[0].message };
    }

    const rawLists = json.data?.MediaListCollection?.lists ?? [];

    const STATUS_ORDER: AnilistStatus[] = [
      "CURRENT",
      "COMPLETED",
      "PLANNING",
      "PAUSED",
      "DROPPED",
    ];

    const lists: AnilistStatusList[] = STATUS_ORDER.map((status) => {
      const raw = rawLists.find((l) => l.status === status);
      return {
        status,
        entries: (raw?.entries ?? []).map(toEntry),
      };
    });

    return { ...base, lists };
  } catch (err) {
    return {
      ...base,
      error: err instanceof Error ? err.message : "anilist fetch failed",
    };
  }
}
```

- [ ] **Step 2: Type-check**

```bash
cd X:/CC/retro-portfolio && npx tsc --noEmit
```

Expected: same errors as before (missing `"anilist"` in templates) — no new errors.

---

### Task 3: Create API route `app/api/stats/anilist/route.ts`

**Files:**
- Create: `app/api/stats/anilist/route.ts`

- [ ] **Step 1: Create the route**

```ts
// app/api/stats/anilist/route.ts
import { NextResponse } from "next/server";
import { getAnilistCollection } from "@/lib/stats/anilist";
import { site } from "@/content/site";

export const revalidate = 1800; // 30 min

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("type")?.toUpperCase();
  const type: "ANIME" | "MANGA" = raw === "MANGA" ? "MANGA" : "ANIME";
  const data = await getAnilistCollection(site.anilistUsername, type);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
```

- [ ] **Step 2: Test the route locally**

```bash
curl -s "http://localhost:3000/api/stats/anilist?type=ANIME" | node -e \
  "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);console.log('lists:',j.lists.map(l=>l.status+':'+l.entries.length),'error:',j.error)})"
```

Expected output (counts will vary):
```
lists: [ 'CURRENT:5', 'COMPLETED:120', 'PLANNING:30', 'PAUSED:2', 'DROPPED:1' ] error: null
```

- [ ] **Step 3: Type-check**

```bash
cd X:/CC/retro-portfolio && npx tsc --noEmit
```

Expected: same errors as before, no new ones.

---

### Task 4: Create `components/desktop/windows/AnilistWindow.tsx`

**Files:**
- Create: `components/desktop/windows/AnilistWindow.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/desktop/windows/AnilistWindow.tsx
"use client";

import { useEffect, useState } from "react";
import type { AnilistCollection, AnilistEntry, AnilistStatus } from "@/lib/stats/anilist";

type MediaType = "ANIME" | "MANGA";

const STATUS_LABELS: Record<MediaType, Record<AnilistStatus, string>> = {
  ANIME: {
    CURRENT: "Watching",
    COMPLETED: "Completed",
    PLANNING: "Planning",
    PAUSED: "Paused",
    DROPPED: "Dropped",
  },
  MANGA: {
    CURRENT: "Reading",
    COMPLETED: "Completed",
    PLANNING: "Planning",
    PAUSED: "Paused",
    DROPPED: "Dropped",
  },
};

const STATUS_ORDER: AnilistStatus[] = [
  "CURRENT",
  "COMPLETED",
  "PLANNING",
  "PAUSED",
  "DROPPED",
];

export function AnilistWindow() {
  const [mediaType, setMediaType] = useState<MediaType>("ANIME");
  const [status, setStatus] = useState<AnilistStatus>("CURRENT");

  // Lazy cache: fetch each type once
  const [animeData, setAnimeData] = useState<AnilistCollection | null>(null);
  const [mangaData, setMangaData] = useState<AnilistCollection | null>(null);
  const [loading, setLoading] = useState(false);

  const data = mediaType === "ANIME" ? animeData : mangaData;
  const setData = mediaType === "ANIME" ? setAnimeData : setMangaData;

  useEffect(() => {
    if (data) return; // already loaded
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/stats/anilist?type=${mediaType}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as AnilistCollection;
        if (!cancelled) setData(json);
      } catch {
        /* noop */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mediaType, data, setData]);

  const currentList = data?.lists.find((l) => l.status === status);
  const entries = currentList?.entries ?? [];
  const username = data?.username ?? "";

  return (
    <div className="text-[12px] leading-[1.5]">
      {/* Anime / Manga tab strip */}
      <menu role="tablist" className="flex gap-0 mb-2 list-none p-0">
        {(["ANIME", "MANGA"] as MediaType[]).map((t) => (
          <TabButton
            key={t}
            active={mediaType === t}
            onClick={() => {
              setMediaType(t);
              setStatus("CURRENT");
            }}
            label={t === "ANIME" ? "Anime" : "Manga"}
          />
        ))}
      </menu>

      {/* Content panel */}
      <div
        style={{
          border: "1px solid",
          borderColor: "#fff #808080 #808080 #fff",
          background: "#c0c0c0",
          padding: "10px 12px",
          marginTop: -3,
        }}
      >
        {/* Status dropdown + count */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="anilist-status"
              className="text-[11px]"
              style={{ opacity: 0.75 }}
            >
              Status:
            </label>
            <select
              id="anilist-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as AnilistStatus)}
              style={{
                fontFamily: "inherit",
                fontSize: 11,
                padding: "1px 4px",
                border: "1px solid",
                borderColor: "#808080 #fff #fff #808080",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[mediaType][s]}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[11px]" style={{ opacity: 0.75 }}>
            {loading ? "loading…" : `${entries.length} entries`}
          </span>
        </div>

        {/* Entry list */}
        {loading ? (
          <Simple message="loading…" />
        ) : data?.error ? (
          <div>
            <p className="opacity-70 text-[11px] mb-1">{data.error}</p>
            {username && (
              <a
                href={`https://anilist.co/user/${username}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px]"
              >
                view on AniList →
              </a>
            )}
          </div>
        ) : entries.length === 0 ? (
          <Simple message="no entries in this list" />
        ) : (
          <ul
            className="m-0 p-0 space-y-2"
            style={{
              listStyle: "none",
              maxHeight: 360,
              overflowY: "auto",
              border: "1px inset #808080",
              background: "#fff",
              padding: "8px 10px",
            }}
          >
            {entries.map((entry, i) => (
              <EntryRow key={i} entry={entry} type={mediaType} />
            ))}
          </ul>
        )}

        {/* Status bar */}
        {!loading && !data?.error && (
          <div className="status-bar mt-2">
            <p className="status-bar-field">
              {username ? (
                <a
                  href={`https://anilist.co/user/${username}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  anilist.co/user/{username}
                </a>
              ) : (
                "AniList"
              )}
            </p>
            <p className="status-bar-field">{entries.length} shown</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        position: "relative",
        padding: "4px 14px",
        marginRight: 2,
        background: active ? "#c0c0c0" : "#bdbdbd",
        border: "1px solid",
        borderColor: active
          ? "#fff #808080 transparent #fff"
          : "#fff #808080 #808080 #fff",
        borderBottomColor: active ? "#c0c0c0" : "#808080",
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        top: active ? 0 : 1,
        zIndex: active ? 2 : 1,
        boxShadow: "none",
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {label}
    </button>
  );
}

function EntryRow({ entry, type }: { entry: AnilistEntry; type: MediaType }) {
  const unit = type === "ANIME" ? "eps" : "ch";
  const progressText =
    entry.total != null
      ? `${entry.progress} / ${entry.total} ${unit}`
      : `${entry.progress} ${unit}`;

  return (
    <li className="flex gap-3 items-start">
      {/* Cover */}
      {entry.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.cover}
          alt={`${entry.title} cover`}
          width={44}
          height={62}
          style={{
            width: 44,
            height: 62,
            objectFit: "cover",
            border: "1px inset #808080",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 62,
            border: "1px inset #808080",
            background: "#000",
            flexShrink: 0,
          }}
        />
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="font-bold truncate" title={entry.title}>
          {entry.siteUrl ? (
            <a href={entry.siteUrl} target="_blank" rel="noreferrer">
              {entry.title}
            </a>
          ) : (
            entry.title
          )}
        </div>
        <div className="text-[11px] opacity-60 mt-0.5">
          {[entry.format, progressText].filter(Boolean).join(" · ")}
        </div>
        {entry.score != null && (
          <div className="text-[11px] mt-0.5" style={{ color: "#ff7a00" }}>
            {entry.score} / 100
          </div>
        )}
        {type === "MANGA" && entry.progressVolumes != null && entry.progressVolumes > 0 && (
          <div className="text-[11px] opacity-60">
            vol. {entry.progressVolumes}
          </div>
        )}
      </div>
    </li>
  );
}

function Simple({ message }: { message: string }) {
  return <div className="opacity-70">{message}</div>;
}
```

- [ ] **Step 2: Type-check**

```bash
cd X:/CC/retro-portfolio && npx tsc --noEmit
```

Expected: still only the `"anilist"` missing-from-templates error, nothing new.

---

### Task 5: Wire AniList window into Desktop + Start Menu

**Files:**
- Modify: `components/desktop/Desktop.tsx`
- Modify: `components/desktop/StartMenu.tsx`

- [ ] **Step 1: Update `Desktop.tsx` — add import, template, and icon**

Add the import at the top with the other window imports:
```tsx
import { AnilistWindow } from "./windows/AnilistWindow";
```

Add `Winmine1` to the @react95/icons import (it's the closest Win98 icon to entertainment/games — swap for any other available icon if preferred):
```tsx
import {
  Computer,
  Notepad,
  Folder,
  CdMusic,
  Wordpad,
  Mail,
  RecycleEmpty,
  Mplayer11,
  Winmine1,   // ← add
} from "@react95/icons";
```

Add the `anilist` entry to `templates`:
```tsx
const templates: Record<WindowId, Template> = {
  // ...all existing entries unchanged...
  anilist: {
    id: "anilist",
    title: "Anime List — AniList",
    icon: "📺",
    x: 280,
    y: 100,
    width: 500,
    content: <AnilistWindow />,
  },
  // rest of templates...
};
```

Add to `iconOrder` (after letterboxd):
```tsx
const iconOrder: { id: WindowId; label: string; glyph: ReactNode }[] = [
  { id: "mycomputer", label: "My Computer",  glyph: <Computer   variant="32x32_4" style={iconStyle} /> },
  { id: "about",      label: "About.txt",    glyph: <Notepad    variant="32x32_4" style={iconStyle} /> },
  { id: "projects",   label: "Projects",     glyph: <Folder     variant="32x32_4" style={iconStyle} /> },
  { id: "now",        label: "Now Playing",  glyph: <CdMusic    variant="32x32_4" style={iconStyle} /> },
  { id: "letterboxd", label: "Film Diary",   glyph: <Mplayer11  variant="32x32_4" style={iconStyle} /> },
  { id: "anilist",    label: "Anime List",   glyph: <Winmine1   variant="32x32_4" style={iconStyle} /> }, // ← add
  { id: "blog",       label: "Blog",         glyph: <Wordpad    variant="32x32_4" style={iconStyle} /> },
  { id: "contact",    label: "Contact.exe",  glyph: <Mail       variant="32x32_4" style={iconStyle} /> },
  { id: "recycle",    label: "Recycle Bin",  glyph: <RecycleEmpty variant="32x32_4" style={iconStyle} /> },
];
```

- [ ] **Step 2: Update `StartMenu.tsx` — add menu item**

Add `anilist` to the `programs` array after `letterboxd`:
```tsx
const programs: MenuItem[] = [
  { id: "welcome",    label: "Welcome",     glyph: "👋" },
  { id: "about",      label: "About.txt",   glyph: "📄" },
  { id: "projects",   label: "Projects",    glyph: "📁" },
  { id: "now",        label: "Now Playing", glyph: "🎵" },
  { id: "letterboxd", label: "Film Diary",  glyph: "🎬" },
  { id: "anilist",    label: "Anime List",  glyph: "📺" }, // ← add
  { id: "blog",       label: "Blog",        glyph: "📰" },
  { divider: true, label: "", glyph: "" },
  { id: "contact",    label: "Contact.exe", glyph: "✉️" },
  { id: "mycomputer", label: "My Computer", glyph: "🖥️" },
];
```

- [ ] **Step 3: Type-check — should be zero errors now**

```bash
cd X:/CC/retro-portfolio && npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 4: Build check**

```bash
cd X:/CC/retro-portfolio && npm run build 2>&1 | tail -20
```

Expected: clean build, routes list includes `/api/stats/anilist`.

- [ ] **Step 5: Commit**

```bash
cd X:/CC/retro-portfolio && git add -A && git commit -m "feat: AniList window — anime + manga lists with all status tabs"
```

- [ ] **Step 6: Push to trigger Vercel deploy**

```bash
cd X:/CC/retro-portfolio && git push origin main
```

Expected: Vercel auto-deploys. Check `https://raviguptacc.vercel.app` after ~60 seconds — "Anime List" icon appears on desktop and in Start Menu.
