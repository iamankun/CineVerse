import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAvatarsBucket() {
  try {
    console.log('🪣 Đang tạo avatars bucket...');
    
    // Check if bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.find(b => b.name === 'avatars');
    
    if (exists) {
      console.log('✅ Avatars bucket đã tồn tại');
      return;
    }
    
    // Create bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });
    
    if (error) {
      console.error('❌ Lỗi tạo bucket:', error);
      return;
    }
    
    console.log('✅ Đã tạo avatars bucket thành công');
    
    // Create policies
    const policies = [
      {
        name: "Users can upload their own avatar",
        definition: `
          CREATE POLICY "Users can upload their own avatar" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'avatars' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: "Users can view their own avatar", 
        definition: `
          CREATE POLICY "Users can view their own avatar" ON storage.objects
          FOR SELECT USING (
            bucket_id = 'avatars' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: "Users can update their own avatar",
        definition: `
          CREATE POLICY "Users can update their own avatar" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'avatars' AND 
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      }
    ];
    
    for (const policy of policies) {
      try {
        const { error: policyError } = await supabase.rpc('exec_sql', { 
          sql: policy.definition 
        });
        
        if (policyError) {
          console.error(`❌ Lỗi tạo policy ${policy.name}:`, policyError);
        } else {
          console.log(`✅ Đã tạo policy: ${policy.name}`);
        }
      } catch (err) {
        console.error(`❌ Lỗi tạo policy ${policy.name}:`, err);
      }
    }
    
    console.log('🎉 Hoàn thành tạo avatars bucket và policies!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

createAvatarsBucket();
