"use client";

import { useActionState } from "react";
import {
  createProjectFromIdea,
  type ProjectActionState,
} from "@/lib/actions/projects";

type ConvertToProjectFormProps = {
  ideaId: string;
  defaultTitle: string;
  defaultThesis: string;
};

const initial: ProjectActionState = {};

export function ConvertToProjectForm({
  ideaId,
  defaultTitle,
  defaultThesis,
}: ConvertToProjectFormProps) {
  const [state, action, pending] = useActionState(
    createProjectFromIdea,
    initial,
  );

  return (
    <section className="panel">
      <p className="label panel__label">Projects Underway</p>
      <p className="muted small" style={{ marginBottom: "0.75rem" }}>
        Promote this Idea into sustained work.
      </p>
      <form action={action}>
        <input type="hidden" name="idea_id" value={ideaId} />
        <label className="field">
          <span className="label">Project title</span>
          <input
            type="text"
            name="title"
            className="input"
            required
            defaultValue={defaultTitle}
          />
        </label>
        <label className="field">
          <span className="label">Goal</span>
          <textarea
            name="goal"
            className="input input--area"
            rows={2}
            placeholder="What does finished look like?"
          />
        </label>
        <label className="field">
          <span className="label">Thesis / premise</span>
          <textarea
            name="thesis"
            className="input input--area"
            rows={3}
            defaultValue={defaultThesis}
          />
        </label>
        {state.error ? (
          <p className="banner banner--error" role="alert">
            {state.error}
          </p>
        ) : null}
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "Creating…" : "Convert to Project"}
        </button>
      </form>
    </section>
  );
}
