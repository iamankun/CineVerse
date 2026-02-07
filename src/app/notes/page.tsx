import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Notes() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("notes").select();

  console.log("🔍 [NOTES PAGE] Notes query result:", {
    count: notes?.length,
    data: notes,
    environment: process.env.NODE_ENV
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
      <h1>📝 Notes from Supabase</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment: {process.env.NODE_ENV}</h2>
        <h2>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</h2>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Notes Data ({notes?.length || 0} items):</h2>
        {notes && notes.length > 0 ? (
          <pre style={{ 
            backgroundColor: '#fff', 
            padding: '10px', 
            borderRadius: '4px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {JSON.stringify(notes, null, 2)}
          </pre>
        ) : (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f8d7da', 
            color: '#721c24',
            borderRadius: '4px'
          }}>
            ❌ No notes found or query failed
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Debug Info:</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify({
            hasNotes: !!notes,
            notesCount: notes?.length || 0,
            nodeEnv: process.env.NODE_ENV,
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
