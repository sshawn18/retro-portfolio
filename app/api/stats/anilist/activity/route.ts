import { NextResponse } from "next/server";
import { getAnilistActivity } from "@/lib/stats/anilist";
import { site } from "@/content/site";

export const revalidate = 0; // always fresh — activity feed should be live

export async function GET() {
  const data = await getAnilistActivity(site.anilistUsername, 30);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
