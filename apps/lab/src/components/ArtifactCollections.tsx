"use client";

import { useActionState } from "react";
import {
  addArtifactToCollection,
  removeArtifactFromCollection,
  type CollectionActionState,
} from "@/lib/actions/collections";
import type { Collection } from "@/lib/types";
import Link from "next/link";

type ArtifactCollectionsProps = {
  artifactId: string;
  memberships: Collection[];
  allCollections: Collection[];
};

const initial: CollectionActionState = {};

export function ArtifactCollections({
  artifactId,
  memberships,
  allCollections,
}: ArtifactCollectionsProps) {
  const [addState, addAction, addPending] = useActionState(
    addArtifactToCollection,
    initial,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeArtifactFromCollection,
    initial,
  );

  const memberIds = new Set(memberships.map((c) => c.id));
  const available = allCollections.filter((c) => !memberIds.has(c.id));

  return (
    <section className="panel">
      <p className="label panel__label">Collections</p>
      {memberships.length === 0 ? (
        <p className="muted small">Not in any Collection yet.</p>
      ) : (
        <ul className="collection-membership">
          {memberships.map((collection) => (
            <li key={collection.id}>
              <Link href={`/collections/${collection.id}`}>
                {collection.title}
              </Link>
              <form action={removeAction}>
                <input type="hidden" name="artifact_id" value={artifactId} />
                <input
                  type="hidden"
                  name="collection_id"
                  value={collection.id}
                />
                <button
                  type="submit"
                  className="btn btn--ghost btn--small"
                  disabled={removePending}
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 ? (
        <form action={addAction} className="inline-form">
          <input type="hidden" name="artifact_id" value={artifactId} />
          <select name="collection_id" className="input" required defaultValue="">
            <option value="" disabled>
              Add to Collection…
            </option>
            {available.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.title}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn--ghost" disabled={addPending}>
            {addPending ? "Adding…" : "Add"}
          </button>
        </form>
      ) : (
        <p className="muted small">
          <Link href="/collections">Create a Collection</Link> to group this
          Artifact.
        </p>
      )}

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
