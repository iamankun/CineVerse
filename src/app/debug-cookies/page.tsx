import { cookies } from 'next/headers';

export default async function DebugCookies() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Filter Supabase cookies
  const supabaseCookies = allCookies.filter(cookie => 
    cookie.name.includes('sb-') || 
    cookie.name.includes('supabase')
  );
  
  // Check cookie attributes
  const cookieDetails = supabaseCookies.map(cookie => ({
    name: cookie.name,
    value: cookie.value ? cookie.value.substring(0, 20) + "..." : "empty",
    hasValue: !!cookie.value,
    length: cookie.value?.length || 0
  }));
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
      <h1>🍪 Cookie Debug</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Environment:</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify({
            nodeEnv: process.env.NODE_ENV,
            protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
            domain: typeof window !== 'undefined' ? window.location.hostname : 'server'
          }, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>All Cookies ({allCookies.length}):</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(allCookies.map(c => ({ name: c.name, hasValue: !!c.value })), null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Supabase Cookies ({supabaseCookies.length}):</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(cookieDetails, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Cookie Status:</h2>
        <div style={{ 
          padding: '10px', 
          borderRadius: '4px',
          backgroundColor: supabaseCookies.length > 0 ? '#d4edda' : '#f8d7da',
          color: supabaseCookies.length > 0 ? '#155724' : '#721c24'
        }}>
          {supabaseCookies.length > 0 ? 
            `✅ Found ${supabaseCookies.length} Supabase cookies` : 
            '❌ No Supabase cookies found'
          }
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Expected Cookies:</h2>
        <pre style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify([
            'sb-access-token',
            'sb-refresh-token',
            'sb-access-token-v2',
            'sb-refresh-token-v2'
          ], null, 2)}
        </pre>
      </div>
    </div>
  );
}
