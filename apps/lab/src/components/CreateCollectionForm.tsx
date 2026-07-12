"use client";

import { useActionState } from "react";
import {
  createCollection,
  type CollectionActionState,
} from "@/lib/actions/collections";

const initial: CollectionActionState = {};

export function CreateCollectionForm() {
  const [state, action, pending] = useActionState(createCollection, initial);

  return (
    <form action={action} className="capture-form">
      <label className="field">
        <span className="label">Title</span>
        <input
          type="text"
          name="title"
          className="input"
          required
          placeholder="e.g. Possible Law360 articles"
        />
      </label>
      <label className="field">
        <span className="label">Description (optional)</span>
        <textarea
          name="description"
          className="input input--area"
          rows={3}
          placeholder="What belongs here?"
        />
      </label>
      {state.error ? (
        <p className="banner banner--error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? "Creating…" : "Create Collection"}
      </button>
    </form>
  );
}
