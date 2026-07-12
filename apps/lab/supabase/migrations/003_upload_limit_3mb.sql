-- Set artifacts bucket max file size to 3 MB

update storage.buckets
set file_size_limit = 3145728
where id = 'artifacts';
