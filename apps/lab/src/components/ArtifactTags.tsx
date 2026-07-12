"use client";

import { useActionState } from "react";
import {
  addTagToArtifact,
  removeTagFromArtifact,
  type TagActionState,
} from "@/lib/actions/tags";
import type { Tag } from "@/lib/types";

type ArtifactTagsProps = {
  artifactId: string;
  tags: Tag[];
};

const initial: TagActionState = {};

export function ArtifactTags({ artifactId, tags }: ArtifactTagsProps) {
  const [addState, addAction, addPending] = useActionState(
    addTagToArtifact,
    initial,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeTagFromArtifact,
    initial,
  );

  return (
    <section className="panel">
      <p className="label panel__label">Tags</p>
      {tags.length === 0 ? (
        <p className="muted small">No tags yet.</p>
      ) : (
        <ul className="tag-list">
          {tags.map((tag) => (
            <li key={tag.id} className="tag-chip">
              <span>{tag.name}</span>
              <form action={removeAction}>
                <input type="hidden" name="artifact_id" value={artifactId} />
                <input type="hidden" name="tag_id" value={tag.id} />
                <button
                  type="submit"
                  className="tag-chip__remove"
                  disabled={removePending}
                  aria-label={`Remove tag ${tag.name}`}
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={addAction} className="inline-form">
        <input type="hidden" name="artifact_id" value={artifactId} />
        <input
          type="text"
          name="name"
          className="input"
          placeholder="Add a tag"
          required
        />
        <button type="submit" className="btn btn--ghost" disabled={addPending}>
          {addPending ? "Adding…" : "Add"}
        </button>
      </form>

      {addState.error || removeState.error ? (
        <p className="banner banner--error" role="alert">
          {addState.error || removeState.error}
        </p>
      ) : null}
      {addState.success ? (
        <p className="muted small">{addState.success}</p>
      ) : null}
    </section>
  );
}
