import { createClient } from '@/utils/supabase/client';

/**
 * Debug script để kiểm tra Supabase cookie names thực tế
 */
async function debugCookies() {
  console.log('🔍 [COOKIE DEBUG] Bắt đầu debug cookies...');
  
  try {
    const supabase = createClient();
    
    // Lấy session hiện tại
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ [COOKIE DEBUG] Session found:', {
        userId: session.user.id,
        email: session.user.email,
        accessToken: session.access_token ? 'exists' : 'missing',
        refreshToken: session.refresh_token ? 'exists' : 'missing'
      });
      
      // Kiểm tra tất cả cookies trong browser
      if (typeof window !== 'undefined') {
        console.log('🍪 [COOKIE DEBUG] Browser cookies:');
        document.cookie.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          if (name && value) {
            console.log(`  🍪 ${name}: ${value.substring(0, 20)}...`);
          }
        });
      }
    } else {
      console.log('❌ [COOKIE DEBUG] No session found');
    }
    
  } catch (error) {
    console.error('❌ [COOKIE DEBUG] Error:', error);
  }
}

// Chạy function
debugCookies();
