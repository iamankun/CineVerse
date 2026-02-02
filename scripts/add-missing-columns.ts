import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exsoflgvdreikabvhvkg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingColumns() {
  console.log('🔧 Thêm các columns còn thiếu vào profiles table...');
  
  try {
    // Kiểm tra columns hiện tại
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Lỗi truy vấn profiles:', error);
      return;
    }
    
    console.log('📊 Profiles hiện tại:', profiles);
    
    // Thêm các columns cần thiết
    const columnsToAdd = [
      'username TEXT UNIQUE',
      'bio TEXT', 
      'website TEXT',
      'location TEXT',
      'avatar_url TEXT',
      'public_profile BOOLEAN DEFAULT true'
    ];
    
    console.log('\n📝 Cần chạy SQL sau trong Supabase SQL Editor:');
    console.log('```sql');
    console.log('-- Thêm các columns còn thiếu');
    columnsToAdd.forEach(column => {
      console.log(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ${column};`);
    });
    
    console.log(`
-- Enable RLS nếu chưa có
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Tạo policies nếu chưa có
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);
    `);
    
    console.log('```');
    
    // Test update với existing data
    console.log('\n🧪 Test update với user hiện có...');
    const { data: testUpdate, error: testError } = await supabase
      .from('profiles')
      .update({ 
        full_name: 'CineVerse Updated'
      })
      .eq('id', '68ccc56a-023a-4bd4-8653-ee3b721d9332')
      .select();
    
    if (testError) {
      console.log('❌ Test update thất bại:', testError.message);
    } else {
      console.log('✅ Test update thành công:', testUpdate);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

addMissingColumns();
