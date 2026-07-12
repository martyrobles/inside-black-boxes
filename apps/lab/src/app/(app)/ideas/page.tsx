import type { Metadata } from "next";
import Link from "next/link";
import { CreateIdeaForm } from "@/components/CreateIdeaForm";
import { listIdeas } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Ideas",
};

export default async function IdeasPage() {
  const ideas = await listIdeas();

  return (
    <div className="page">
      <header className="page-header">
        <p className="pill">Ideas</p>
        <h1>Concepts in development</h1>
        <p className="lede">
          Ideas are propositions derived from Artifacts. Incubate them before
          promoting to a Project.
        </p>
      </header>

      <div className="detail-grid">
        <section>
          {ideas.length === 0 ? (
            <div className="empty-state">
              <h2>No Ideas yet</h2>
              <p className="muted">
                Convert an Artifact, or create an Idea here.
              </p>
              <Link href="/library" className="btn btn--primary">
                Open Library
              </Link>
            </div>
          ) : (
            <ul className="artifact-list">
              {ideas.map((idea) => (
                <li key={idea.id}>
                  <Link href={`/ideas/${idea.id}`} className="artifact-row">
                    <div className="artifact-row__main">
                      <span className="pill">{idea.status}</span>
                      <h2 className="artifact-row__title">{idea.title}</h2>
                      {idea.premise ? (
                        <p className="artifact-row__desc muted">{idea.premise}</p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside>
          <h2 style={{ marginBottom: "1rem" }}>New Idea</h2>
          <CreateIdeaForm />
        </aside>
      </div>
    </div>
  );
}
