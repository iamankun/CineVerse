-- Check for triggers that might be blocking auth operations
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_table LIKE '%user%' 
   OR trigger_name LIKE '%auth%'
   OR action_statement LIKE '%auth%';

-- Check RLS policies on auth tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('users', 'auth', 'auth.users', 'profiles');

-- Check for custom functions that might interfere
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname LIKE '%auth%' 
   OR prosrc LIKE '%auth%'
   OR proname LIKE '%hook%'
LIMIT 10;

-- Check for any custom extensions that might interfere
SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname LIKE '%auth%' 
   OR extname LIKE '%hook%';

-- Check table constraints
SELECT 
    conname,
    contype,
    condeferrable,
    condeferred
FROM pg_constraint 
WHERE conrelid::regclass::text LIKE '%user%'
   OR conname LIKE '%auth%';
