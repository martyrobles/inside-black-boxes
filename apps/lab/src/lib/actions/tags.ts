"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugifyTag } from "@/lib/types";

export type TagActionState = {
  error?: string;
  success?: string;
};

export async function addTagToArtifact(
  _prev: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const artifactId = String(formData.get("artifact_id") ?? "");
  const rawName = String(formData.get("name") ?? "");
  const name = rawName.trim();
  const slug = slugifyTag(name);

  if (!artifactId) return { error: "Missing Artifact." };
  if (!name || !slug) return { error: "Enter a tag name." };

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

  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  let tagId = existing?.id as string | undefined;

  if (!tagId) {
    const { data: created, error } = await supabase
      .from("tags")
      .insert({ owner_id: user.id, name, slug })
      .select("id")
      .single();
    if (error) return { error: error.message };
    tagId = created.id;
  }

  const { error: linkError } = await supabase.from("artifact_tags").upsert(
    { artifact_id: artifactId, tag_id: tagId },
    { onConflict: "artifact_id,tag_id", ignoreDuplicates: true },
  );

  if (linkError) return { error: linkError.message };

  revalidatePath(`/artifacts/${artifactId}`);
  revalidatePath("/library");
  return { success: "Tag added." };
}

export async function removeTagFromArtifact(
  _prev: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const artifactId = String(formData.get("artifact_id") ?? "");
  const tagId = String(formData.get("tag_id") ?? "");

  if (!artifactId || !tagId) return { error: "Missing tag or Artifact." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("artifact_tags")
    .delete()
    .eq("artifact_id", artifactId)
    .eq("tag_id", tagId);

  if (error) return { error: error.message };

  revalidatePath(`/artifacts/${artifactId}`);
  revalidatePath("/library");
  return { success: "Tag removed." };
}
