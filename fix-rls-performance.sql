-- Fix RLS Performance Issue for public.profiles
-- Replace direct auth.uid() calls with scalar subqueries

-- Step 1: Get current policy (run this first to see existing policies)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Step 2: Drop existing policies (replace with actual policy names from above)
-- Example (adjust actual policy names from query results):
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Step 3: Create optimized policies with scalar subqueries
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Step 4: Create index for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Step 5: Verify policies are created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Step 6: Test performance with EXPLAIN ANALYZE
-- Run this as authenticated user to test:
EXPLAIN ANALYZE INSERT INTO public.profiles (id, username) 
VALUES ((SELECT auth.uid()), 'testuser');

-- Step 7: Test batch insert performance
EXPLAIN ANALYZE 
INSERT INTO public.profiles (id, username) 
SELECT 
    gen_random_uuid()::text, 
    'testuser' || generate_series(1, 100)
FROM generate_series(1, 100);
