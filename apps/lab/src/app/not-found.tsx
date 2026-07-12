import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page page--narrow">
      <h1>Not found</h1>
      <p className="lede">That Artifact does not exist, or it was removed.</p>
      <Link href="/library" className="btn btn--primary">
        Back to Library
      </Link>
    </main>
  );
}
