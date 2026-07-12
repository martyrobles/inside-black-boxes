export type AiSuggestionKind = "summary" | "what_could_become";

export type AiSuggestionStatus = "draft" | "accepted" | "rejected";

export type WhatCouldBecomeConcept = {
  title: string;
  format: string;
  audience: string;
  centralIdea: string;
  whyItFits: string;
  nextStep: string;
};

export type AiSuggestion = {
  id: string;
  owner_id: string;
  artifact_id: string;
  kind: AiSuggestionKind;
  title: string | null;
  content: string;
  payload: Record<string, unknown>;
  model: string | null;
  status: AiSuggestionStatus;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
};
