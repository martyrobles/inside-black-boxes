"use server";

import { revalidatePath } from "next/cache";
import {
  createAiProvider,
  parseSummaryResponse,
  parseWhatCouldBecomeResponse,
} from "@/lib/ai/provider";
import type { WhatCouldBecomeConcept } from "@/lib/ai/types";
import { createClient } from "@/lib/supabase/server";
import type { Artifact } from "@/lib/types";

export type AiActionState = {
  error?: string;
  success?: string;
};

function canSendToModel(artifact: Artifact): boolean {
  return (
    artifact.confidentiality !== "privileged" &&
    artifact.confidentiality !== "do_not_send_to_model"
  );
}

function artifactContext(artifact: Artifact): string {
  return [
    `Type: ${artifact.type}`,
    `Title: ${artifact.title || "Untitled"}`,
    `User description: ${artifact.user_description}`,
    artifact.body ? `Note body: ${artifact.body}` : null,
    artifact.source_url ? `URL: ${artifact.source_url}` : null,
    artifact.file_name ? `File: ${artifact.file_name}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

async function loadOwnedArtifact(artifactId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." as const };

  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("id", artifactId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return { error: "Artifact not found." as const };
  const artifact = data as Artifact;
  if (!canSendToModel(artifact)) {
    return {
      error:
        "This Artifact is marked privileged or do-not-send-to-model. AI is blocked." as const,
    };
  }

  return { supabase, user, artifact };
}

export async function generateArtifactSummary(
  _prev: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const artifactId = String(formData.get("artifact_id") ?? "");
  if (!artifactId) return { error: "Missing Artifact." };

  const loaded = await loadOwnedArtifact(artifactId);
  if ("error" in loaded) return { error: loaded.error };

  try {
    const ai = createAiProvider();
    const result = await ai.completeJson({
      messages: [
        {
          role: "system",
          content:
            "You help a private legaltech idea lab summarize captured material. Return JSON only with keys summary (string) and themes (string array). Distinguish observation from inference. Do not invent legal authorities. Keep summary under 120 words. Educational use only; not legal advice.",
        },
        {
          role: "user",
          content: `Summarize this Artifact for later creative and professional development:\n\n${artifactContext(loaded.artifact)}`,
        },
      ],
    });

    const parsed = parseSummaryResponse(result.text);
    if (!parsed.summary) return { error: "AI returned an empty summary." };

    const { error } = await loaded.supabase.from("ai_suggestions").insert({
      owner_id: loaded.user.id,
      artifact_id: artifactId,
      kind: "summary",
      title: "AI summary",
      content: parsed.summary,
      payload: { themes: parsed.themes },
      model: result.model,
      status: "draft",
    });
    if (error) return { error: error.message };

    revalidatePath(`/artifacts/${artifactId}`);
    return { success: "Summary drafted. Accept it to keep it permanently." };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "AI summary failed.",
    };
  }
}

export async function generateWhatCouldBecome(
  _prev: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const artifactId = String(formData.get("artifact_id") ?? "");
  if (!artifactId) return { error: "Missing Artifact." };

  const loaded = await loadOwnedArtifact(artifactId);
  if ("error" in loaded) return { error: loaded.error };

  try {
    const ai = createAiProvider();
    const result = await ai.completeJson({
      messages: [
        {
          role: "system",
          content:
            'You help a private legaltech creative lab invent serious concept options. Return JSON: {"concepts":[{"title","format","audience","centralIdea","whyItFits","nextStep"}]}. Offer 3-5 concepts spanning legal writing (e.g. Law360, LinkedIn), essays, and creative formats (short film, screenplay concept). Do not invent case citations. Mark uncertainty in plain language when needed. Not legal advice.',
        },
        {
          role: "user",
          content: `What could this Artifact become?\n\n${artifactContext(loaded.artifact)}`,
        },
      ],
    });

    const parsed = parseWhatCouldBecomeResponse(result.text);
    if (parsed.concepts.length === 0) {
      return { error: "AI returned no concepts." };
    }

    const rows = parsed.concepts.map((concept: WhatCouldBecomeConcept) => ({
      owner_id: loaded.user.id,
      artifact_id: artifactId,
      kind: "what_could_become" as const,
      title: concept.title,
      content: [
        concept.centralIdea,
        `Format: ${concept.format}`,
        `Audience: ${concept.audience}`,
        `Why it fits: ${concept.whyItFits}`,
        `Next step: ${concept.nextStep}`,
      ].join("\n"),
      payload: concept,
      model: result.model,
      status: "draft" as const,
    }));

    const { error } = await loaded.supabase.from("ai_suggestions").insert(rows);
    if (error) return { error: error.message };

    revalidatePath(`/artifacts/${artifactId}`);
    return {
      success: "Concepts drafted. Accept any you want to keep or turn into Ideas.",
    };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "What could this become failed.",
    };
  }
}

export async function acceptAiSuggestion(
  _prev: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const suggestionId = String(formData.get("suggestion_id") ?? "");
  const artifactId = String(formData.get("artifact_id") ?? "");
  if (!suggestionId || !artifactId) return { error: "Missing suggestion." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_suggestions")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", suggestionId);

  if (error) return { error: error.message };
  revalidatePath(`/artifacts/${artifactId}`);
  return { success: "Suggestion accepted." };
}

export async function rejectAiSuggestion(
  _prev: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const suggestionId = String(formData.get("suggestion_id") ?? "");
  const artifactId = String(formData.get("artifact_id") ?? "");
  if (!suggestionId || !artifactId) return { error: "Missing suggestion." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_suggestions")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
    })
    .eq("id", suggestionId);

  if (error) return { error: error.message };
  revalidatePath(`/artifacts/${artifactId}`);
  return { success: "Suggestion rejected." };
}

export async function acceptConceptAsIdea(
  _prev: AiActionState,
  formData: FormData,
): Promise<AiActionState> {
  const suggestionId = String(formData.get("suggestion_id") ?? "");
  const artifactId = String(formData.get("artifact_id") ?? "");
  if (!suggestionId || !artifactId) return { error: "Missing suggestion." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: suggestion, error } = await supabase
    .from("ai_suggestions")
    .select("*")
    .eq("id", suggestionId)
    .maybeSingle();

  if (error || !suggestion) return { error: "Suggestion not found." };
  if (suggestion.kind !== "what_could_become") {
    return { error: "Only concept suggestions can become Ideas." };
  }

  const payload = suggestion.payload as WhatCouldBecomeConcept;
  const title = suggestion.title || payload.title || "Untitled idea";
  const premise = [
    payload.centralIdea || suggestion.content,
    payload.format ? `Suggested format: ${payload.format}` : null,
    payload.audience ? `Audience: ${payload.audience}` : null,
    "Source: AI concept draft (user-accepted).",
  ]
    .filter(Boolean)
    .join("\n");

  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .insert({
      owner_id: user.id,
      title,
      premise,
      status: "incubating",
    })
    .select("id")
    .single();

  if (ideaError) return { error: ideaError.message };

  await supabase.from("idea_artifacts").upsert(
    { idea_id: idea.id, artifact_id: artifactId },
    { onConflict: "idea_id,artifact_id", ignoreDuplicates: true },
  );

  await supabase
    .from("ai_suggestions")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", suggestionId);

  await supabase
    .from("artifacts")
    .update({ intent: "developing" })
    .eq("id", artifactId);

  revalidatePath(`/artifacts/${artifactId}`);
  revalidatePath("/ideas");
  revalidatePath(`/ideas/${idea.id}`);
  return { success: `Saved as Idea: ${title}` };
}
