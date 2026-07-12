export type ArtifactType = "note" | "image" | "document" | "url";

export type ArtifactIntent = "unknown" | "developing" | "project_bound";

export type ConfidentialityLevel =
  | "personal"
  | "work"
  | "privileged"
  | "do_not_send_to_model";

export type Artifact = {
  id: string;
  owner_id: string;
  type: ArtifactType;
  title: string | null;
  body: string | null;
  source_url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  file_name: string | null;
  file_size: number | null;
  user_description: string;
  intent: ArtifactIntent;
  confidentiality: ConfidentialityLevel;
  processing_status: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  deleted_at: string | null;
};

export type Tag = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Collection = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type IdeaStatus = "incubating" | "active" | "archived";

export type Idea = {
  id: string;
  owner_id: string;
  title: string;
  premise: string;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ProjectStatus = "active" | "paused" | "archived";

export type Project = {
  id: string;
  owner_id: string;
  title: string;
  goal: string;
  thesis: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LabEntityType = "artifact" | "idea" | "project" | "collection";

export type ConnectionType =
  | "thematic"
  | "causal"
  | "contrast"
  | "visual"
  | "evidentiary"
  | "serendipitous";

export type Connection = {
  id: string;
  owner_id: string;
  from_type: LabEntityType;
  from_id: string;
  to_type: LabEntityType;
  to_id: string;
  connection_type: ConnectionType;
  rationale: string;
  status: string;
  created_at: string;
  deleted_at: string | null;
};

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

export const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
  note: "Note",
  image: "Image",
  document: "Document",
  url: "URL",
};

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
  thematic: "Thematic",
  causal: "Causal",
  contrast: "Contrast",
  visual: "Visual",
  evidentiary: "Evidentiary",
  serendipitous: "Serendipitous",
};

export function slugifyTag(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
