-- Fix permissions for auth tables
-- Run this in Supabase SQL Editor

-- 1. Grant permissions to authenticated role (for normal operations)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 2. Check current permissions
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.role_table_grants 
WHERE table_schema IN ('auth', 'public')
  AND table_name IN ('users', 'profiles')
  AND grantee IN ('authenticated', 'anon');

-- 3. Test basic access
SELECT 'Testing public.profiles' as test_query;
SELECT COUNT(*) as profiles_count FROM public.profiles;
