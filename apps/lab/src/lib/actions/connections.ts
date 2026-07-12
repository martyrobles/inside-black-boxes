"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ConnectionType, LabEntityType } from "@/lib/types";

export type ConnectionActionState = {
  error?: string;
  success?: string;
};

const ENTITY_TYPES: LabEntityType[] = [
  "artifact",
  "idea",
  "project",
  "collection",
];

const CONNECTION_TYPES: ConnectionType[] = [
  "thematic",
  "causal",
  "contrast",
  "visual",
  "evidentiary",
  "serendipitous",
];

export async function createConnection(
  _prev: ConnectionActionState,
  formData: FormData,
): Promise<ConnectionActionState> {
  const fromType = String(formData.get("from_type") ?? "") as LabEntityType;
  const fromId = String(formData.get("from_id") ?? "");
  const toType = String(formData.get("to_type") ?? "") as LabEntityType;
  const toId = String(formData.get("to_id") ?? "");
  const connectionType = String(
    formData.get("connection_type") ?? "thematic",
  ) as ConnectionType;
  const rationale = String(formData.get("rationale") ?? "").trim();

  if (!ENTITY_TYPES.includes(fromType) || !ENTITY_TYPES.includes(toType)) {
    return { error: "Invalid connection endpoints." };
  }
  if (!fromId || !toId) return { error: "Choose both items to connect." };
  if (fromType === toType && fromId === toId) {
    return { error: "Cannot connect an item to itself." };
  }
  if (!CONNECTION_TYPES.includes(connectionType)) {
    return { error: "Choose a connection type." };
  }
  if (!rationale) {
    return { error: "Add a one-sentence rationale." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase.from("connections").insert({
    owner_id: user.id,
    from_type: fromType,
    from_id: fromId,
    to_type: toType,
    to_id: toId,
    connection_type: connectionType,
    rationale,
    status: "confirmed",
  });

  if (error) return { error: error.message };

  if (fromType === "artifact") revalidatePath(`/artifacts/${fromId}`);
  if (fromType === "idea") revalidatePath(`/ideas/${fromId}`);
  if (fromType === "project") revalidatePath(`/projects/${fromId}`);
  if (toType === "artifact") revalidatePath(`/artifacts/${toId}`);
  if (toType === "idea") revalidatePath(`/ideas/${toId}`);
  if (toType === "project") revalidatePath(`/projects/${toId}`);

  return { success: "Connection saved." };
}

export async function deleteConnection(formData: FormData) {
  const connectionId = String(formData.get("connection_id") ?? "");
  const returnPath = String(formData.get("return_path") ?? "/library");
  if (!connectionId) return;

  const supabase = await createClient();
  await supabase
    .from("connections")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", connectionId);

  revalidatePath(returnPath);
  revalidatePath("/library");
  revalidatePath("/ideas");
  revalidatePath("/projects");
}
