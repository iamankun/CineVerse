/**
 * Test script để kiểm tra getServerSession function
 */
import { getServerSession } from './src/utils/supabase/server-session.js';

async function testGetServerSession() {
  console.log('🔍 Testing getServerSession function...');
  
  try {
    const result = await getServerSession();
    
    console.log('✅ Success! Result:', {
      hasUser: !!result.user,
      userId: result.user?.id,
      userEmail: result.user?.email,
      hasError: !!result.error,
      error: result.error
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  }
}

// Run test
testGetServerSession();
