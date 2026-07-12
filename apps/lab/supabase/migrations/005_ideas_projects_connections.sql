-- Slice 3: Ideas, Projects Underway, manual Connections
-- Safe to re-run. Requires Slice 1–2 tables.

do $$ begin
  create type public.idea_status as enum ('incubating', 'active', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.project_status as enum ('active', 'paused', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.lab_entity_type as enum ('artifact', 'idea', 'project', 'collection');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.connection_type as enum (
    'thematic',
    'causal',
    'contrast',
    'visual',
    'evidentiary',
    'serendipitous'
  );
exception when duplicate_object then null;
end $$;

-- Ideas
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  premise text not null default '',
  status public.idea_status not null default 'incubating',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ideas_owner_created_idx
  on public.ideas (owner_id, created_at desc)
  where deleted_at is null;

alter table public.ideas enable row level security;

drop policy if exists "ideas_select_own" on public.ideas;
drop policy if exists "ideas_insert_own" on public.ideas;
drop policy if exists "ideas_update_own" on public.ideas;
drop policy if exists "ideas_delete_own" on public.ideas;

create policy "ideas_select_own" on public.ideas for select using (auth.uid() = owner_id);
create policy "ideas_insert_own" on public.ideas for insert with check (auth.uid() = owner_id);
create policy "ideas_update_own" on public.ideas for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "ideas_delete_own" on public.ideas for delete using (auth.uid() = owner_id);

drop trigger if exists ideas_set_updated_at on public.ideas;
create trigger ideas_set_updated_at
  before update on public.ideas
  for each row
  execute function public.set_updated_at();

create table if not exists public.idea_artifacts (
  idea_id uuid not null references public.ideas (id) on delete cascade,
  artifact_id uuid not null references public.artifacts (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (idea_id, artifact_id)
);

create index if not exists idea_artifacts_artifact_idx on public.idea_artifacts (artifact_id);

alter table public.idea_artifacts enable row level security;

drop policy if exists "idea_artifacts_select_own" on public.idea_artifacts;
drop policy if exists "idea_artifacts_insert_own" on public.idea_artifacts;
drop policy if exists "idea_artifacts_delete_own" on public.idea_artifacts;

create policy "idea_artifacts_select_own"
  on public.idea_artifacts for select
  using (
    exists (select 1 from public.ideas i where i.id = idea_id and i.owner_id = auth.uid())
  );

create policy "idea_artifacts_insert_own"
  on public.idea_artifacts for insert
  with check (
    exists (select 1 from public.ideas i where i.id = idea_id and i.owner_id = auth.uid() and i.deleted_at is null)
    and exists (select 1 from public.artifacts a where a.id = artifact_id and a.owner_id = auth.uid() and a.deleted_at is null)
  );

create policy "idea_artifacts_delete_own"
  on public.idea_artifacts for delete
  using (
    exists (select 1 from public.ideas i where i.id = idea_id and i.owner_id = auth.uid())
  );

-- Projects Underway
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  goal text not null default '',
  thesis text not null default '',
  status public.project_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists projects_owner_created_idx
  on public.projects (owner_id, created_at desc)
  where deleted_at is null;

alter table public.projects enable row level security;

drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_own" on public.projects for select using (auth.uid() = owner_id);
create policy "projects_insert_own" on public.projects for insert with check (auth.uid() = owner_id);
create policy "projects_update_own" on public.projects for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "projects_delete_own" on public.projects for delete using (auth.uid() = owner_id);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

create table if not exists public.project_ideas (
  project_id uuid not null references public.projects (id) on delete cascade,
  idea_id uuid not null references public.ideas (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (project_id, idea_id)
);

create index if not exists project_ideas_idea_idx on public.project_ideas (idea_id);

alter table public.project_ideas enable row level security;

drop policy if exists "project_ideas_select_own" on public.project_ideas;
drop policy if exists "project_ideas_insert_own" on public.project_ideas;
drop policy if exists "project_ideas_delete_own" on public.project_ideas;

create policy "project_ideas_select_own"
  on public.project_ideas for select
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

create policy "project_ideas_insert_own"
  on public.project_ideas for insert
  with check (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid() and p.deleted_at is null)
    and exists (select 1 from public.ideas i where i.id = idea_id and i.owner_id = auth.uid() and i.deleted_at is null)
  );

create policy "project_ideas_delete_own"
  on public.project_ideas for delete
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

create table if not exists public.project_artifacts (
  project_id uuid not null references public.projects (id) on delete cascade,
  artifact_id uuid not null references public.artifacts (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (project_id, artifact_id)
);

create index if not exists project_artifacts_artifact_idx on public.project_artifacts (artifact_id);

alter table public.project_artifacts enable row level security;

drop policy if exists "project_artifacts_select_own" on public.project_artifacts;
drop policy if exists "project_artifacts_insert_own" on public.project_artifacts;
drop policy if exists "project_artifacts_delete_own" on public.project_artifacts;

create policy "project_artifacts_select_own"
  on public.project_artifacts for select
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

create policy "project_artifacts_insert_own"
  on public.project_artifacts for insert
  with check (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid() and p.deleted_at is null)
    and exists (select 1 from public.artifacts a where a.id = artifact_id and a.owner_id = auth.uid() and a.deleted_at is null)
  );

create policy "project_artifacts_delete_own"
  on public.project_artifacts for delete
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

-- Manual Connections
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  from_type public.lab_entity_type not null,
  from_id uuid not null,
  to_type public.lab_entity_type not null,
  to_id uuid not null,
  connection_type public.connection_type not null default 'thematic',
  rationale text not null default '',
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint connections_not_self check (not (from_type = to_type and from_id = to_id))
);

create index if not exists connections_owner_created_idx
  on public.connections (owner_id, created_at desc)
  where deleted_at is null;

create index if not exists connections_from_idx
  on public.connections (owner_id, from_type, from_id)
  where deleted_at is null;

create index if not exists connections_to_idx
  on public.connections (owner_id, to_type, to_id)
  where deleted_at is null;

alter table public.connections enable row level security;

drop policy if exists "connections_select_own" on public.connections;
drop policy if exists "connections_insert_own" on public.connections;
drop policy if exists "connections_update_own" on public.connections;
drop policy if exists "connections_delete_own" on public.connections;

create policy "connections_select_own" on public.connections for select using (auth.uid() = owner_id);
create policy "connections_insert_own" on public.connections for insert with check (auth.uid() = owner_id);
create policy "connections_update_own" on public.connections for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "connections_delete_own" on public.connections for delete using (auth.uid() = owner_id);
