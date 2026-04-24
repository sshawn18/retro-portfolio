/**
 * Spotify now-playing fetcher — server-only.
 *
 * Auth model: a long-lived refresh token (generated once via the
 * /api/auth/spotify flow) is exchanged for a short-lived access token on
 * every request. We never ship the refresh token to the client.
 *
 * Endpoints used:
 *   POST https://accounts.spotify.com/api/token
 *   GET  https://api.spotify.com/v1/me/player/currently-playing
 *   GET  https://api.spotify.com/v1/me/player/recently-played?limit=1   (fallback)
 */

export type SpotifyNow = {
  isPlaying: boolean;
  title: string | null;
  artist: string | null;
  album: string | null;
  albumArt: string | null;
  trackUrl: string | null;
  progressMs: number | null;
  durationMs: number | null;
  /** Indicates the data is from recently-played rather than live. */
  stale: boolean;
  /** Human-readable error, null on success. */
  error: string | null;
  /** ms timestamp at which the server produced this payload. */
  fetchedAt: number;
};

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

function emptyPayload(error: string | null = null, stale = false): SpotifyNow {
  return {
    isPlaying: false,
    title: null,
    artist: null,
    album: null,
    albumArt: null,
    trackUrl: null,
    progressMs: null,
    durationMs: null,
    stale,
    error,
    fetchedAt: Date.now(),
  };
}

async function getAccessToken(): Promise<string> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) {
    throw new Error(
      "missing env: SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN"
    );
  }
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refresh,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`token refresh ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("no access_token in response");
  return json.access_token;
}

type Artist = { name: string };
type Album = { name?: string; images?: { url: string }[] };
type Track = {
  name: string;
  artists?: Artist[];
  album?: Album;
  external_urls?: { spotify?: string };
  duration_ms?: number;
};

function trackToPayload(
  track: Track,
  progressMs: number | null,
  isPlaying: boolean,
  stale: boolean
): SpotifyNow {
  return {
    isPlaying,
    title: track.name,
    artist: (track.artists ?? []).map((a) => a.name).join(", ") || null,
    album: track.album?.name ?? null,
    albumArt: track.album?.images?.[0]?.url ?? null,
    trackUrl: track.external_urls?.spotify ?? null,
    progressMs,
    durationMs: track.duration_ms ?? null,
    stale,
    error: null,
    fetchedAt: Date.now(),
  };
}

export async function getSpotifyNow(): Promise<SpotifyNow> {
  let token: string;
  try {
    token = await getAccessToken();
  } catch (err) {
    return emptyPayload(err instanceof Error ? err.message : "token error");
  }

  const authHeader = { Authorization: `Bearer ${token}` };

  // 1. Currently playing — may be 204 (nothing playing).
  try {
    const res = await fetch(NOW_URL, {
      headers: authHeader,
      cache: "no-store",
    });
    if (res.status === 200) {
      const json = (await res.json()) as {
        is_playing?: boolean;
        progress_ms?: number;
        item?: Track | null;
      };
      if (json?.item) {
        return trackToPayload(
          json.item,
          json.progress_ms ?? null,
          json.is_playing ?? false,
          false
        );
      }
    } else if (res.status !== 204) {
      const text = await res.text().catch(() => "");
      throw new Error(`now-playing ${res.status}: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    return emptyPayload(err instanceof Error ? err.message : "now-playing error");
  }

  // 2. Fallback: most recently played track.
  try {
    const res = await fetch(RECENT_URL, {
      headers: authHeader,
      cache: "no-store",
    });
    if (res.ok) {
      const json = (await res.json()) as { items?: { track: Track }[] };
      const track = json?.items?.[0]?.track;
      if (track) return trackToPayload(track, null, false, true);
    }
  } catch {
    /* ignored — fall through to empty */
  }

  return emptyPayload(null);
}
