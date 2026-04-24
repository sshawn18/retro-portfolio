import { NextResponse } from "next/server";
import { getAnilistActivity } from "@/lib/stats/anilist";
import { site } from "@/content/site";

export const revalidate = 600; // 10 min

export async function GET() {
  const data = await getAnilistActivity(site.anilistUsername, 30);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
