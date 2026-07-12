"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type IdeaActionState = {
  error?: string;
  success?: string;
};

export async function createIdeaFromArtifact(
  _prev: IdeaActionState,
  formData: FormData,
): Promise<IdeaActionState> {
  const artifactId = String(formData.get("artifact_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const premise = String(formData.get("premise") ?? "").trim();

  if (!artifactId) return { error: "Missing Artifact." };
  if (!title) return { error: "Give the Idea a title." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: artifact } = await supabase
    .from("artifacts")
    .select("id")
    .eq("id", artifactId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!artifact) return { error: "Artifact not found." };

  const { data: idea, error } = await supabase
    .from("ideas")
    .insert({
      owner_id: user.id,
      title,
      premise,
      status: "incubating",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const { error: linkError } = await supabase.from("idea_artifacts").insert({
    idea_id: idea.id,
    artifact_id: artifactId,
  });
  if (linkError) return { error: linkError.message };

  await supabase
    .from("artifacts")
    .update({ intent: "developing" })
    .eq("id", artifactId);

  revalidatePath(`/artifacts/${artifactId}`);
  revalidatePath("/ideas");
  redirect(`/ideas/${idea.id}`);
}

export async function createIdea(
  _prev: IdeaActionState,
  formData: FormData,
): Promise<IdeaActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const premise = String(formData.get("premise") ?? "").trim();

  if (!title) return { error: "Give the Idea a title." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: idea, error } = await supabase
    .from("ideas")
    .insert({
      owner_id: user.id,
      title,
      premise,
      status: "incubating",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/ideas");
  redirect(`/ideas/${idea.id}`);
}

export async function addArtifactToIdea(
  _prev: IdeaActionState,
  formData: FormData,
): Promise<IdeaActionState> {
  const ideaId = String(formData.get("idea_id") ?? "");
  const artifactId = String(formData.get("artifact_id") ?? "");
  if (!ideaId || !artifactId) return { error: "Choose an Artifact." };

  const supabase = await createClient();
  const { error } = await supabase.from("idea_artifacts").upsert(
    { idea_id: ideaId, artifact_id: artifactId },
    { onConflict: "idea_id,artifact_id", ignoreDuplicates: true },
  );
  if (error) return { error: error.message };

  await supabase
    .from("artifacts")
    .update({ intent: "developing" })
    .eq("id", artifactId);

  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath(`/artifacts/${artifactId}`);
  return { success: "Artifact linked." };
}

export async function softDeleteIdea(formData: FormData) {
  const ideaId = String(formData.get("idea_id") ?? "");
  if (!ideaId) return;

  const supabase = await createClient();
  await supabase
    .from("ideas")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", ideaId);

  revalidatePath("/ideas");
  redirect("/ideas");
}
