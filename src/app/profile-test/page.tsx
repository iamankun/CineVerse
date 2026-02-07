import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProfileTest() {
  const supabase = await createClient();
  
  console.log("🔍 [PROFILE-TEST] Testing direct profile query without auth...");
  
  // Test query profiles table directly (like notes page)
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select();
  
  console.log("🔍 [PROFILE-TEST] Profiles result:", {
    count: profiles?.length,
    error: profilesError?.message
  });
  
  // Test auth check separately
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  console.log("🔍 [PROFILE-TEST] Auth result:", {
    hasUser: !!user,
    userId: user?.id,
    authError: authError?.message
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Profile Test (No Auth Required)</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Profiles Table (like notes):</h2>
        <pre>{JSON.stringify({ count: profiles?.length, data: profiles }, null, 2)}</pre>
        {profilesError && <pre style={{ color: 'red' }}>Error: {profilesError.message}</pre>}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Auth Check:</h2>
        <pre>{JSON.stringify({ hasUser: !!user, userId: user?.id, email: user?.email }, null, 2)}</pre>
        {authError && <pre style={{ color: 'red' }}>Auth Error: {authError.message}</pre>}
      </div>
      
      <div>
        <h2>Environment:</h2>
        <pre>{JSON.stringify({ 
          nodeEnv: process.env.NODE_ENV,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "..."
        }, null, 2)}</pre>
      </div>
    </div>
  );
}
