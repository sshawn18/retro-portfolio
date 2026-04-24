"use client";

import { useEffect, useState } from "react";
import type {
  AnilistCollection,
  AnilistEntry,
  AnilistStatus,
} from "@/lib/stats/anilist";

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

  const [animeData, setAnimeData] = useState<AnilistCollection | null>(null);
  const [mangaData, setMangaData] = useState<AnilistCollection | null>(null);
  const [loading, setLoading] = useState(false);

  const data = mediaType === "ANIME" ? animeData : mangaData;
  const setData = mediaType === "ANIME" ? setAnimeData : setMangaData;

  useEffect(() => {
    if (data) return;
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
        {type === "MANGA" &&
          entry.progressVolumes != null &&
          entry.progressVolumes > 0 && (
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
