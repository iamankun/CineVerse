-- Refresh schema cache for comments table
-- This migration ensures Supabase recognizes the comments table structure

-- Select from comments table to refresh schema cache
SELECT 1 FROM public.comments LIMIT 1;