import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Role Key is missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getUsers() {
  console.log('Fetching users from auth.users...');
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error.message);
    return;
  }

  if (users && users.users.length > 0) {
    console.log(`Found ${users.users.length} users:`);
    users.users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Created At: ${user.created_at}`);
    });
  } else {
    console.log('No users found in auth.users.');
  }
}

getUsers();
