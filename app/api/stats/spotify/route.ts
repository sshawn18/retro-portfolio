import { NextResponse } from "next/server";
import { getSpotifyNow } from "@/lib/stats/spotify";

// Refresh on the server every 20s. The client polls every 30s, so the
// worst case is the client seeing data ~50s old.
export const revalidate = 20;

export async function GET() {
  const data = await getSpotifyNow();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=20, stale-while-revalidate=60",
    },
  });
}
