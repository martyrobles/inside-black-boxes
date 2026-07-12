"use client";

import { useActionState } from "react";
import { createIdea, type IdeaActionState } from "@/lib/actions/ideas";

const initial: IdeaActionState = {};

export function CreateIdeaForm() {
  const [state, action, pending] = useActionState(createIdea, initial);

  return (
    <form action={action} className="capture-form">
      <label className="field">
        <span className="label">Title</span>
        <input type="text" name="title" className="input" required />
      </label>
      <label className="field">
        <span className="label">Premise</span>
        <textarea name="premise" className="input input--area" rows={3} />
      </label>
      {state.error ? (
        <p className="banner banner--error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? "Creating…" : "Create Idea"}
      </button>
    </form>
  );
}
