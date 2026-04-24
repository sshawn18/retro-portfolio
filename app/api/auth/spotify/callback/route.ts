import { NextResponse } from "next/server";

/**
 * Spotify OAuth callback. Exchanges the auth code for a refresh token,
 * then renders a minimal HTML page showing the token so the user can
 * copy it into .env.local as SPOTIFY_REFRESH_TOKEN.
 *
 * This page does NOT store anything on disk — it just displays the
 * value once. Reload the authorize URL if you need to re-generate.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return new NextResponse(`Spotify returned error: ${error}`, {
      status: 400,
    });
  }
  if (!code) {
    return new NextResponse("missing `code` query param", { status: 400 });
  }

  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) {
    return new NextResponse(
      "SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET missing from .env.local",
      { status: 500 }
    );
  }

  // Must exactly match the redirect_uri sent to /authorize, which forces
  // 127.0.0.1 since Spotify no longer accepts `localhost`.
  const origin = url.origin.replace("://localhost:", "://127.0.0.1:");
  const redirect = `${origin}/api/auth/spotify/callback`;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirect,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !json.refresh_token) {
    return new NextResponse(
      `token exchange failed: ${JSON.stringify(json, null, 2)}`,
      { status: 500 }
    );
  }

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Spotify refresh token</title>
    <style>
      body { background:#008080; color:#fff; font-family:ui-monospace,monospace; padding:2rem; }
      .card { background:#c0c0c0; color:#000; border:2px outset #fff; padding:1.25rem; max-width:700px; box-shadow:2px 2px 0 rgba(0,0,0,0.35); }
      h1 { margin:0 0 0.75rem; font-size:1.1rem; }
      code, pre { background:#fff; border:1px inset #808080; padding:0.5rem; display:block; user-select:all; word-break:break-all; font-size:12px; }
      p { font-size:13px; line-height:1.55; }
      ol { padding-left:1.25rem; font-size:13px; line-height:1.7; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>✓ Spotify connected</h1>
      <p>Paste this into <b>.env.local</b> at the project root, then restart <code>npm run dev</code>.</p>
      <pre>SPOTIFY_REFRESH_TOKEN=${json.refresh_token}</pre>
      <p><b>Scopes granted:</b> ${json.scope ?? "(none reported)"}</p>
      <ol>
        <li>Open <code>X:/CC/retro-portfolio/.env.local</code> (create it if it doesn't exist).</li>
        <li>Add the line above alongside your existing <code>SPOTIFY_CLIENT_ID</code> and <code>SPOTIFY_CLIENT_SECRET</code>.</li>
        <li>Stop the dev server (Ctrl+C) and run <code>npm run dev</code> again.</li>
        <li>Open the desktop and double-click the <b>Now Playing</b> icon.</li>
      </ol>
    </div>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
