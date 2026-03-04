// Script to setup comments table in Supabase
// Run with: node scripts/setup-comments.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY (service role key, not anon key)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupCommentsTable() {
  try {
    console.log('🚀 Setting up comments table...');

    // Read SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlFile = fs.readFileSync(path.join(__dirname, '../database/comments_simple.sql'), 'utf8');

    // Split SQL into individual statements
    const statements = sqlFile
      .split('-- Step')
      .filter(step => step.trim())
      .map(step => step.replace(/^\d+:\s*/, '').trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Try direct SQL execution if RPC fails
          try {
            const { data, error: directError } = await supabase
              .from('comments')
              .select('*')
              .limit(1);
            
            if (directError && directError.code === 'PGRST116') {
              console.log('✅ Table does not exist yet (expected), continuing...');
              continue;
            }
          } catch (e) {
            console.log('⚠️  Could not verify table existence');
          }
          
          console.error('❌ Error executing statement:', error);
          console.log('🔧 You may need to run this manually in Supabase SQL Editor:');
          console.log(statement);
          continue;
        }
        
        console.log('✅ Statement executed successfully');
      }
    }

    // Verify table creation
    console.log('\n🔍 Verifying table creation...');
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.error('❌ Table was not created successfully');
        console.log('🔧 Please run the SQL manually in Supabase Dashboard:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Copy and paste the content of database/comments_simple.sql');
        console.log('3. Run the script step by step');
      } else {
        console.error('❌ Error verifying table:', error);
      }
    } else {
      console.log('✅ Comments table created successfully!');
      console.log('🎉 Comment system is ready to use!');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Manual setup instructions:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy and paste the content of database/comments_simple.sql');
    console.log('3. Run the script step by step');
  }
}

// Alternative function using direct HTTP requests
async function setupWithDirectAPI() {
  console.log('🌐 Trying direct API setup...');
  
  const statements = [
    `CREATE TABLE public.comments (
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
    );`,
    `ALTER TABLE public.comments 
    ADD CONSTRAINT check_media_type CHECK (
      (movie_id IS NOT NULL AND tv_id IS NULL) OR 
      (movie_id IS NULL AND tv_id IS NOT NULL)
    );`,
    `CREATE INDEX idx_comments_movie_id ON public.comments(movie_id);`,
    `CREATE INDEX idx_comments_tv_id ON public.comments(tv_id);`,
    `CREATE INDEX idx_comments_user_id ON public.comments(user_id);`,
    `CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);`,
    `ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;`,
    `CREATE POLICY "Users can view comments" ON public.comments
      FOR SELECT USING (is_deleted = FALSE);`,
    `CREATE POLICY "Users can insert comments" ON public.comments
      FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY "Users can update comments" ON public.comments
      FOR UPDATE USING (auth.uid() = user_id);`,
    `GRANT ALL ON public.comments TO authenticated;`,
    `GRANT SELECT ON public.comments TO anon;`
  ];

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\n⚡ Executing ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify({ sql_query: statement })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Error:', error);
        continue;
      }

      console.log('✅ Success');
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run the setup
setupCommentsTable()
  .then(() => {
    console.log('\n🎉 Setup completed!');
    console.log('📝 Next steps:');
    console.log('1. Test the comment system in your app');
    console.log('2. Check if comments appear in Supabase Dashboard');
    console.log('3. Verify user permissions work correctly');
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
