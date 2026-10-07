import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Daily keep-alive, called by the Vercel cron declared in vercel.json. Supabase's free
// tier pauses a project after ~7 days without activity, which takes the whole app down
// (DNS for the project disappears). One trivial query a day is enough to count as activity.
//
// Vercel sends `Authorization: Bearer $CRON_SECRET` when that env var is set on the
// project. Without the secret configured we refuse everyone, so the endpoint is never
// an open door to hammer the database.
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true });
}
