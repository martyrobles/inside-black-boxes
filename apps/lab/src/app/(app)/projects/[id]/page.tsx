import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtifactList } from "@/components/ArtifactList";
import { EntityConnections } from "@/components/EntityConnections";
import { softDeleteProject } from "@/lib/actions/projects";
import { createClient } from "@/lib/supabase/server";
import {
  getArtifactsForProject,
  getConnectionsForEntity,
  getIdeasForProject,
  listConnectionTargets,
} from "@/lib/queries";
import type { Project } from "@/lib/types";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Project ${id.slice(0, 8)}` };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) notFound();
  const project = data as Project;

  const [ideas, artifacts, connections, targets] = await Promise.all([
    getIdeasForProject(id),
    getArtifactsForProject(id),
    getConnectionsForEntity("project", id),
    listConnectionTargets(),
  ]);

  return (
    <div className="page">
      <header className="page-header">
        <p className="pill">Projects Underway · {project.status}</p>
        <h1>{project.title}</h1>
        {project.goal ? <p className="lede">{project.goal}</p> : null}
        <p>
          <Link href="/projects">← Projects</Link>
        </p>
      </header>

      <div className="detail-grid">
        <section className="detail-stack">
          <div className="panel">
            <p className="label panel__label">Thesis / premise</p>
            <p className="prose">{project.thesis || "Not set yet."}</p>
          </div>

          <div>
            <h2 style={{ marginBottom: "0.75rem" }}>Related Ideas</h2>
            {ideas.length === 0 ? (
              <p className="muted">No Ideas linked.</p>
            ) : (
              <ul className="artifact-list">
                {ideas.map((idea) => (
                  <li key={idea.id}>
                    <Link href={`/ideas/${idea.id}`} className="artifact-row">
                      <div className="artifact-row__main">
                        <span className="pill">Idea</span>
                        <h2 className="artifact-row__title">{idea.title}</h2>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 style={{ marginBottom: "0.75rem" }}>Source Artifacts</h2>
            <ArtifactList artifacts={artifacts} />
          </div>
        </section>

        <EntityConnections
          entityType="project"
          entityId={id}
          returnPath={`/projects/${id}`}
          connections={connections}
          targets={targets}
        />
      </div>

      <form action={softDeleteProject} style={{ marginTop: "2.5rem" }}>
        <input type="hidden" name="project_id" value={id} />
        <button type="submit" className="btn btn--ghost">
          Archive Project
        </button>
      </form>
    </div>
  );
}
