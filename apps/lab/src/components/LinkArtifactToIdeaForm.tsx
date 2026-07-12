"use client";

import { useActionState } from "react";
import {
  addArtifactToIdea,
  type IdeaActionState,
} from "@/lib/actions/ideas";
import type { Artifact } from "@/lib/types";

type LinkArtifactToIdeaFormProps = {
  ideaId: string;
  artifacts: Pick<Artifact, "id" | "title" | "type">[];
  linkedIds: string[];
};

const initial: IdeaActionState = {};

export function LinkArtifactToIdeaForm({
  ideaId,
  artifacts,
  linkedIds,
}: LinkArtifactToIdeaFormProps) {
  const [state, action, pending] = useActionState(addArtifactToIdea, initial);
  const available = artifacts.filter((a) => !linkedIds.includes(a.id));

  if (available.length === 0) {
    return (
      <p className="muted small">All recent Artifacts are already linked.</p>
    );
  }

  return (
    <form action={action} className="inline-form">
      <input type="hidden" name="idea_id" value={ideaId} />
      <select name="artifact_id" className="input" required defaultValue="">
        <option value="" disabled>
          Link an Artifact…
        </option>
        {available.map((artifact) => (
          <option key={artifact.id} value={artifact.id}>
            {(artifact.title || "Untitled") + ` (${artifact.type})`}
          </option>
        ))}
      </select>
      <button type="submit" className="btn btn--ghost" disabled={pending}>
        {pending ? "Linking…" : "Link"}
      </button>
      {state.error ? (
        <p className="banner banner--error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
