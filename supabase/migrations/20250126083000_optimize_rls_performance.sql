-- Optimize RLS Performance for public.profiles
-- Replace direct auth.uid() calls with scalar subqueries

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create optimized policies with scalar subqueries
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
