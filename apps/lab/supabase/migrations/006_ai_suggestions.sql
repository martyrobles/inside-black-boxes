-- Slice 4: AI suggestions (summary + What could this become?)
-- Drafts require user acceptance before becoming permanent Ideas.

create table if not exists public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  artifact_id uuid not null references public.artifacts (id) on delete cascade,
  kind text not null check (kind in ('summary', 'what_could_become')),
  title text,
  content text not null default '',
  payload jsonb not null default '{}'::jsonb,
  model text,
  status text not null default 'draft'
    check (status in ('draft', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  rejected_at timestamptz
);

create index if not exists ai_suggestions_artifact_idx
  on public.ai_suggestions (artifact_id, kind, created_at desc);

create index if not exists ai_suggestions_owner_idx
  on public.ai_suggestions (owner_id, created_at desc);

alter table public.ai_suggestions enable row level security;

drop policy if exists "ai_suggestions_select_own" on public.ai_suggestions;
drop policy if exists "ai_suggestions_insert_own" on public.ai_suggestions;
drop policy if exists "ai_suggestions_update_own" on public.ai_suggestions;
drop policy if exists "ai_suggestions_delete_own" on public.ai_suggestions;

create policy "ai_suggestions_select_own"
  on public.ai_suggestions for select using (auth.uid() = owner_id);
create policy "ai_suggestions_insert_own"
  on public.ai_suggestions for insert with check (auth.uid() = owner_id);
create policy "ai_suggestions_update_own"
  on public.ai_suggestions for update
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "ai_suggestions_delete_own"
  on public.ai_suggestions for delete using (auth.uid() = owner_id);

drop trigger if exists ai_suggestions_set_updated_at on public.ai_suggestions;
create trigger ai_suggestions_set_updated_at
  before update on public.ai_suggestions
  for each row
  execute function public.set_updated_at();
