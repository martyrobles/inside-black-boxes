"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProjectActionState = {
  error?: string;
  success?: string;
};

export async function createProjectFromIdea(
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const ideaId = String(formData.get("idea_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const thesis = String(formData.get("thesis") ?? "").trim();

  if (!ideaId) return { error: "Missing Idea." };
  if (!title) return { error: "Give the Project a title." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: idea } = await supabase
    .from("ideas")
    .select("id, premise")
    .eq("id", ideaId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!idea) return { error: "Idea not found." };

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      title,
      goal,
      thesis: thesis || idea.premise || "",
      status: "active",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("project_ideas").insert({
    project_id: project.id,
    idea_id: ideaId,
  });

  const { data: links } = await supabase
    .from("idea_artifacts")
    .select("artifact_id")
    .eq("idea_id", ideaId);

  const artifactIds = (links ?? []).map((row) => row.artifact_id as string);
  if (artifactIds.length > 0) {
    await supabase.from("project_artifacts").upsert(
      artifactIds.map((artifact_id) => ({
        project_id: project.id,
        artifact_id,
      })),
      { onConflict: "project_id,artifact_id", ignoreDuplicates: true },
    );
    await supabase
      .from("artifacts")
      .update({ intent: "project_bound" })
      .in("id", artifactIds);
  }

  await supabase.from("ideas").update({ status: "active" }).eq("id", ideaId);

  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function createProject(
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const thesis = String(formData.get("thesis") ?? "").trim();

  if (!title) return { error: "Give the Project a title." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      title,
      goal,
      thesis,
      status: "active",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function softDeleteProject(formData: FormData) {
  const projectId = String(formData.get("project_id") ?? "");
  if (!projectId) return;

  const supabase = await createClient();
  await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", projectId);

  revalidatePath("/projects");
  redirect("/projects");
}
