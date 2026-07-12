import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtifactList } from "@/components/ArtifactList";
import { ConvertToProjectForm } from "@/components/ConvertToProjectForm";
import { EntityConnections } from "@/components/EntityConnections";
import { LinkArtifactToIdeaForm } from "@/components/LinkArtifactToIdeaForm";
import { softDeleteIdea } from "@/lib/actions/ideas";
import { createClient } from "@/lib/supabase/server";
import {
  getArtifactsForIdea,
  getConnectionsForEntity,
  listArtifactsBrief,
  listConnectionTargets,
} from "@/lib/queries";
import type { Idea } from "@/lib/types";

type IdeaPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: IdeaPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Idea ${id.slice(0, 8)}` };
}

export default async function IdeaDetailPage({ params }: IdeaPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) notFound();
  const idea = data as Idea;

  const [artifacts, allArtifacts, connections, targets] = await Promise.all([
    getArtifactsForIdea(id),
    listArtifactsBrief(),
    getConnectionsForEntity("idea", id),
    listConnectionTargets(),
  ]);

  return (
    <div className="page">
      <header className="page-header">
        <p className="pill">{idea.status}</p>
        <h1>{idea.title}</h1>
        {idea.premise ? <p className="lede">{idea.premise}</p> : null}
        <p>
          <Link href="/ideas">← Ideas</Link>
        </p>
      </header>

      <div className="detail-grid">
        <section>
          <h2 style={{ marginBottom: "1rem" }}>Source Artifacts</h2>
          <ArtifactList artifacts={artifacts} />
          <div style={{ marginTop: "1rem" }}>
            <LinkArtifactToIdeaForm
              ideaId={id}
              artifacts={allArtifacts}
              linkedIds={artifacts.map((a) => a.id)}
            />
          </div>
        </section>
        <div className="detail-stack">
          <ConvertToProjectForm
            ideaId={id}
            defaultTitle={idea.title}
            defaultThesis={idea.premise}
          />
          <EntityConnections
            entityType="idea"
            entityId={id}
            returnPath={`/ideas/${id}`}
            connections={connections}
            targets={targets}
          />
        </div>
      </div>

      <form action={softDeleteIdea} style={{ marginTop: "2.5rem" }}>
        <input type="hidden" name="idea_id" value={id} />
        <button type="submit" className="btn btn--ghost">
          Archive Idea
        </button>
      </form>
    </div>
  );
}
