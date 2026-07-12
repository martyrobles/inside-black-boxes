import type { Metadata } from "next";
import Link from "next/link";
import { ArtifactList } from "@/components/ArtifactList";
import { LibrarySearch } from "@/components/LibrarySearch";
import { searchArtifacts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Library",
};

type LibraryPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const { artifacts, error } = await searchArtifacts(query);

  return (
    <div className="page">
      <header className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p className="pill">Library</p>
            <h1>Artifacts</h1>
            <p className="lede">
              Everything you have captured. Search titles, descriptions, and
              original text.
            </p>
          </div>
          <Link href="/capture" className="btn btn--primary">
            Capture
          </Link>
        </div>
      </header>

      <LibrarySearch initialQuery={query} />

      {error ? (
        <p className="banner banner--error" role="alert">
          Could not search: {error}. If this mentions search_vector, run{" "}
          <code>004_tags_collections_search.sql</code> in Supabase.
        </p>
      ) : null}

      {query && !error ? (
        <p className="muted small" style={{ margin: "1rem 0" }}>
          {artifacts.length === 0
            ? `No results for “${query}”.`
            : `${artifacts.length} result${artifacts.length === 1 ? "" : "s"} for “${query}”.`}
        </p>
      ) : null}

      {!error ? <ArtifactList artifacts={artifacts} /> : null}
    </div>
  );
}
