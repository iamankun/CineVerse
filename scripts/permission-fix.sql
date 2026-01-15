-- Fix permission issue causing 405 error
-- Run in Supabase SQL Editor

-- Grant permissions to authenticated role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Test the fix
SELECT COUNT(*) as profiles_count FROM public.profiles;
