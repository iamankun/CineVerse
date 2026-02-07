import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function NotesDebug() {
  console.log("🔍 [NOTES-DEBUG] Starting debug...");
  
  // Check environment first
  const envCheck = {
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    vercelEnv: process.env.VERCEL_ENV
  };
  
  console.log("🔍 [NOTES-DEBUG] Environment:", envCheck);
  
  let supabase = null;
  let connectionError = null;
  
  // Try to create client
  try {
    supabase = await createClient();
    console.log("🔍 [NOTES-DEBUG] Supabase client created successfully");
  } catch (error: any) {
    connectionError = error;
    console.error("🔍 [NOTES-DEBUG] Failed to create Supabase client:", error);
  }
  
  let notes = null;
  let notesError = null;
  
  // Try to query notes
  if (supabase) {
    try {
      console.log("🔍 [NOTES-DEBUG] Attempting to query notes...");
      const result = await supabase.from("notes").select();
      notes = result.data;
      notesError = result.error;
      
      console.log("🔍 [NOTES-DEBUG] Query result:", {
        notesCount: notes?.length,
        hasError: !!notesError,
        error: notesError?.message
      });
    } catch (error: any) {
      notesError = error;
      console.error("🔍 [NOTES-DEBUG] Query failed:", error);
    }
  }
  
  // Try direct HTTP test
  let httpTest = null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notes`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json'
      }
    });
    
    httpTest = {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: response.url
    };
    
    if (response.ok) {
      const data = await response.json();
      httpTest.data = data;
    }
    
    console.log("🔍 [NOTES-DEBUG] HTTP test:", httpTest);
  } catch (error: any) {
    httpTest = {
      error: error.message,
      stack: error.stack
    };
    console.error("🔍 [NOTES-DEBUG] HTTP test failed:", error);
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
      <h1>🔍 Notes Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment Check:</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(envCheck, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Connection Test:</h2>
        {connectionError ? (
          <pre style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px' }}>
            ❌ Connection Error: {connectionError.message}
          </pre>
        ) : (
          <pre style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px' }}>
            ✅ Supabase client created successfully
          </pre>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Query Test:</h2>
        {notesError ? (
          <pre style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px' }}>
            ❌ Query Error: {notesError.message}
          </pre>
        ) : (
          <pre style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px' }}>
            ✅ Query successful: {notes?.length || 0} notes found
          </pre>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>HTTP Test (Direct API):</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(httpTest, null, 2)}
        </pre>
      </div>
      
      {notes && notes.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Notes Data:</h2>
          <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(notes, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
