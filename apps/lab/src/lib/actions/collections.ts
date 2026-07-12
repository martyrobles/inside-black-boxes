"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CollectionActionState = {
  error?: string;
  success?: string;
};

export async function createCollection(
  _prev: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) return { error: "Give the Collection a title." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data, error } = await supabase
    .from("collections")
    .insert({
      owner_id: user.id,
      title,
      description,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/collections");
  redirect(`/collections/${data.id}`);
}

export async function addArtifactToCollection(
  _prev: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const artifactId = String(formData.get("artifact_id") ?? "");
  const collectionId = String(formData.get("collection_id") ?? "");

  if (!artifactId || !collectionId) {
    return { error: "Choose a Collection." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("collection_artifacts").upsert(
    { collection_id: collectionId, artifact_id: artifactId },
    { onConflict: "collection_id,artifact_id", ignoreDuplicates: true },
  );

  if (error) return { error: error.message };

  revalidatePath(`/artifacts/${artifactId}`);
  revalidatePath(`/collections/${collectionId}`);
  revalidatePath("/collections");
  return { success: "Added to Collection." };
}

export async function removeArtifactFromCollection(
  _prev: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const artifactId = String(formData.get("artifact_id") ?? "");
  const collectionId = String(formData.get("collection_id") ?? "");

  if (!artifactId || !collectionId) {
    return { error: "Missing Collection or Artifact." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("collection_artifacts")
    .delete()
    .eq("collection_id", collectionId)
    .eq("artifact_id", artifactId);

  if (error) return { error: error.message };

  revalidatePath(`/artifacts/${artifactId}`);
  revalidatePath(`/collections/${collectionId}`);
  revalidatePath("/collections");
  return { success: "Removed from Collection." };
}

export async function softDeleteCollection(formData: FormData) {
  const collectionId = String(formData.get("collection_id") ?? "");
  if (!collectionId) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("collections")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", collectionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/collections");
  redirect("/collections");
}
