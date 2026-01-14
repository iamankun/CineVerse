import { createClient } from '@supabase/supabase-js';

// Sử dụng keys từ .env.local (remote Supabase)
const supabase = createClient(
  'https://exsoflgvdreikabvhvkg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzg0NzYsImV4cCI6MjA3MzYxNDQ3Nn0.80qGLi5hEqLAHyY3-0eDgvxWf70oj7z7SimSA9V_ZUM'
);

async function testRemoteSupabaseConnection() {
  console.log('Testing Remote Supabase Connection...');
  
  try {
    // Test basic connection - check if tables exist
    console.log('🔍 Checking database schema...');
    
    // Test profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact' });

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible, count:', profilesData?.[0]?.count || 0);
    }

    // Test watchlist table
    const { data: watchlistData, error: watchlistError } = await supabase
      .from('watchlist')
      .select('count', { count: 'exact' });

    if (watchlistError) {
      console.error('❌ Watchlist table error:', watchlistError.message);
    } else {
      console.log('✅ Watchlist table accessible, count:', watchlistData?.[0]?.count || 0);
    }

    // Test histories table
    const { data: historiesData, error: historiesError } = await supabase
      .from('histories')
      .select('count', { count: 'exact' });

    if (historiesError) {
      console.error('❌ Histories table error:', historiesError.message);
    } else {
      console.log('✅ Histories table accessible, count:', historiesData?.[0]?.count || 0);
    }

    // Test public access (should work with anon key)
    console.log('🌐 Testing public access...');
    
    const { data: publicProfiles, error: publicError } = await supabase
      .from('profiles')
      .select('id, username, created_at')
      .limit(5);

    if (publicError) {
      console.error('❌ Public profiles error:', publicError.message);
    } else {
      console.log('✅ Public profiles accessible:', publicProfiles?.length || 0, 'profiles');
      if (publicProfiles && publicProfiles.length > 0) {
        console.log('📋 Sample profiles:', publicProfiles);
      }
    }

    // Test auth service (without captcha)
    console.log('🔐 Testing auth service status...');
    
    // Check if we can get auth configuration
    const { data: settings, error: settingsError } = await supabase
      .from('_realtime')
      .select('config')
      .limit(1);

    // This will likely fail but shows connection is working
    if (settingsError) {
      console.log('ℹ️ Auth service response (expected):', settingsError.message);
    }

    console.log('✅ Remote Supabase connection test completed!');
    console.log('📊 Database URL: https://exsoflgvdreikabvhvkg.supabase.co');
    console.log('🔑 Using anon key from .env.local');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testRemoteSupabaseConnection().catch(console.error);
