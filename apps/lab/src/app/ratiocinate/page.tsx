import type { Metadata } from "next";
import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/env";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Ratiocinate",
};

export default function RatiocinatePage() {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  return (
    <main className="ratiocinate">
      <div className="ratiocinate__inner">
        <p className="pill">Coming soon</p>
        <h1>Ratiocinate</h1>
        <p className="lede muted">
          A quieter mode for working through what something means — still being
          shaped.
        </p>
        <p className="ratiocinate__links">
          <Link href="/">← Home</Link>
          <Link href="/library">Library</Link>
          <Link href="/capture">Capture</Link>
        </p>
      </div>
    </main>
  );
}
