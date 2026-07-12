"use client";

import { useActionState } from "react";
import {
  acceptAiSuggestion,
  acceptConceptAsIdea,
  generateArtifactSummary,
  generateWhatCouldBecome,
  rejectAiSuggestion,
  type AiActionState,
} from "@/lib/actions/ai";
import type { AiSuggestion, WhatCouldBecomeConcept } from "@/lib/ai/types";

type ArtifactAiPanelProps = {
  artifactId: string;
  suggestions: AiSuggestion[];
  aiConfigured: boolean;
  blockedByConfidentiality: boolean;
};

const initial: AiActionState = {};

export function ArtifactAiPanel({
  artifactId,
  suggestions,
  aiConfigured,
  blockedByConfidentiality,
}: ArtifactAiPanelProps) {
  const [summaryState, summaryAction, summaryPending] = useActionState(
    generateArtifactSummary,
    initial,
  );
  const [conceptsState, conceptsAction, conceptsPending] = useActionState(
    generateWhatCouldBecome,
    initial,
  );
  const [acceptState, acceptAction, acceptPending] = useActionState(
    acceptAiSuggestion,
    initial,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectAiSuggestion,
    initial,
  );
  const [ideaState, ideaAction, ideaPending] = useActionState(
    acceptConceptAsIdea,
    initial,
  );

  const summaries = suggestions.filter((s) => s.kind === "summary");
  const concepts = suggestions.filter((s) => s.kind === "what_could_become");

  return (
    <section className="panel">
      <p className="label panel__label">AI studio</p>
      <p className="muted small" style={{ marginBottom: "0.85rem" }}>
        On request only. Drafts stay separate until you accept them. Not legal
        advice; not for client-confidential material.
      </p>

      {blockedByConfidentiality ? (
        <p className="banner banner--warn">
          AI is blocked for privileged / do-not-send-to-model Artifacts.
        </p>
      ) : null}

      {!aiConfigured ? (
        <p className="banner banner--warn">
          Add <code>OPENAI_API_KEY</code> to <code>apps/lab/.env.local</code> and
          restart the server to enable AI.
        </p>
      ) : null}

      <div className="form-actions" style={{ marginBottom: "1rem" }}>
        <form action={summaryAction}>
          <input type="hidden" name="artifact_id" value={artifactId} />
          <button
            type="submit"
            className="btn btn--ghost"
            disabled={
              summaryPending || !aiConfigured || blockedByConfidentiality
            }
          >
            {summaryPending ? "Summarizing…" : "Generate summary"}
          </button>
        </form>
        <form action={conceptsAction}>
          <input type="hidden" name="artifact_id" value={artifactId} />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={
              conceptsPending || !aiConfigured || blockedByConfidentiality
            }
          >
            {conceptsPending ? "Thinking…" : "What could this become?"}
          </button>
        </form>
      </div>

      {summaryState.error || conceptsState.error ? (
        <p className="banner banner--error" role="alert">
          {summaryState.error || conceptsState.error}
        </p>
      ) : null}
      {summaryState.success ||
      conceptsState.success ||
      acceptState.success ||
      rejectState.success ||
      ideaState.success ? (
        <p className="muted small">
          {summaryState.success ||
            conceptsState.success ||
            acceptState.success ||
            rejectState.success ||
            ideaState.success}
        </p>
      ) : null}
      {acceptState.error || rejectState.error || ideaState.error ? (
        <p className="banner banner--error" role="alert">
          {acceptState.error || rejectState.error || ideaState.error}
        </p>
      ) : null}

      {summaries.length > 0 ? (
        <div style={{ marginTop: "1rem" }}>
          <p className="label">Summaries</p>
          <ul className="ai-list">
            {summaries.map((suggestion) => (
              <li key={suggestion.id} className="ai-card">
                <p className="pill">{suggestion.status}</p>
                <p className="prose">{suggestion.content}</p>
                {Array.isArray(
                  (suggestion.payload as { themes?: string[] }).themes,
                ) ? (
                  <p className="muted small">
                    Themes:{" "}
                    {(
                      (suggestion.payload as { themes?: string[] }).themes || []
                    ).join(", ")}
                  </p>
                ) : null}
                {suggestion.status === "draft" ? (
                  <div className="form-actions">
                    <form action={acceptAction}>
                      <input
                        type="hidden"
                        name="suggestion_id"
                        value={suggestion.id}
                      />
                      <input
                        type="hidden"
                        name="artifact_id"
                        value={artifactId}
                      />
                      <button
                        type="submit"
                        className="btn btn--ghost btn--small"
                        disabled={acceptPending}
                      >
                        Accept
                      </button>
                    </form>
                    <form action={rejectAction}>
                      <input
                        type="hidden"
                        name="suggestion_id"
                        value={suggestion.id}
                      />
                      <input
                        type="hidden"
                        name="artifact_id"
                        value={artifactId}
                      />
                      <button
                        type="submit"
                        className="btn btn--ghost btn--small"
                        disabled={rejectPending}
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {concepts.length > 0 ? (
        <div style={{ marginTop: "1.25rem" }}>
          <p className="label">What could this become?</p>
          <ul className="ai-list">
            {concepts.map((suggestion) => {
              const concept = suggestion.payload as WhatCouldBecomeConcept;
              return (
                <li key={suggestion.id} className="ai-card">
                  <p className="pill">{suggestion.status}</p>
                  <h3 style={{ margin: "0.35rem 0" }}>
                    {suggestion.title || concept.title}
                  </h3>
                  <p className="muted small" style={{ margin: 0 }}>
                    {concept.format} · {concept.audience}
                  </p>
                  <p className="prose" style={{ marginTop: "0.65rem" }}>
                    {concept.centralIdea || suggestion.content}
                  </p>
                  {concept.whyItFits ? (
                    <p className="muted small">Why: {concept.whyItFits}</p>
                  ) : null}
                  {concept.nextStep ? (
                    <p className="muted small">Next: {concept.nextStep}</p>
                  ) : null}
                  {suggestion.status === "draft" ? (
                    <div className="form-actions">
                      <form action={ideaAction}>
                        <input
                          type="hidden"
                          name="suggestion_id"
                          value={suggestion.id}
                        />
                        <input
                          type="hidden"
                          name="artifact_id"
                          value={artifactId}
                        />
                        <button
                          type="submit"
                          className="btn btn--primary btn--small"
                          disabled={ideaPending}
                        >
                          Accept as Idea
                        </button>
                      </form>
                      <form action={acceptAction}>
                        <input
                          type="hidden"
                          name="suggestion_id"
                          value={suggestion.id}
                        />
                        <input
                          type="hidden"
                          name="artifact_id"
                          value={artifactId}
                        />
                        <button
                          type="submit"
                          className="btn btn--ghost btn--small"
                          disabled={acceptPending}
                        >
                          Keep draft
                        </button>
                      </form>
                      <form action={rejectAction}>
                        <input
                          type="hidden"
                          name="suggestion_id"
                          value={suggestion.id}
                        />
                        <input
                          type="hidden"
                          name="artifact_id"
                          value={artifactId}
                        />
                        <button
                          type="submit"
                          className="btn btn--ghost btn--small"
                          disabled={rejectPending}
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
