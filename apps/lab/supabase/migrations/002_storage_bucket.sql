-- Create private uploads bucket for Blackletter Lab (run in SQL Editor)

insert into storage.buckets (id, name, public, file_size_limit)
values ('artifacts', 'artifacts', false, 3145728)
on conflict (id) do update
set public = false,
    file_size_limit = 3145728;

-- Allow each signed-in user to manage only their own folder: {user_id}/...

drop policy if exists "artifacts_storage_select_own" on storage.objects;
drop policy if exists "artifacts_storage_insert_own" on storage.objects;
drop policy if exists "artifacts_storage_update_own" on storage.objects;
drop policy if exists "artifacts_storage_delete_own" on storage.objects;

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
