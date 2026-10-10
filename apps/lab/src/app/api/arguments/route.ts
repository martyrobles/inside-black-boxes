import { NextResponse } from "next/server";
import { readJob, startArgumentJob } from "@/lib/arguments/run";
import type { ArgumentRequest } from "@/lib/arguments/types";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  const job = await readJob();
  return NextResponse.json({ job });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

  const body = (await request.json()) as Partial<ArgumentRequest>;
  const input: ArgumentRequest = {
    docket: String(body.docket ?? "").trim(),
    year: String(body.year ?? "").trim(),
    name: String(body.name ?? "").trim(),
    slug: String(body.slug ?? "").trim().toLowerCase(),
    status: String(body.status ?? "No opinion yet").trim(),
    holding: String(body.holding ?? ""),
    counsel: String(body.counsel ?? ""),
    replace: Boolean(body.replace),
  };
  const started = startArgumentJob(input);
  if ("error" in started) {
    return NextResponse.json({ error: started.error }, { status: 400 });
  }
  return NextResponse.json(started);
}
