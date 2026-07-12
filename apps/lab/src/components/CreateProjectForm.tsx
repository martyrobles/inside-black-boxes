"use client";

import { useActionState } from "react";
import {
  createProject,
  type ProjectActionState,
} from "@/lib/actions/projects";

const initial: ProjectActionState = {};

export function CreateProjectForm() {
  const [state, action, pending] = useActionState(createProject, initial);

  return (
    <form action={action} className="capture-form">
      <label className="field">
        <span className="label">Title</span>
        <input type="text" name="title" className="input" required />
      </label>
      <label className="field">
        <span className="label">Goal</span>
        <textarea name="goal" className="input input--area" rows={2} />
      </label>
      <label className="field">
        <span className="label">Thesis / premise</span>
        <textarea name="thesis" className="input input--area" rows={3} />
      </label>
      {state.error ? (
        <p className="banner banner--error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? "Creating…" : "Create Project"}
      </button>
    </form>
  );
}
