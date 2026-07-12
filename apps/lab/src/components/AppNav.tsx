import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

type AppNavProps = {
  email?: string | null;
};

export function AppNav({ email }: AppNavProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__mark">BL</span>
          <span className="brand__name">Blackletter Lab</span>
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link href="/capture">Capture</Link>
          <Link href="/library">Library</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/ideas">Ideas</Link>
          <Link href="/projects">Projects</Link>
        </nav>
        <div className="site-header__meta">
          {email ? <span className="muted small">{email}</span> : null}
          <form action={signOut}>
            <button type="submit" className="btn btn--ghost btn--small">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
