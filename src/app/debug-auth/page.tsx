import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function DebugAuth() {
  console.log("🔍 [DEBUG-AUTH] Starting auth debug...");
  
  // Check cookies first
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.name.includes('sb-') || cookie.name.includes('supabase')
  );
  
  console.log("🔍 [DEBUG-AUTH] Cookies found:", supabaseCookies.length);
  
  const supabase = await createClient();
  
  // Test 1: getSession (recommended)
  let sessionResult = null;
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    sessionResult = {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: sessionError?.message,
      accessToken: session?.access_token ? "present" : "missing"
    };
    console.log("🔍 [DEBUG-AUTH] Session result:", sessionResult);
  } catch (error: any) {
    sessionResult = {
      error: error.message,
      stack: error.stack
    };
    console.error("🔍 [DEBUG-AUTH] Session failed:", error);
  }
  
  // Test 2: getUser (current method)
  let userResult = null;
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    userResult = {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: userError?.message
    };
    console.log("🔍 [DEBUG-AUTH] User result:", userResult);
  } catch (error: any) {
    userResult = {
      error: error.message,
      stack: error.stack
    };
    console.error("🔍 [DEBUG-AUTH] User failed:", error);
  }
  
  // Test 3: Direct API call (bypass middleware)
  let directAuthResult = null;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseCookies.find(c => c.name.includes('access-token'))?.value || ''}`
      }
    });
    
    directAuthResult = {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    };
    
    if (response.ok) {
      const userData = await response.json();
      directAuthResult.user = {
        id: userData.id,
        email: userData.email
      };
    }
    
    console.log("🔍 [DEBUG-AUTH] Direct auth result:", directAuthResult);
  } catch (error: any) {
    directAuthResult = {
      error: error.message
    };
    console.error("🔍 [DEBUG-AUTH] Direct auth failed:", error);
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
      <h1>🔐 Auth Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Supabase Cookies ({supabaseCookies.length}):</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(supabaseCookies.map(c => ({ 
            name: c.name, 
            hasValue: !!c.value,
            length: c.value?.length || 0 
          })), null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>getSession() Test:</h2>
        <pre style={{ 
          backgroundColor: sessionResult?.error ? '#f8d7da' : '#d4edda', 
          color: sessionResult?.error ? '#721c24' : '#155724',
          padding: '10px', 
          borderRadius: '4px' 
        }}>
          {JSON.stringify(sessionResult, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>getUser() Test (Current Method):</h2>
        <pre style={{ 
          backgroundColor: userResult?.error ? '#f8d7da' : '#d4edda', 
          color: userResult?.error ? '#721c24' : '#155724',
          padding: '10px', 
          borderRadius: '4px' 
        }}>
          {JSON.stringify(userResult, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Direct API Test (Bypass Middleware):</h2>
        <pre style={{ 
          backgroundColor: directAuthResult?.error ? '#f8d7da' : '#d4edda', 
          color: directAuthResult?.error ? '#721c24' : '#155724',
          padding: '10px', 
          borderRadius: '4px' 
        }}>
          {JSON.stringify(directAuthResult, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment:</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify({
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV,
            protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http'
          }, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Recommendation:</h2>
        <div style={{ 
          padding: '10px', 
          borderRadius: '4px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7'
        }}>
          {sessionResult?.hasSession ? 
            "✅ Session works - use getSession() instead of getUser()" :
            userResult?.hasUser ? 
            "✅ User works - issue might be elsewhere" :
            supabaseCookies.length > 0 ?
            "⚠️ Cookies exist but auth fails - check middleware" :
            "❌ No cookies found - user not logged in"
          }
        </div>
      </div>
    </div>
  );
}
