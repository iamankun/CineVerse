
-- Migration: Sync CineVerse Schema with Remote
-- Add username column to profiles table if it doesn't exist

-- Add username column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='username'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN username text;
        CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles USING btree (username);
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END
$$;

-- Update existing profiles to have username based on email
UPDATE public.profiles 
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL AND email IS NOT NULL;

-- Ensure username is not null for new profiles
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- Drop existing policies and recreate with proper structure
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate policies
CREATE POLICY "Enable read access for all users"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
