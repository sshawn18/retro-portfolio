import { NextResponse } from "next/server";
import { getWatchlistPage } from "@/lib/stats/letterboxd-scrape";
import { site } from "@/content/site";

export const revalidate = 1800; // 30 min

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const data = await getWatchlistPage(site.letterboxdUsername, page);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
