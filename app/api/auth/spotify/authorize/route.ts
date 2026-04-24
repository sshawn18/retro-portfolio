import { NextResponse } from "next/server";

/**
 * Kicks off the one-time OAuth dance to get a long-lived refresh token.
 *
 * Prerequisites in your .env.local:
 *   SPOTIFY_CLIENT_ID=...
 *   SPOTIFY_CLIENT_SECRET=...
 *
 * Prerequisites in the Spotify Developer Dashboard:
 *   Add this exact redirect URI to your app:
 *     http://127.0.0.1:3000/api/auth/spotify/callback
 *   (Spotify stopped accepting `localhost` — you must use the loopback IP.)
 *
 * Flow: visit /api/auth/spotify/authorize → Spotify login →
 *       /api/auth/spotify/callback shows you the refresh_token to paste
 *       into .env.local as SPOTIFY_REFRESH_TOKEN.
 *
 * Note: we normalize `localhost` → `127.0.0.1` in the origin so it doesn't
 * matter which spelling you use to visit this endpoint. Same reason we do
 * it in the callback route — the redirect_uri sent to /api/token has to
 * byte-match what we sent to /authorize.
 */
function normalizeOrigin(origin: string): string {
  return origin.replace("://localhost:", "://127.0.0.1:");
}

export async function GET(request: Request) {
  const id = process.env.SPOTIFY_CLIENT_ID;
  if (!id) {
    return new NextResponse(
      "SPOTIFY_CLIENT_ID is missing from .env.local",
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const origin = normalizeOrigin(url.origin);
  const redirect = `${origin}/api/auth/spotify/callback`;

  const scope = [
    "user-read-currently-playing",
    "user-read-recently-played",
  ].join(" ");

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.set("client_id", id);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirect);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("show_dialog", "true");

  return NextResponse.redirect(authUrl.toString());
}
