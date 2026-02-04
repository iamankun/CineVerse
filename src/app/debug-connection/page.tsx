import { createClient } from '@/utils/supabase/server';

export default async function DebugConnection() {
  const supabase = await createClient();
  
  console.log("🔍 [DEBUG] Starting connection test...");
  console.log("🔍 [DEBUG] Environment:", {
    nodeEnv: process.env.NODE_ENV,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    vercelEnv: process.env.VERCEL_ENV
  });
  
  const results: any = {
    environment: {
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      vercelEnv: process.env.VERCEL_ENV
    },
    tests: {}
  };

  // Test 1: Basic connection
  try {
    console.log("🔍 [DEBUG] Test 1: Basic connection...");
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    results.tests.basicConnection = {
      success: !connectionError,
      error: connectionError?.message,
      data: connectionTest
    };
    
    console.log("🔍 [DEBUG] Basic connection result:", results.tests.basicConnection);
  } catch (error: any) {
    results.tests.basicConnection = {
      success: false,
      error: error.message,
      stack: error.stack
    };
    console.error("🔍 [DEBUG] Basic connection failed:", error);
  }

  // Test 2: Notes table
  try {
    console.log("🔍 [DEBUG] Test 2: Notes table...");
    const { data: notes, error: notesError } = await supabase.from("notes").select();
    
    results.tests.notesTable = {
      success: !notesError,
      count: notes?.length,
      error: notesError?.message,
      sample: notes?.slice(0, 2)
    };
    
    console.log("🔍 [DEBUG] Notes result:", results.tests.notesTable);
  } catch (error: any) {
    results.tests.notesTable = {
      success: false,
      error: error.message
    };
    console.error("🔍 [DEBUG] Notes test failed:", error);
  }

  // Test 3: Auth test
  try {
    console.log("🔍 [DEBUG] Test 3: Auth test...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    results.tests.auth = {
      success: !authError,
      hasUser: !!user,
      userId: user?.id,
      error: authError?.message
    };
    
    console.log("🔍 [DEBUG] Auth result:", results.tests.auth);
  } catch (error: any) {
    results.tests.auth = {
      success: false,
      error: error.message
    };
    console.error("🔍 [DEBUG] Auth test failed:", error);
  }

  // Test 4: Simple ping
  try {
    console.log("🔍 [DEBUG] Test 4: Simple ping...");
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json'
      }
    });
    
    results.tests.ping = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText
    };
    
    console.log("🔍 [DEBUG] Ping result:", results.tests.ping);
  } catch (error: any) {
    results.tests.ping = {
      success: false,
      error: error.message
    };
    console.error("🔍 [DEBUG] Ping failed:", error);
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
      <h1>🔍 Supabase Connection Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment:</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(results.environment, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Test Results:</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(results.tests, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Quick Status:</h2>
        <div style={{ 
          padding: '10px', 
          borderRadius: '4px',
          backgroundColor: results.tests.basicConnection?.success ? '#d4edda' : '#f8d7da',
          color: results.tests.basicConnection?.success ? '#155724' : '#721c24'
        }}>
          {results.tests.basicConnection?.success ? '✅ CONNECTION OK' : '❌ CONNECTION FAILED'}
        </div>
      </div>
    </div>
  );
}
