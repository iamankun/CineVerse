-- ===========================================
-- TẠO BẢNG LIVESTREAM
-- Chạy file này trong Supabase SQL Editor
-- ===========================================

create table if not exists public.livestream (
    id text not null primary key,
    name text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    user_name text not null,
    status text not null default 'offline' check (status in ('offline', 'starting', 'live', 'stopping', 'error')),
    stream_key text not null,
    ingest_url text not null,
    hls_url text,
    flv_url text,
    viewer_count integer not null default 0,
    started_at timestamp with time zone,
    category text not null default 'other',
    thumbnail text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

alter table public.livestream enable row level security;

-- Policies
create policy "Everyone can view live streams"
on public.livestream for select
to anon, authenticated
using (true);

create policy "Users can insert their own stream"
on public.livestream for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "Users can update their own stream"
on public.livestream for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "Users can delete their own stream"
on public.livestream for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));

-- Indexes
create index if not exists livestream_user_idx on public.livestream (user_id);
create index if not exists livestream_status_idx on public.livestream (status);

-- Trigger cho updated_at
create or replace function public.set_livestream_updated_at()
returns trigger
set search_path = ''
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_livestream_updated_at on public.livestream;
create trigger set_livestream_updated_at
before update on public.livestream
for each row
execute function public.set_livestream_updated_at();
