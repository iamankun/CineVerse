import { createClient } from '@/utils/supabase/server';
import { getServerSession } from "@/utils/supabase/server-session";

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
  const { user, error: sessionError } = await getServerSession();
  
  console.log("🔍 [PROFILE-TEST] Session result:", {
    hasUser: !!user,
    userId: user?.id,
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
        {sessionError && <pre style={{ color: 'red' }}>Session Error: {sessionError}</pre>}
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
