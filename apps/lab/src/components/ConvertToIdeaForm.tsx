"use client";

import { useActionState } from "react";
import {
  createIdeaFromArtifact,
  type IdeaActionState,
} from "@/lib/actions/ideas";

type ConvertToIdeaFormProps = {
  artifactId: string;
  defaultTitle: string;
  defaultPremise: string;
};

const initial: IdeaActionState = {};

export function ConvertToIdeaForm({
  artifactId,
  defaultTitle,
  defaultPremise,
}: ConvertToIdeaFormProps) {
  const [state, action, pending] = useActionState(
    createIdeaFromArtifact,
    initial,
  );

  return (
    <section className="panel">
      <p className="label panel__label">Develop</p>
      <p className="muted small" style={{ marginBottom: "0.75rem" }}>
        Turn this Artifact into an Idea — a proposition you may develop later.
      </p>
      <form action={action}>
        <input type="hidden" name="artifact_id" value={artifactId} />
        <label className="field">
          <span className="label">Idea title</span>
          <input
            type="text"
            name="title"
            className="input"
            required
            defaultValue={defaultTitle}
          />
        </label>
        <label className="field">
          <span className="label">Premise</span>
          <textarea
            name="premise"
            className="input input--area"
            rows={3}
            defaultValue={defaultPremise}
            placeholder="What is the idea, in one or two sentences?"
          />
        </label>
        {state.error ? (
          <p className="banner banner--error" role="alert">
            {state.error}
          </p>
        ) : null}
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "Creating…" : "Convert to Idea"}
        </button>
      </form>
    </section>
  );
}
