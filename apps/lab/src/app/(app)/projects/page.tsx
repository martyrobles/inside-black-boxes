import type { Metadata } from "next";
import Link from "next/link";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { listProjects } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Projects Underway",
};

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="page">
      <header className="page-header">
        <p className="pill">Projects Underway</p>
        <h1>Sustained work</h1>
        <p className="lede">
          Projects develop Ideas into something real — including Inside Black
          Boxes and other efforts.
        </p>
      </header>

      <div className="detail-grid">
        <section>
          {projects.length === 0 ? (
            <div className="empty-state">
              <h2>No Projects yet</h2>
              <p className="muted">
                Convert an Idea, or create a Project here.
              </p>
              <Link href="/ideas" className="btn btn--primary">
                Open Ideas
              </Link>
            </div>
          ) : (
            <ul className="artifact-list">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="artifact-row"
                  >
                    <div className="artifact-row__main">
                      <span className="pill">{project.status}</span>
                      <h2 className="artifact-row__title">{project.title}</h2>
                      {project.goal ? (
                        <p className="artifact-row__desc muted">{project.goal}</p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside>
          <h2 style={{ marginBottom: "1rem" }}>New Project</h2>
          <CreateProjectForm />
        </aside>
      </div>
    </div>
  );
}
