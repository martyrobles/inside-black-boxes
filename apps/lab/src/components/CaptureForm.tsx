"use client";

import { useActionState, useState } from "react";
import {
  createArtifact,
  type CaptureState,
} from "@/lib/actions/artifacts";
import type { ArtifactType } from "@/lib/types";

const initialState: CaptureState = {};

const TYPES: { id: ArtifactType; label: string; hint: string }[] = [
  { id: "note", label: "Quick note", hint: "Typed observation or fragment" },
  { id: "image", label: "Image", hint: "Photo, screenshot, graffiti, sign" },
  { id: "document", label: "Document", hint: "PDF or document file" },
  { id: "url", label: "URL", hint: "Article or web page link" },
];

export function CaptureForm() {
  const [type, setType] = useState<ArtifactType>("note");
  const [unsure, setUnsure] = useState(false);
  const [state, formAction, pending] = useActionState(
    createArtifact,
    initialState,
  );

  return (
    <form action={formAction} className="capture-form">
      <input type="hidden" name="type" value={type} />

      <fieldset className="type-picker">
        <legend className="label">What are you capturing?</legend>
        <div className="type-picker__grid">
          {TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`type-card ${type === item.id ? "is-active" : ""}`}
              onClick={() => setType(item.id)}
              aria-pressed={type === item.id}
            >
              <span className="type-card__label">{item.label}</span>
              <span className="type-card__hint">{item.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {type === "note" ? (
        <label className="field">
          <span className="label">Note</span>
          <textarea
            name="body"
            rows={6}
            required
            placeholder="Write the fragment while it is still sharp…"
            className="input input--area"
          />
        </label>
      ) : null}

      {type === "url" ? (
        <label className="field">
          <span className="label">URL</span>
          <input
            type="url"
            name="source_url"
            required
            placeholder="https://"
            className="input"
          />
        </label>
      ) : null}

      {type === "image" ? (
        <label className="field">
          <span className="label">Image file</span>
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="input input--file"
          />
        </label>
      ) : null}

      {type === "document" ? (
        <label className="field">
          <span className="label">Document or PDF</span>
          <input
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,.txt,.md,application/pdf,text/*"
            required
            className="input input--file"
          />
        </label>
      ) : null}

      <label className="field">
        <span className="label">Title (optional)</span>
        <input
          type="text"
          name="title"
          placeholder="Leave blank to derive from the material"
          className="input"
        />
      </label>

      <label className="field">
        <span className="label">Why are you saving this?</span>
        <textarea
          name="description"
          rows={3}
          required={!unsure}
          disabled={unsure}
          placeholder="One sentence is enough."
          className="input input--area"
        />
      </label>

      <label className="check">
        <input
          type="checkbox"
          name="unsure"
          checked={unsure}
          onChange={(event) => setUnsure(event.target.checked)}
        />
        <span>I’m not sure yet</span>
      </label>

      {state.error ? (
        <p className="banner banner--error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "Saving…" : "Save Artifact"}
        </button>
      </div>
    </form>
  );
}
