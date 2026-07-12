import { createClient } from "@/lib/supabase/server";
import type {
  Artifact,
  Collection,
  Connection,
  Idea,
  LabEntityType,
  Project,
  Tag,
} from "@/lib/types";

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function searchArtifacts(query: string): Promise<{
  artifacts: Artifact[];
  error?: string;
}> {
  const supabase = await createClient();
  const q = query.trim();

  if (!q) {
    const { data, error } = await supabase
      .from("artifacts")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    return { artifacts: (data ?? []) as Artifact[], error: error?.message };
  }

  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .is("deleted_at", null)
    .textSearch("search_vector", q, { type: "websearch", config: "english" })
    .order("created_at", { ascending: false });

  if (!error) {
    return { artifacts: (data ?? []) as Artifact[] };
  }

  const safe = q.replace(/[%_,.()]/g, " ").trim();
  if (!safe) {
    return { artifacts: [], error: error.message };
  }

  const pattern = `%${safe}%`;
  const { data: fallback, error: fallbackError } = await supabase
    .from("artifacts")
    .select("*")
    .is("deleted_at", null)
    .or(
      [
        `title.ilike.${pattern}`,
        `user_description.ilike.${pattern}`,
        `body.ilike.${pattern}`,
        `file_name.ilike.${pattern}`,
        `source_url.ilike.${pattern}`,
      ].join(","),
    )
    .order("created_at", { ascending: false });

  return {
    artifacts: (fallback ?? []) as Artifact[],
    error: fallbackError?.message,
  };
}

export async function getTagsForArtifact(artifactId: string): Promise<Tag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artifact_tags")
    .select("tags ( id, owner_id, name, slug, created_at )")
    .eq("artifact_id", artifactId);

  if (!data) return [];

  return data
    .map((row) => unwrapOne(row.tags as Tag | Tag[] | null))
    .filter((t): t is Tag => Boolean(t));
}

export async function listCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  return (data ?? []) as Collection[];
}

export async function getCollectionsForArtifact(
  artifactId: string,
): Promise<Collection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collection_artifacts")
    .select(
      "collections ( id, owner_id, title, description, created_at, updated_at, deleted_at )",
    )
    .eq("artifact_id", artifactId);

  if (!data) return [];

  return data
    .map((row) =>
      unwrapOne(row.collections as Collection | Collection[] | null),
    )
    .filter((c): c is Collection => Boolean(c && !c.deleted_at));
}

export async function listIdeas(): Promise<Idea[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("listIdeas:", error.message);
    return [];
  }
  return (data ?? []) as Idea[];
}

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("listProjects:", error.message);
    return [];
  }
  return (data ?? []) as Project[];
}

export async function listArtifactsBrief(): Promise<
  Pick<Artifact, "id" | "title" | "type">[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artifacts")
    .select("id, title, type")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as Pick<Artifact, "id" | "title" | "type">[];
}

export async function getArtifactsForIdea(ideaId: string): Promise<Artifact[]> {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("idea_artifacts")
    .select("artifact_id")
    .eq("idea_id", ideaId);
  const ids = (links ?? []).map((row) => row.artifact_id as string);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("artifacts")
    .select("*")
    .in("id", ids)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as Artifact[];
}

export async function getIdeasForProject(projectId: string): Promise<Idea[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_ideas")
    .select(
      "ideas ( id, owner_id, title, premise, status, created_at, updated_at, deleted_at )",
    )
    .eq("project_id", projectId);

  if (!data) return [];
  return data
    .map((row) => unwrapOne(row.ideas as Idea | Idea[] | null))
    .filter((i): i is Idea => Boolean(i && !i.deleted_at));
}

export async function getArtifactsForProject(
  projectId: string,
): Promise<Artifact[]> {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("project_artifacts")
    .select("artifact_id")
    .eq("project_id", projectId);
  const ids = (links ?? []).map((row) => row.artifact_id as string);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("artifacts")
    .select("*")
    .in("id", ids)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as Artifact[];
}

export type ConnectionView = Connection & {
  otherType: LabEntityType;
  otherId: string;
  otherTitle: string;
};

export async function getConnectionsForEntity(
  entityType: LabEntityType,
  entityId: string,
): Promise<ConnectionView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .is("deleted_at", null)
    .or(`from_id.eq.${entityId},to_id.eq.${entityId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getConnectionsForEntity:", error.message);
    return [];
  }

  const rows = ((data ?? []) as Connection[]).filter(
    (row) =>
      (row.from_type === entityType && row.from_id === entityId) ||
      (row.to_type === entityType && row.to_id === entityId),
  );
  if (rows.length === 0) return [];

  const needed = new Map<string, { type: LabEntityType; id: string }>();
  for (const row of rows) {
    const otherType =
      row.from_type === entityType && row.from_id === entityId
        ? row.to_type
        : row.from_type;
    const otherId =
      row.from_type === entityType && row.from_id === entityId
        ? row.to_id
        : row.from_id;
    needed.set(`${otherType}:${otherId}`, { type: otherType, id: otherId });
  }

  const titleMap = new Map<string, string>();
  const byType = {
    artifact: [] as string[],
    idea: [] as string[],
    project: [] as string[],
    collection: [] as string[],
  };
  for (const item of needed.values()) {
    byType[item.type].push(item.id);
  }

  async function loadTitles(
    table: "artifacts" | "ideas" | "projects" | "collections",
    type: LabEntityType,
    ids: string[],
  ) {
    if (ids.length === 0) return;
    const { data: items } = await supabase
      .from(table)
      .select("id, title")
      .in("id", ids);
    for (const item of items ?? []) {
      titleMap.set(
        `${type}:${item.id}`,
        (item.title as string | null) || "Untitled",
      );
    }
  }

  await Promise.all([
    loadTitles("artifacts", "artifact", byType.artifact),
    loadTitles("ideas", "idea", byType.idea),
    loadTitles("projects", "project", byType.project),
    loadTitles("collections", "collection", byType.collection),
  ]);

  return rows.map((row) => {
    const otherType =
      row.from_type === entityType && row.from_id === entityId
        ? row.to_type
        : row.from_type;
    const otherId =
      row.from_type === entityType && row.from_id === entityId
        ? row.to_id
        : row.from_id;
    return {
      ...row,
      otherType,
      otherId,
      otherTitle: titleMap.get(`${otherType}:${otherId}`) || "Untitled",
    };
  });
}

export async function getAiSuggestionsForArtifact(
  artifactId: string,
): Promise<import("@/lib/ai/types").AiSuggestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_suggestions")
    .select("*")
    .eq("artifact_id", artifactId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getAiSuggestionsForArtifact:", error.message);
    return [];
  }
  return (data ?? []) as import("@/lib/ai/types").AiSuggestion[];
}

export async function listConnectionTargets(): Promise<{
  artifacts: Pick<Artifact, "id" | "title">[];
  ideas: Pick<Idea, "id" | "title">[];
  projects: Pick<Project, "id" | "title">[];
  collections: Pick<Collection, "id" | "title">[];
}> {
  const empty = {
    artifacts: [] as Pick<Artifact, "id" | "title">[],
    ideas: [] as Pick<Idea, "id" | "title">[],
    projects: [] as Pick<Project, "id" | "title">[],
    collections: [] as Pick<Collection, "id" | "title">[],
  };

  try {
    const supabase = await createClient();
    const [artifacts, ideas, projects, collections] = await Promise.all([
      supabase
        .from("artifacts")
        .select("id, title")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("ideas")
        .select("id, title")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(100),
      supabase
        .from("projects")
        .select("id, title")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(100),
      supabase
        .from("collections")
        .select("id, title")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(100),
    ]);

    return {
      artifacts: (artifacts.data ?? []) as Pick<Artifact, "id" | "title">[],
      ideas: (ideas.data ?? []) as Pick<Idea, "id" | "title">[],
      projects: (projects.data ?? []) as Pick<Project, "id" | "title">[],
      collections: (collections.data ?? []) as Pick<
        Collection,
        "id" | "title"
      >[],
    };
  } catch (err) {
    console.error("listConnectionTargets:", err);
    return empty;
  }
}
