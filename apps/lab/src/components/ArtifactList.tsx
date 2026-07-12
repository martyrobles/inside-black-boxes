import Link from "next/link";
import {
  ARTIFACT_TYPE_LABELS,
  type Artifact,
} from "@/lib/types";

type ArtifactListProps = {
  artifacts: Artifact[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function ArtifactList({ artifacts }: ArtifactListProps) {
  if (artifacts.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Artifacts yet</h2>
        <p className="muted">
          Capture a note, image, document, or URL to begin your library.
        </p>
        <Link href="/capture" className="btn btn--primary">
          Capture something
        </Link>
      </div>
    );
  }

  return (
    <ul className="artifact-list">
      {artifacts.map((artifact) => (
        <li key={artifact.id}>
          <Link href={`/artifacts/${artifact.id}`} className="artifact-row">
            <div className="artifact-row__main">
              <span className="pill">{ARTIFACT_TYPE_LABELS[artifact.type]}</span>
              <h2 className="artifact-row__title">
                {artifact.title || "Untitled Artifact"}
              </h2>
              <p className="artifact-row__desc muted">
                {artifact.user_description}
              </p>
            </div>
            <time
              className="artifact-row__date muted small"
              dateTime={artifact.created_at}
            >
              {formatDate(artifact.created_at)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
