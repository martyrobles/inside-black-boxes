"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MAX_UPLOAD_BYTES, type ArtifactType } from "@/lib/types";
import { fetchUrlMetadata } from "@/lib/url-metadata";

export type CaptureState = {
  error?: string;
  success?: string;
};

function requireDescription(
  description: string,
  unsure: boolean,
): { userDescription: string; intent: "unknown" | "developing" } | { error: string } {
  const trimmed = description.trim();
  if (unsure) {
    return {
      userDescription: trimmed || "I'm not sure yet",
      intent: "unknown",
    };
  }
  if (!trimmed) {
    return {
      error: "Add a brief description, or choose “I’m not sure yet.”",
    };
  }
  return { userDescription: trimmed, intent: "developing" };
}

function extensionFor(file: File, fallback: string): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  return fallback;
}

export async function createArtifact(
  _prev: CaptureState,
  formData: FormData,
): Promise<CaptureState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to capture material." };
  }

  const type = String(formData.get("type") ?? "") as ArtifactType;
  const titleRaw = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const unsure = formData.get("unsure") === "on";
  const noteBody = String(formData.get("body") ?? "").trim();
  const sourceUrl = String(formData.get("source_url") ?? "").trim();
  const file = formData.get("file");

  if (!["note", "image", "document", "url"].includes(type)) {
    return { error: "Choose a capture type." };
  }

  const described = requireDescription(description, unsure);
  if ("error" in described) return described;

  let title = titleRaw || null;
  let body: string | null = null;
  let resolvedUrl: string | null = null;
  let storagePath: string | null = null;
  let mimeType: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;

  if (type === "note") {
    if (!noteBody) {
      return { error: "Write a quick note before saving." };
    }
    body = noteBody;
    if (!title) {
      title = noteBody.slice(0, 80) + (noteBody.length > 80 ? "…" : "");
    }
  }

  if (type === "url") {
    if (!sourceUrl) {
      return { error: "Enter a URL." };
    }
    let parsed: URL;
    try {
      parsed = new URL(sourceUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { error: "URL must start with http:// or https://." };
      }
    } catch {
      return { error: "That does not look like a valid URL." };
    }
    const meta = await fetchUrlMetadata(parsed.toString());
    resolvedUrl = meta.finalUrl;
    title = title || meta.title || parsed.hostname;
  }

  if (type === "image" || type === "document") {
    if (!(file instanceof File) || file.size === 0) {
      return {
        error:
          type === "image"
            ? "Choose an image to upload."
            : "Choose a PDF or document to upload.",
      };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: "File must be 3 MB or smaller." };
    }

    if (type === "image" && !file.type.startsWith("image/")) {
      return { error: "Upload an image file (JPEG, PNG, WebP, etc.)." };
    }
    if (
      type === "document" &&
      !(
        file.type === "application/pdf" ||
        file.type.startsWith("text/") ||
        file.type.includes("document") ||
        file.type.includes("msword") ||
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".doc") ||
        file.name.toLowerCase().endsWith(".docx") ||
        file.name.toLowerCase().endsWith(".txt") ||
        file.name.toLowerCase().endsWith(".md")
      )
    ) {
      return { error: "Upload a PDF or document file." };
    }

    const ext = extensionFor(
      file,
      type === "image" ? "jpg" : "pdf",
    );
    const objectId = crypto.randomUUID();
    storagePath = `${user.id}/${objectId}.${ext}`;
    mimeType = file.type || null;
    fileName = file.name;
    fileSize = file.size;
    title = title || file.name;

    const { error: uploadError } = await supabase.storage
      .from("artifacts")
      .upload(storagePath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }
  }

  const { data, error } = await supabase
    .from("artifacts")
    .insert({
      owner_id: user.id,
      type,
      title,
      body,
      source_url: resolvedUrl,
      storage_path: storagePath,
      mime_type: mimeType,
      file_name: fileName,
      file_size: fileSize,
      user_description: described.userDescription,
      intent: described.intent,
      confidentiality: "personal",
      processing_status: "ready",
    })
    .select("id")
    .single();

  if (error) {
    if (storagePath) {
      await supabase.storage.from("artifacts").remove([storagePath]);
    }
    return { error: `Could not save Artifact: ${error.message}` };
  }

  revalidatePath("/library");
  redirect(`/artifacts/${data.id}`);
}
