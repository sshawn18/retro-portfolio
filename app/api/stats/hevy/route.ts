import { NextResponse } from "next/server";
import { getHevyWorkouts } from "@/lib/stats/hevy";

export const revalidate = 300; // 5 min cache

export async function GET() {
  const apiKey = process.env.HEVY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { workouts: [], page_count: 0, error: "HEVY_API_KEY not set", fetchedAt: Date.now() },
      { status: 200 } // return 200 so the window shows the error gracefully
    );
  }

  const data = await getHevyWorkouts(apiKey, 10);
  return NextResponse.json(data);
}
