-- Fix permission issue
-- Run in Supabase SQL Editor

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Test
SELECT COUNT(*) as profiles_count FROM public.profiles;
