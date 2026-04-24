"use client";

import { useEffect, useState } from "react";
import type {
  AnilistCollection,
  AnilistEntry,
  AnilistStatus,
  AnilistActivityFeed,
  AnilistActivity,
} from "@/lib/stats/anilist";

type MediaType = "ANIME" | "MANGA" | "RECENT";

const STATUS_LABELS: Record<"ANIME" | "MANGA", Record<AnilistStatus, string>> = {
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
  const [activityData, setActivityData] = useState<AnilistActivityFeed | null>(null);
  const [loading, setLoading] = useState(false);

  const listData = mediaType === "ANIME" ? animeData : mediaType === "MANGA" ? mangaData : null;
  const setListData = mediaType === "ANIME" ? setAnimeData : setMangaData;

  // Fetch anime/manga lists
  useEffect(() => {
    if (mediaType === "RECENT" || listData) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/stats/anilist?type=${mediaType}`, { cache: "no-store" });
        const json = (await res.json()) as AnilistCollection;
        if (!cancelled) setListData(json);
      } catch { /* noop */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [mediaType, listData, setListData]);

  // Fetch activity feed
  useEffect(() => {
    if (mediaType !== "RECENT" || activityData) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/stats/anilist/activity", { cache: "no-store" });
        const json = (await res.json()) as AnilistActivityFeed;
        if (!cancelled) setActivityData(json);
      } catch { /* noop */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [mediaType, activityData]);

  const currentList = listData?.lists.find((l) => l.status === status);
  const entries = currentList?.entries ?? [];
  const username = listData?.username ?? activityData?.username ?? "";

  return (
    <div className="text-[12px] leading-[1.5]">
      {/* Tab strip */}
      <menu role="tablist" className="flex gap-0 mb-2 list-none p-0">
        {(["ANIME", "MANGA", "RECENT"] as MediaType[]).map((t) => (
          <TabButton
            key={t}
            active={mediaType === t}
            onClick={() => {
              setMediaType(t);
              if (t !== "RECENT") setStatus("CURRENT");
            }}
            label={t === "ANIME" ? "Anime" : t === "MANGA" ? "Manga" : "Recent"}
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
        {mediaType === "RECENT" ? (
          <RecentTab data={activityData} loading={loading} />
        ) : (
          <>
            {/* Status dropdown + count */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label htmlFor="anilist-status" className="text-[11px]" style={{ opacity: 0.75 }}>
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
                      {STATUS_LABELS[mediaType as "ANIME" | "MANGA"][s]}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[11px]" style={{ opacity: 0.75 }}>
                {loading ? "loading…" : `${entries.length} entries`}
              </span>
            </div>

            {loading ? (
              <Simple message="loading…" />
            ) : listData?.error ? (
              <div>
                <p className="opacity-70 text-[11px] mb-1">{listData.error}</p>
                {username && (
                  <a href={`https://anilist.co/user/${username}`} target="_blank" rel="noreferrer" className="text-[11px]">
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
                  <EntryRow key={i} entry={entry} type={mediaType as "ANIME" | "MANGA"} />
                ))}
              </ul>
            )}

            {!loading && !listData?.error && (
              <div className="status-bar mt-2">
                <p className="status-bar-field">
                  {username ? (
                    <a href={`https://anilist.co/user/${username}`} target="_blank" rel="noreferrer">
                      anilist.co/user/{username}
                    </a>
                  ) : "AniList"}
                </p>
                <p className="status-bar-field">{entries.length} shown</p>
              </div>
            )}
          </>
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

function RecentTab({
  data,
  loading,
}: {
  data: AnilistActivityFeed | null;
  loading: boolean;
}) {
  if (loading) return <Simple message="loading…" />;
  if (data?.error)
    return (
      <div>
        <p className="opacity-70 text-[11px] mb-1">{data.error}</p>
        <a
          href={`https://anilist.co/user/${data.username}`}
          target="_blank"
          rel="noreferrer"
          className="text-[11px]"
        >
          view on AniList →
        </a>
      </div>
    );
  if (!data || data.activities.length === 0)
    return <Simple message="no recent activity" />;

  return (
    <>
      <div className="text-[11px] mb-2 flex items-baseline justify-between" style={{ opacity: 0.75 }}>
        <span>Last {data.activities.length} updates</span>
        <a
          href={`https://anilist.co/user/${data.username}/animelist`}
          target="_blank"
          rel="noreferrer"
        >
          full activity →
        </a>
      </div>
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
        {data.activities.map((a) => (
          <ActivityRow key={a.id} activity={a} />
        ))}
      </ul>
      <div className="status-bar mt-2">
        <p className="status-bar-field">
          <a
            href={`https://anilist.co/user/${data.username}`}
            target="_blank"
            rel="noreferrer"
          >
            anilist.co/user/{data.username}
          </a>
        </p>
        <p className="status-bar-field">{data.activities.length} shown</p>
      </div>
    </>
  );
}

function relativeTime(unixSecs: number): string {
  const diff = Math.floor(Date.now() / 1000) - unixSecs;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

function ActivityRow({ activity }: { activity: AnilistActivity }) {
  const { verb, progress, createdAt, mediaTitle, mediaCover, mediaSiteUrl } = activity;
  const action = progress ? `${verb} ${progress}` : verb;

  return (
    <li className="flex gap-3 items-start">
      {mediaCover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaCover}
          alt={`${mediaTitle} cover`}
          width={36}
          height={50}
          style={{
            width: 36,
            height: 50,
            objectFit: "cover",
            border: "1px inset #808080",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 36,
            height: 50,
            border: "1px inset #808080",
            background: "#000",
            flexShrink: 0,
          }}
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-bold truncate" title={mediaTitle}>
          {mediaSiteUrl ? (
            <a href={mediaSiteUrl} target="_blank" rel="noreferrer">
              {mediaTitle}
            </a>
          ) : (
            mediaTitle
          )}
        </div>
        <div className="text-[11px] opacity-70 mt-0.5 capitalize">{action}</div>
        <div className="text-[10px] opacity-50 mt-0.5">{relativeTime(createdAt)}</div>
      </div>
    </li>
  );
}

function Simple({ message }: { message: string }) {
  return <div className="opacity-70">{message}</div>;
}
