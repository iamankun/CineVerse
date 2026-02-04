-- Create the notes table (if not exists)
create table if not exists notes (
  id bigint primary key generated always as identity,
  title text not null,
  created_at timestamptz default timezone('utc'::text, now())
);

-- Insert some sample data into the table (only if table is empty)
insert into notes (title)
select * from (
  values 
    ('Today I created a Supabase project.'),
    ('I added some data and queried it from Next.js.'),
    ('It was awesome!')
) as data(title)
where not exists (select 1 from notes limit 1);

-- Enable Row Level Security
alter table notes enable row level security;

-- Drop existing policy if exists
drop policy if exists "public can read notes" on public.notes;

-- Create policy to make data publicly readable
create policy "public can read notes"
on public.notes
for select to anon
using (true);

-- Verify table and data
select 'Table created successfully' as status, count(*) as note_count from notes;
