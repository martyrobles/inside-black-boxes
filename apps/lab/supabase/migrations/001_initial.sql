-- Blackletter Lab — Slice 1 schema
-- Run in Supabase SQL editor or via CLI after creating the project.

create extension if not exists "pgcrypto";

create type public.artifact_type as enum (
  'note',
  'image',
  'document',
  'url'
);

create type public.artifact_intent as enum (
  'unknown',
  'developing',
  'project_bound'
);

create type public.confidentiality_level as enum (
  'personal',
  'work',
  'privileged',
  'do_not_send_to_model'
);

create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  type public.artifact_type not null,
  title text,
  body text,
  source_url text,
  storage_path text,
  mime_type text,
  file_name text,
  file_size integer,
  user_description text not null default '',
  intent public.artifact_intent not null default 'unknown',
  confidentiality public.confidentiality_level not null default 'personal',
  processing_status text not null default 'ready',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz
);

create index artifacts_owner_created_idx
  on public.artifacts (owner_id, created_at desc)
  where deleted_at is null;

create index artifacts_owner_type_idx
  on public.artifacts (owner_id, type)
  where deleted_at is null;

alter table public.artifacts enable row level security;

create policy "artifacts_select_own"
  on public.artifacts for select
  using (auth.uid() = owner_id);

create policy "artifacts_insert_own"
  on public.artifacts for insert
  with check (auth.uid() = owner_id);

create policy "artifacts_update_own"
  on public.artifacts for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "artifacts_delete_own"
  on public.artifacts for delete
  using (auth.uid() = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger artifacts_set_updated_at
  before update on public.artifacts
  for each row
  execute function public.set_updated_at();

-- Private storage bucket for uploads (max 25MB enforced in app; set bucket limit in dashboard)
insert into storage.buckets (id, name, public, file_size_limit)
values ('artifacts', 'artifacts', false, 3145728)
on conflict (id) do update
set public = false,
    file_size_limit = 3145728;

create policy "artifacts_storage_select_own"
  on storage.objects for select
  using (
    bucket_id = 'artifacts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "artifacts_storage_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'artifacts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "artifacts_storage_update_own"
  on storage.objects for update
  using (
    bucket_id = 'artifacts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "artifacts_storage_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'artifacts'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
