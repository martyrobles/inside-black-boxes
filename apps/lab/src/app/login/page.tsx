import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";
import { hasSupabaseEnv } from "@/lib/env";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (!hasSupabaseEnv()) {
    redirect("/setup");
  }

  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/library";

  return (
    <main className="login-shell">
      <section className="login-shell__visual" aria-hidden="true">
        <Image
          src="/login-hero.png"
          alt=""
          fill
          priority
          className="login-shell__image"
          sizes="(max-width: 900px) 100vw, 58vw"
        />
        <div className="login-shell__scrim" />
      </section>

      <section className="login-shell__panel">
        <div className="login-shell__panel-inner">
          <p className="login-kicker">Private</p>
          <h1 className="login-brand">Blackletter Lab</h1>
          <p className="login-tagline">Your private legaltech idea lab</p>
          <p className="login-motif">Capture. Connect. Develop.</p>
          <p className="lede login-lede">
            A private research library and creative studio. Sign in to capture
            material before you know what it will become.
          </p>

          <LoginForm nextPath={nextPath} />

          <p className="muted small login-disclaimer">
            Not approved for client-confidential information in this MVP.
          </p>
        </div>
      </section>
    </main>
  );
}
