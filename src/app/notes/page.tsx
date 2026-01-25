import { createClient } from '@/utils/supabase/server';

export default async function Notes() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("notes").select();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Notes from Supabase</h1>
      <pre>{JSON.stringify(notes, null, 2)}</pre>
    </div>
  );
}
