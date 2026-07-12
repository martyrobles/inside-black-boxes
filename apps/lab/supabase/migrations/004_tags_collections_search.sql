-- Slice 2: Tags, Collections, full-text search
-- Safe to run even if partially applied. Do NOT re-run 001_initial.sql.

-- Tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index if not exists tags_owner_name_idx on public.tags (owner_id, name);

alter table public.tags enable row level security;

drop policy if exists "tags_select_own" on public.tags;
drop policy if exists "tags_insert_own" on public.tags;
drop policy if exists "tags_update_own" on public.tags;
drop policy if exists "tags_delete_own" on public.tags;

create policy "tags_select_own" on public.tags for select using (auth.uid() = owner_id);
create policy "tags_insert_own" on public.tags for insert with check (auth.uid() = owner_id);
create policy "tags_update_own" on public.tags for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "tags_delete_own" on public.tags for delete using (auth.uid() = owner_id);

-- Artifact ↔ Tag
create table if not exists public.artifact_tags (
  artifact_id uuid not null references public.artifacts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (artifact_id, tag_id)
);

create index if not exists artifact_tags_tag_idx on public.artifact_tags (tag_id);

alter table public.artifact_tags enable row level security;

drop policy if exists "artifact_tags_select_own" on public.artifact_tags;
drop policy if exists "artifact_tags_insert_own" on public.artifact_tags;
drop policy if exists "artifact_tags_delete_own" on public.artifact_tags;

create policy "artifact_tags_select_own"
  on public.artifact_tags for select
  using (
    exists (
      select 1 from public.artifacts a
      where a.id = artifact_id and a.owner_id = auth.uid()
    )
  );

create policy "artifact_tags_insert_own"
  on public.artifact_tags for insert
  with check (
    exists (
      select 1 from public.artifacts a
      where a.id = artifact_id and a.owner_id = auth.uid()
    )
    and exists (
      select 1 from public.tags t
      where t.id = tag_id and t.owner_id = auth.uid()
    )
  );

create policy "artifact_tags_delete_own"
  on public.artifact_tags for delete
  using (
    exists (
      select 1 from public.artifacts a
      where a.id = artifact_id and a.owner_id = auth.uid()
    )
  );

-- Collections
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists collections_owner_created_idx
  on public.collections (owner_id, created_at desc)
  where deleted_at is null;

alter table public.collections enable row level security;

drop policy if exists "collections_select_own" on public.collections;
drop policy if exists "collections_insert_own" on public.collections;
drop policy if exists "collections_update_own" on public.collections;
drop policy if exists "collections_delete_own" on public.collections;

create policy "collections_select_own" on public.collections for select using (auth.uid() = owner_id);
create policy "collections_insert_own" on public.collections for insert with check (auth.uid() = owner_id);
create policy "collections_update_own" on public.collections for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "collections_delete_own" on public.collections for delete using (auth.uid() = owner_id);

drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at
  before update on public.collections
  for each row
  execute function public.set_updated_at();

-- Collection ↔ Artifact
create table if not exists public.collection_artifacts (
  collection_id uuid not null references public.collections (id) on delete cascade,
  artifact_id uuid not null references public.artifacts (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, artifact_id)
);

create index if not exists collection_artifacts_artifact_idx
  on public.collection_artifacts (artifact_id);

alter table public.collection_artifacts enable row level security;

drop policy if exists "collection_artifacts_select_own" on public.collection_artifacts;
drop policy if exists "collection_artifacts_insert_own" on public.collection_artifacts;
drop policy if exists "collection_artifacts_delete_own" on public.collection_artifacts;

create policy "collection_artifacts_select_own"
  on public.collection_artifacts for select
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.owner_id = auth.uid()
    )
  );

create policy "collection_artifacts_insert_own"
  on public.collection_artifacts for insert
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.owner_id = auth.uid() and c.deleted_at is null
    )
    and exists (
      select 1 from public.artifacts a
      where a.id = artifact_id and a.owner_id = auth.uid() and a.deleted_at is null
    )
  );

create policy "collection_artifacts_delete_own"
  on public.collection_artifacts for delete
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.owner_id = auth.uid()
    )
  );

-- Full-text search on Artifacts
alter table public.artifacts
  add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(user_description, '')), 'B')
    || setweight(to_tsvector('english', coalesce(body, '')), 'C')
    || setweight(to_tsvector('english', coalesce(file_name, '')), 'C')
    || setweight(to_tsvector('english', coalesce(source_url, '')), 'D')
  ) stored;

create index if not exists artifacts_search_vector_idx
  on public.artifacts using gin (search_vector);
