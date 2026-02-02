import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createProfilesTable() {
  console.log('🏗️ Đang tạo profiles table...');
  
  try {
    // Tạo profiles table với SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          username TEXT UNIQUE,
          full_name TEXT,
          bio TEXT,
          website TEXT,
          location TEXT,
          avatar_url TEXT,
          public_profile BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
        CREATE POLICY "Users can view their own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);
          
        DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
        CREATE POLICY "Users can insert their own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
          
        DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
        CREATE POLICY "Users can update their own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);
          
        DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
        CREATE POLICY "Users can delete their own profile" ON profiles
          FOR DELETE USING (auth.uid() = id);
        
        -- Create trigger for updated_at
        CREATE OR REPLACE FUNCTION handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER handle_profiles_updated_at
          BEFORE UPDATE ON profiles
          FOR EACH ROW
          EXECUTE FUNCTION handle_updated_at();
        
        -- Create upsert function
        CREATE OR REPLACE FUNCTION upsert_profile(
          p_id UUID,
          p_username TEXT DEFAULT NULL,
          p_full_name TEXT DEFAULT NULL,
          p_bio TEXT DEFAULT NULL,
          p_website TEXT DEFAULT NULL,
          p_location TEXT DEFAULT NULL,
          p_avatar_url TEXT DEFAULT NULL,
          p_public_profile BOOLEAN DEFAULT true
        )
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          INSERT INTO profiles (
            id, 
            username, 
            full_name, 
            bio, 
            website, 
            location, 
            avatar_url, 
            public_profile,
            updated_at
          ) VALUES (
            p_id,
            p_username,
            p_full_name,
            p_bio,
            p_website,
            p_location,
            p_avatar_url,
            p_public_profile,
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            full_name = EXCLUDED.full_name,
            bio = EXCLUDED.bio,
            website = EXCLUDED.website,
            location = EXCLUDED.location,
            avatar_url = EXCLUDED.avatar_url,
            public_profile = EXCLUDED.public_profile,
            updated_at = NOW();
        END;
        $$;
        
        GRANT EXECUTE ON FUNCTION upsert_profile TO authenticated;
      `
    });
    
    if (error) {
      console.error('❌ Lỗi tạo profiles table:', error);
    } else {
      console.log('✅ Đã tạo profiles table và policies thành công!');
    }
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Lỗi test kết nối:', testError);
    } else {
      console.log('✅ Test kết nối profiles table thành công!');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

createProfilesTable();
