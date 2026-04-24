import { NextResponse } from "next/server";
import { getAnilistCollection } from "@/lib/stats/anilist";
import { site } from "@/content/site";

export const revalidate = 1800;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("type")?.toUpperCase();
  const type: "ANIME" | "MANGA" = raw === "MANGA" ? "MANGA" : "ANIME";
  const data = await getAnilistCollection(site.anilistUsername, type);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
