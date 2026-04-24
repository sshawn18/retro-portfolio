"use client";

import { useCallback, useEffect, useState } from "react";
import type { LetterboxdFeed, LetterboxdFilm } from "@/lib/stats/letterboxd";
import type { PagedResult, WatchlistFilm } from "@/lib/stats/letterboxd-scrape";

type Tab = "diary" | "watchlist";

const DIARY_LIMIT = 50;

function Stars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="opacity-60">(no rating)</span>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span
      aria-label={`${rating} out of 5 stars`}
      style={{ letterSpacing: "0.04em", color: "#ff7a00" }}
    >
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(empty)}
    </span>
  );
}

function formatWatchedDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LetterboxdWindow() {
  const [tab, setTab] = useState<Tab>("diary");

  return (
    <div className="text-[12px] leading-[1.5]">
      {/* Win98-style tab strip */}
      <menu role="tablist" className="flex gap-0 mb-2 list-none p-0">
        <TabButton
          active={tab === "diary"}
          onClick={() => setTab("diary")}
          label="Diary"
        />
        <TabButton
          active={tab === "watchlist"}
          onClick={() => setTab("watchlist")}
          label="Watchlist"
        />
      </menu>

      <div
        style={{
          border: "1px solid",
          borderColor: "#fff #808080 #808080 #fff",
          background: "#c0c0c0",
          padding: "10px 12px",
          marginTop: -3,
        }}
      >
        {tab === "diary" ? <DiaryTab /> : <WatchlistTab />}
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

/* ── Diary tab (RSS — rich rows with posters) ───────────────── */

function DiaryTab() {
  const [data, setData] = useState<LetterboxdFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/stats/letterboxd?limit=${DIARY_LIMIT}`,
          { cache: "no-store" }
        );
        const json = (await res.json()) as LetterboxdFeed;
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
  }, []);

  if (loading && !data) return <Simple message="loading diary…" />;
  if (data?.error) return <Simple message={`error: ${data.error}`} />;
  if (!data || data.films.length === 0)
    return <Simple message="no diary entries found" />;

  return (
    <>
      <div
        className="text-[11px] mb-2 flex items-baseline justify-between"
        style={{ opacity: 0.75 }}
      >
        <span>Last {data.films.length} watches</span>
        <a
          href={`https://letterboxd.com/${data.username}/films/diary/`}
          target="_blank"
          rel="noreferrer"
        >
          full diary →
        </a>
      </div>

      <ul
        className="space-y-3 m-0 p-0"
        style={{
          listStyle: "none",
          maxHeight: 360,
          overflowY: "auto",
          border: "1px inset #808080",
          background: "#fff",
          padding: "8px 10px",
        }}
      >
        {data.films.map((film, i) => (
          <FilmRow
            key={`${film.tmdbId ?? i}-${film.watchedDate ?? i}`}
            film={film}
          />
        ))}
      </ul>

      <div className="status-bar mt-2">
        <p className="status-bar-field">
          <a
            href={`https://letterboxd.com/${data.username}/`}
            target="_blank"
            rel="noreferrer"
          >
            letterboxd.com/{data.username}
          </a>
        </p>
        <p className="status-bar-field">{data.films.length} shown</p>
      </div>
    </>
  );
}

function FilmRow({ film }: { film: LetterboxdFilm }) {
  const { title, year, rating, liked, rewatch, watchedDate, poster, link } =
    film;
  return (
    <li className="flex gap-3 items-start">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={`${title} poster`}
          width={44}
          height={66}
          style={{
            width: 44,
            height: 66,
            border: "1px inset #808080",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 66,
            border: "1px inset #808080",
            background: "#000",
            flexShrink: 0,
          }}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-bold truncate" title={title}>
          {link ? (
            <a href={link} target="_blank" rel="noreferrer">
              {title}
            </a>
          ) : (
            title
          )}
          {year != null ? (
            <span className="opacity-60 font-normal"> ({year})</span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
          <Stars rating={rating} />
          {liked ? (
            <span title="liked" aria-label="liked" style={{ color: "#c00" }}>
              ♥
            </span>
          ) : null}
          {rewatch ? (
            <span className="text-[10px] opacity-70 uppercase tracking-[0.12em]">
              (rewatch)
            </span>
          ) : null}
        </div>
        {watchedDate ? (
          <div className="text-[11px] opacity-60 mt-0.5">
            watched {formatWatchedDate(watchedDate)}
          </div>
        ) : null}
      </div>
    </li>
  );
}

/* ── Watchlist tab (scraped, paginated) ───────────────────── */

function WatchlistTab() {
  const [pages, setPages] = useState<PagedResult<WatchlistFilm>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (pageNum: number) => {
    const res = await fetch(
      `/api/stats/letterboxd/watchlist?page=${pageNum}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as PagedResult<WatchlistFilm>;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const first = await loadPage(1);
        if (!cancelled) {
          setPages([first]);
          if (first.error) setError(first.error);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "fetch failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPage]);

  const handleLoadMore = async () => {
    const last = pages[pages.length - 1];
    if (!last?.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = await loadPage(last.page + 1);
      setPages((prev) => [...prev, next]);
      if (next.error) setError(next.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "load more failed");
    } finally {
      setLoadingMore(false);
    }
  };

  const items = pages.flatMap((p) => p.items);
  const last = pages[pages.length - 1];
  const total = pages[0]?.total ?? null;

  if (loading) return <Simple message="loading watchlist…" />;
  if (error && items.length === 0)
    return <Simple message={`error: ${error}`} />;
  if (items.length === 0) return <Simple message="watchlist is empty" />;

  return (
    <>
      <div
        className="text-[11px] mb-2 flex items-baseline justify-between"
        style={{ opacity: 0.75 }}
      >
        <span>
          {items.length} shown{total ? ` of ${total}` : ""}
        </span>
        <a
          href={`https://letterboxd.com/${pages[0]?.username}/watchlist/`}
          target="_blank"
          rel="noreferrer"
        >
          open on Letterboxd →
        </a>
      </div>

      <ul
        className="m-0 p-0"
        style={{
          listStyle: "none",
          maxHeight: 360,
          overflowY: "auto",
          border: "1px inset #808080",
          background: "#fff",
          padding: "8px 10px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2px 14px",
        }}
      >
        {items.map((film, i) => (
          <li key={`${film.slug ?? i}`} className="truncate">
            <span className="opacity-50 text-[10px] tabular-nums mr-1.5">
              {String(i + 1).padStart(3, "0")}
            </span>
            {film.link ? (
              <a href={film.link} target="_blank" rel="noreferrer">
                {film.title}
              </a>
            ) : (
              <span>{film.title}</span>
            )}
            {film.year ? (
              <span className="opacity-60"> ({film.year})</span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-2">
        <div className="status-bar flex-1 mr-2">
          <p className="status-bar-field">page {last?.page ?? "—"}</p>
          <p className="status-bar-field">
            {last?.hasMore ? "more available" : "end of list"}
          </p>
        </div>
        {last?.hasMore ? (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{
              fontFamily: "inherit",
              fontSize: 12,
              padding: "2px 10px",
            }}
          >
            {loadingMore ? "loading…" : "load more"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-[10px] mt-1" style={{ color: "#800" }}>
          {error}
        </p>
      ) : null}
    </>
  );
}

function Simple({ message }: { message: string }) {
  return (
    <div className="opacity-70">{message}</div>
  );
}
