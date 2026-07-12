import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtifactAiPanel } from "@/components/ArtifactAiPanel";
import { ArtifactCollections } from "@/components/ArtifactCollections";
import { ArtifactTags } from "@/components/ArtifactTags";
import { ConvertToIdeaForm } from "@/components/ConvertToIdeaForm";
import { EntityConnections } from "@/components/EntityConnections";
import { createClient } from "@/lib/supabase/server";
import {
  getAiSuggestionsForArtifact,
  getCollectionsForArtifact,
  getConnectionsForEntity,
  getTagsForArtifact,
  listCollections,
  listConnectionTargets,
} from "@/lib/queries";
import {
  ARTIFACT_TYPE_LABELS,
  type Artifact,
} from "@/lib/types";

type ArtifactPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ArtifactPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Artifact ${id.slice(0, 8)}` };
}

export default async function ArtifactDetailPage({
  params,
}: ArtifactPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const artifact = data as Artifact;
  const [tags, memberships, allCollections, connections, targets, suggestions] =
    await Promise.all([
      getTagsForArtifact(id),
      getCollectionsForArtifact(id),
      listCollections(),
      getConnectionsForEntity("artifact", id),
      listConnectionTargets(),
      getAiSuggestionsForArtifact(id),
    ]);

  let signedUrl: string | null = null;

  if (artifact.storage_path) {
    const { data: signed } = await supabase.storage
      .from("artifacts")
      .createSignedUrl(artifact.storage_path, 60 * 30);
    signedUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="page">
      <header className="page-header">
        <p className="pill">{ARTIFACT_TYPE_LABELS[artifact.type]}</p>
        <h1>{artifact.title || "Untitled Artifact"}</h1>
        <p className="lede">
          Captured{" "}
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(artifact.created_at))}
        </p>
        <p>
          <Link href="/library">← Library</Link>
        </p>
      </header>

      <div className="detail-grid">
        <section className="panel">
          <p className="label panel__label">Original material</p>
          {artifact.type === "note" ? (
            <p className="prose">{artifact.body}</p>
          ) : null}

          {artifact.type === "url" ? (
            <div>
              <p className="muted small">Source URL</p>
              {artifact.source_url ? (
                <p>
                  <a href={artifact.source_url} target="_blank" rel="noreferrer">
                    {artifact.source_url}
                  </a>
                </p>
              ) : (
                <p className="muted">No URL stored.</p>
              )}
            </div>
          ) : null}

          {artifact.type === "image" && signedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signedUrl}
              alt={artifact.title || "Uploaded image"}
              className="preview-image"
            />
          ) : null}

          {artifact.type === "document" ? (
            <div>
              <p className="muted small">File</p>
              <p>{artifact.file_name || "Document"}</p>
              {signedUrl ? (
                <p>
                  <a href={signedUrl} target="_blank" rel="noreferrer">
                    Open / download
                  </a>
                </p>
              ) : (
                <p className="muted">Signed URL unavailable.</p>
              )}
            </div>
          ) : null}

          {artifact.type === "image" && !signedUrl ? (
            <p className="banner banner--error">
              Could not create a signed URL for this image.
            </p>
          ) : null}
        </section>

        <div className="detail-stack">
          <aside className="panel">
            <p className="label panel__label">Your description</p>
            <p className="prose">{artifact.user_description}</p>

            <ul className="meta-list" style={{ marginTop: "1.5rem" }}>
              <li>
                <span className="label">Intent</span>
                <span>
                  {artifact.intent === "unknown"
                    ? "I’m not sure yet"
                    : artifact.intent.replace("_", " ")}
                </span>
              </li>
              <li>
                <span className="label">Confidentiality</span>
                <span>{artifact.confidentiality.replace(/_/g, " ")}</span>
              </li>
              {artifact.mime_type ? (
                <li>
                  <span className="label">MIME type</span>
                  <span>{artifact.mime_type}</span>
                </li>
              ) : null}
              {artifact.file_size ? (
                <li>
                  <span className="label">File size</span>
                  <span>{(artifact.file_size / 1024).toFixed(1)} KB</span>
                </li>
              ) : null}
            </ul>
          </aside>

          <ArtifactTags artifactId={id} tags={tags} />
          <ArtifactCollections
            artifactId={id}
            memberships={memberships}
            allCollections={allCollections}
          />
          <ConvertToIdeaForm
            artifactId={id}
            defaultTitle={artifact.title || "Untitled idea"}
            defaultPremise={artifact.user_description}
          />
          <ArtifactAiPanel
            artifactId={id}
            suggestions={suggestions}
            aiConfigured={Boolean(process.env.OPENAI_API_KEY)}
            blockedByConfidentiality={
              artifact.confidentiality === "privileged" ||
              artifact.confidentiality === "do_not_send_to_model"
            }
          />
          <EntityConnections
            entityType="artifact"
            entityId={id}
            returnPath={`/artifacts/${id}`}
            connections={connections}
            targets={targets}
          />
        </div>
      </div>
    </div>
  );
}
