import type { Metadata } from "next";
import { hasSupabaseEnv } from "@/lib/env";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Setup",
};

export default function SetupPage() {
  if (hasSupabaseEnv()) {
    redirect("/login");
  }

  return (
    <main className="page page--narrow">
      <p className="pill">Setup</p>
      <h1>Connect Supabase</h1>
      <p className="lede">
        Blackletter Lab needs a Supabase project before it can authenticate or
        persist Artifacts.
      </p>
      <div className="panel">
        <p className="label panel__label">Required steps</p>
        <ol className="setup-list">
          <li>
            Create a Supabase project and copy the URL and anon key into{" "}
            <code>apps/lab/.env.local</code> (see <code>.env.example</code>).
          </li>
          <li>
            Run the SQL in{" "}
            <code>apps/lab/supabase/migrations/001_initial.sql</code> in the
            Supabase SQL editor.
          </li>
          <li>
            Confirm the private <code>artifacts</code> storage bucket exists.
          </li>
          <li>
            Restart <code>npm run dev</code> and open{" "}
            <code>/login</code> to create your account.
          </li>
        </ol>
      </div>
      <p className="banner banner--warn" style={{ marginTop: "1.25rem" }}>
        The MVP is private-by-default and is not represented as approved for
        client-confidential information.
      </p>
    </main>
  );
}
