// Direct table creation using Supabase client
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createCommentsTable() {
  try {
    console.log('🚀 Creating comments table directly via Supabase client...');
    
    // Try to create table using raw SQL through postgres function
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, try to create it
      console.log('📝 Table does not exist, attempting to create...');
      
      // Use the raw SQL approach
      const createTableSQL = `
        CREATE TABLE public.comments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          movie_id INTEGER NULL,
          tv_id INTEGER NULL,
          user_id UUID NOT NULL,
          username TEXT NOT NULL,
          user_avatar TEXT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          likes INTEGER DEFAULT 0,
          dislikes INTEGER DEFAULT 0,
          parent_id UUID NULL,
          is_deleted BOOLEAN DEFAULT FALSE,
          is_pinned BOOLEAN DEFAULT FALSE
        );
      `;
      
      console.log('🔧 Please run this SQL manually in Supabase Dashboard:');
      console.log('='.repeat(80));
      console.log(createTableSQL);
      console.log('='.repeat(80));
      
      return { success: false, needsManual: true };
    } else if (error) {
      console.error('❌ Error checking table:', error);
      return { success: false, error };
    } else {
      console.log('✅ Comments table already exists!');
      return { success: true };
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error };
  }
}

createCommentsTable().then(result => {
  if (result.needsManual) {
    console.log('\n🎯 MANUAL SETUP REQUIRED');
    console.log('1. Go to: https://supabase.com/dashboard/project/exsoflgvdreikabvhvkg/sql');
    console.log('2. Copy and paste the SQL above');
    console.log('3. Run each statement individually');
  } else if (result.success) {
    console.log('\n🎉 SUCCESS! Comments table is ready');
  } else {
    console.log('\n💥 FAILED! Check error messages above');
  }
});
