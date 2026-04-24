"use client";

import { useEffect, useRef, useState } from "react";
import type { SpotifyNow } from "@/lib/stats/spotify";

const POLL_MS = 30_000;

function formatMs(ms: number | null): string {
  if (ms == null) return "--:--";
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function NowPlayingWindow() {
  const [data, setData] = useState<SpotifyNow | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const lastFetchedAt = useRef<number>(Date.now());

  // Fetch now-playing every POLL_MS, and once on mount.
  useEffect(() => {
    let cancelled = false;
    const fetchNow = async () => {
      try {
        const res = await fetch("/api/stats/spotify", {
          cache: "no-store",
        });
        const json = (await res.json()) as SpotifyNow;
        if (!cancelled) {
          setData(json);
          lastFetchedAt.current = Date.now();
        }
      } catch {
        /* keep previous data */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchNow();
    const id = setInterval(fetchNow, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Local 1s tick so the progress bar advances smoothly between fetches.
  useEffect(() => {
    if (!data?.isPlaying) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [data?.isPlaying]);

  // Projected progress (interpolated since last fetch) for smooth playback.
  const projectedProgressMs =
    data?.isPlaying && data.progressMs != null && data.durationMs != null
      ? Math.min(
          data.durationMs,
          data.progressMs + (now - lastFetchedAt.current)
        )
      : data?.progressMs ?? null;

  const pct =
    data?.durationMs && projectedProgressMs != null
      ? Math.min(100, Math.max(0, (projectedProgressMs / data.durationMs) * 100))
      : 0;

  // ── Render states ──────────────────────────────────────────
  if (loading && !data) return <LoadingState />;

  const notConfigured =
    data?.error &&
    /SPOTIFY_CLIENT_ID|SPOTIFY_REFRESH_TOKEN|missing env/i.test(data.error);
  if (notConfigured) return <NotConfiguredState message={data!.error!} />;

  if (data?.error) return <ErrorState message={data.error} />;

  if (!data || !data.title) return <NothingState />;

  return (
    <div className="text-[12px] leading-[1.5]">
      <fieldset>
        <legend>{data.isPlaying ? "Now Playing" : "Last played"}</legend>
        <div className="flex gap-3 items-start">
          {data.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.albumArt}
              alt={data.album ?? "Album art"}
              width={80}
              height={80}
              style={{
                width: 80,
                height: 80,
                border: "1px inset #808080",
                imageRendering: "auto",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                border: "1px inset #808080",
                background: "#000",
              }}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: data.isPlaying ? "#0a0" : "#888",
                  boxShadow: data.isPlaying
                    ? "0 0 4px #0a0"
                    : undefined,
                  display: "inline-block",
                }}
              />
              <span className="text-[10px] uppercase tracking-[0.15em]">
                {data.isPlaying ? "▶ playing" : data.stale ? "⏹ last played" : "⏸ paused"}
              </span>
            </div>
            <div
              className="font-bold truncate"
              title={data.title ?? undefined}
            >
              {data.title}
            </div>
            <div className="opacity-80 truncate" title={data.artist ?? undefined}>
              {data.artist}
            </div>
            {data.album ? (
              <div className="opacity-60 text-[11px] truncate mt-0.5">
                {data.album}
              </div>
            ) : null}
          </div>
        </div>

        {/* Progress bar — only when we have duration */}
        {data.durationMs != null ? (
          <div className="mt-3">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pct)}
              style={{
                width: "100%",
                height: 12,
                border: "1px solid",
                borderColor: "#808080 #fff #fff #808080",
                padding: 2,
                background: "#c0c0c0",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background:
                    "repeating-linear-gradient(to right, #000080 0 6px, #c0c0c0 6px 8px)",
                  transition: "width 300ms linear",
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] opacity-70">
              <span>{formatMs(projectedProgressMs)}</span>
              <span>{formatMs(data.durationMs)}</span>
            </div>
          </div>
        ) : null}

        {data.trackUrl ? (
          <div className="mt-3 text-[11px]">
            <a href={data.trackUrl} target="_blank" rel="noreferrer">
              open in Spotify →
            </a>
          </div>
        ) : null}
      </fieldset>

      <div className="status-bar mt-3">
        <p className="status-bar-field">Spotify</p>
        <p className="status-bar-field">
          refreshed {secondsAgo(lastFetchedAt.current, now)}s ago
        </p>
      </div>
    </div>
  );
}

function secondsAgo(then: number, now: number) {
  return Math.max(0, Math.floor((now - then) / 1000));
}

function LoadingState() {
  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>Now Playing</legend>
        <div className="opacity-70">connecting to Spotify…</div>
      </fieldset>
    </div>
  );
}

function NothingState() {
  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>Now Playing</legend>
        <div>
          <p className="mb-2">Nothing is playing right now.</p>
          <p className="opacity-70">
            Play something on Spotify and this window will update within 30
            seconds.
          </p>
        </div>
      </fieldset>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>Now Playing — error</legend>
        <p className="mb-2">Something went wrong talking to Spotify:</p>
        <pre
          className="text-[11px] p-2"
          style={{
            border: "1px inset #808080",
            background: "#fff",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message}
        </pre>
      </fieldset>
    </div>
  );
}

function NotConfiguredState({ message }: { message: string }) {
  return (
    <div className="text-[12px] leading-[1.55]">
      <fieldset>
        <legend>Spotify — setup required</legend>
        <p className="mb-2">
          Add your credentials to <code>.env.local</code>, then restart the dev
          server.
        </p>
        <ol className="pl-5 space-y-1 mb-3">
          <li>
            Create an app at{" "}
            <a
              href="https://developer.spotify.com/dashboard"
              target="_blank"
              rel="noreferrer"
            >
              developer.spotify.com/dashboard
            </a>
          </li>
          <li>
            Add redirect URI{" "}
            <code>http://localhost:3000/api/auth/spotify/callback</code>
          </li>
          <li>
            Put <code>SPOTIFY_CLIENT_ID</code> and{" "}
            <code>SPOTIFY_CLIENT_SECRET</code> in <code>.env.local</code>
          </li>
          <li>
            Visit{" "}
            <a href="/api/auth/spotify/authorize">
              /api/auth/spotify/authorize
            </a>{" "}
            and copy the <code>SPOTIFY_REFRESH_TOKEN</code> it returns
          </li>
          <li>Restart <code>npm run dev</code></li>
        </ol>
        <pre
          className="text-[10px] p-2"
          style={{
            border: "1px inset #808080",
            background: "#fff",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message}
        </pre>
      </fieldset>
    </div>
  );
}
