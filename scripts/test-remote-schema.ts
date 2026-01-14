import { createClient } from '@supabase/supabase-js';

// Sử dụng keys từ .env.local (remote Supabase)
const supabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM'
);

async function testRemoteSchema() {
  console.log('Testing Remote Supabase Schema...');
  
  try {
    // Check what columns exist in profiles table
    console.log('🔍 Checking profiles table structure...');
    
    const { data: profilesColumns, error: columnsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ Profiles columns error:', columnsError.message);
      console.error('Details:', columnsError);
    } else {
      console.log('✅ Profiles table structure:');
      if (profilesColumns && profilesColumns.length > 0) {
        console.log('📋 Columns:', Object.keys(profilesColumns[0]));
        console.log('📄 Sample data:', profilesColumns[0]);
      } else {
        console.log('📋 Table is empty but accessible');
      }
    }

    // Test with specific columns that should exist
    console.log('🔍 Testing with specific columns...');
    
    const { data: profilesData, error: specificError } = await supabase
      .from('profiles')
      .select('id, created_at')
      .limit(5);

    if (specificError) {
      console.error('❌ Specific columns error:', specificError.message);
    } else {
      console.log('✅ Basic columns accessible:', profilesData);
    }

    // Check if we can insert data with service role (bypass RLS)
    console.log('🔧 Testing with different approach...');
    
    // Try to get table info using RPC
    let tableInfo = null;
    let rpcErrorMessage = 'RPC not available';
    
    try {
      const result = await supabase.rpc('get_table_columns', { table_name: 'profiles' });
      tableInfo = result.data;
      if (result.error) {
        rpcErrorMessage = result.error.message;
      }
    } catch (err) {
      rpcErrorMessage = 'RPC not available';
    }

    if (rpcErrorMessage !== 'RPC not available') {
      console.log('ℹ️ RPC not available (expected):', rpcErrorMessage);
    } else {
      console.log('📋 Table info:', tableInfo);
    }

    // Test watchlist structure
    console.log('🎬 Checking watchlist table...');
    
    const { data: watchlistSample, error: watchlistError } = await supabase
      .from('watchlist')
      .select('*')
      .limit(1);

    if (watchlistError) {
      console.error('❌ Watchlist error:', watchlistError.message);
    } else {
      console.log('✅ Watchlist accessible');
      if (watchlistSample && watchlistSample.length > 0) {
        console.log('📋 Watchlist columns:', Object.keys(watchlistSample[0]));
      }
    }

    // Test histories structure
    console.log('📚 Checking histories table...');
    
    const { data: historiesSample, error: historiesError } = await supabase
      .from('histories')
      .select('*')
      .limit(1);

    if (historiesError) {
      console.error('❌ Histories error:', historiesError.message);
    } else {
      console.log('✅ Histories accessible');
      if (historiesSample && historiesSample.length > 0) {
        console.log('📋 Histories columns:', Object.keys(historiesSample[0]));
      }
    }

    console.log('✅ Remote schema test completed!');
    
  } catch (error) {
    console.error('❌ Schema test failed:', error);
  }
}

testRemoteSchema().catch(console.error);
