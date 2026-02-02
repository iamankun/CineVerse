import { createClient } from '@supabase/supabase-js';

// Sử dụng đúng environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://exsoflgvdreikabvhvkg.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4c29mbGd2ZHJlaWthYnZodmtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAzODQ3NiwiZXhwIjoyMDczNjE0NDc2fQ.GzCb1r9W2Y9G1QidElkxsTB6WKZ7KPH2HKB39nolbkY';

const supabase = createClient(supabaseUrl, serviceKey);

async function debugProfileUpdate() {
  console.log('🔍 Debug profile update issues...');
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Service Key:', serviceKey ? 'Present' : 'Missing');
  
  try {
    // 1. Kiểm tra profiles table structure
    console.log('\n📊 Kiểm tra profiles table structure...');
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.log('❌ Lỗi fetch profiles:', fetchError.message);
      console.log('🔍 Details:', {
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint
      });
      return;
    }
    
    console.log('✅ Profiles table accessible');
    if (profiles && profiles.length > 0) {
      console.log('📋 Sample profile:', Object.keys(profiles[0]));
      console.log('📋 Profile data:', profiles[0]);
    }
    
    // 2. Kiểm tra RLS status
    console.log('\n🔒 Kiểm tra RLS status...');
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .from('pg_class')
        .select('relname, relrowsecurity')
        .eq('relname', 'profiles');
      
      if (rlsError) {
        console.log('⚠️ Không thể kiểm tra RLS:', rlsError.message);
      } else {
        console.log('✅ RLS Status:', rlsData);
      }
    } catch (e) {
      console.log('⚠️ Không thể truy cập pg_class');
    }
    
    // 3. Test update với service key
    console.log('\n✏️ Test update với service key...');
    if (profiles && profiles.length > 0) {
      const testId = profiles[0].id;
      const updateData = {
        username: 'debug_test_' + Date.now(),
        bio: 'Debug test update'
      };
      
      console.log('📝 Test update:', { id: testId, data: updateData });
      
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', testId)
        .select()
        .single();
      
      if (updateError) {
        console.log('❌ Service key update error:', updateError.message);
        console.log('🔍 Details:', {
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint
        });
      } else {
        console.log('✅ Service key update success:', updateResult);
      }
    }
    
    // 4. Kiểm tra policies
    console.log('\n📋 Kiểm tra RLS policies...');
    try {
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('policyname, tablename, permissive, roles, cmd')
        .eq('tablename', 'profiles');
      
      if (policyError) {
        console.log('⚠️ Không thể kiểm tra policies:', policyError.message);
      } else {
        console.log('✅ Policies found:', policies?.length || 0);
        policies?.forEach(p => {
          console.log(`  📋 ${p.policyname}: ${p.cmd} for ${p.roles}`);
        });
      }
    } catch (e) {
      console.log('⚠️ Không thể truy cập pg_policies');
    }
    
    // 5. Kiểm tra columns
    console.log('\n🏗️ Kiểm tra columns...');
    try {
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'profiles')
        .eq('table_schema', 'public');
      
      if (columnError) {
        console.log('⚠️ Không thể kiểm tra columns:', columnError.message);
      } else {
        console.log('✅ Columns found:', columns?.length || 0);
        columns?.forEach(c => {
          console.log(`  🏗️ ${c.column_name}: ${c.data_type} (${c.is_nullable})`);
        });
      }
    } catch (e) {
      console.log('⚠️ Không thể truy cập information_schema.columns');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugProfileUpdate();
