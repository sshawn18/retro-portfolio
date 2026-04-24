import { NextResponse } from "next/server";
import { getLetterboxd } from "@/lib/stats/letterboxd";
import { site } from "@/content/site";

// Server-side cache for 10 minutes — feeds don't move often.
export const revalidate = 600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get("limit") ?? "20") || 20)
  );
  const data = await getLetterboxd(site.letterboxdUsername, limit);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
