-- Migration: Add foreign key relationship between comments and profiles
-- Created: 2025-03-04 13:52:00 UTC+7

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_fkey'
        AND table_name = 'comments'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Refresh schema cache
SELECT 1 FROM public.comments LIMIT 1;
SELECT 1 FROM public.profiles LIMIT 1;
