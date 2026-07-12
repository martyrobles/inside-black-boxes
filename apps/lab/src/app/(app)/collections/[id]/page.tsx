import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtifactList } from "@/components/ArtifactList";
import { softDeleteCollection } from "@/lib/actions/collections";
import { createClient } from "@/lib/supabase/server";
import type { Artifact, Collection } from "@/lib/types";

type CollectionPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Collection ${id.slice(0, 8)}` };
}

export default async function CollectionDetailPage({
  params,
}: CollectionPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: collection, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !collection) {
    notFound();
  }

  const value = collection as Collection;

  const { data: links } = await supabase
    .from("collection_artifacts")
    .select("artifact_id")
    .eq("collection_id", id);

  const artifactIds = (links ?? []).map((row) => row.artifact_id as string);

  let artifacts: Artifact[] = [];
  if (artifactIds.length > 0) {
    const { data } = await supabase
      .from("artifacts")
      .select("*")
      .in("id", artifactIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    artifacts = (data ?? []) as Artifact[];
  }

  return (
    <div className="page">
      <header className="page-header">
        <p className="pill">Collection</p>
        <h1>{value.title}</h1>
        {value.description ? <p className="lede">{value.description}</p> : null}
        <p>
          <Link href="/collections">← Collections</Link>
        </p>
      </header>

      <ArtifactList artifacts={artifacts} />

      {artifacts.length === 0 ? (
        <p className="muted" style={{ marginTop: "1rem" }}>
          Open an Artifact and use <strong>Collections</strong> on its page to
          add it here.
        </p>
      ) : null}

      <form action={softDeleteCollection} style={{ marginTop: "2.5rem" }}>
        <input type="hidden" name="collection_id" value={id} />
        <button type="submit" className="btn btn--ghost">
          Archive Collection
        </button>
      </form>
    </div>
  );
}
