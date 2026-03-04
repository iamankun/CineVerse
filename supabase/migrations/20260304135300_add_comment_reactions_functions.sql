-- Migration: Add comment reactions functions
-- Created: 2025-03-04 13:53:00 UTC+7

-- Function to increment comment likes
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.comments 
    SET likes = COALESCE(likes, 0) + 1 
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comment likes
CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.comments 
    SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) 
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment comment dislikes
CREATE OR REPLACE FUNCTION increment_comment_dislikes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.comments 
    SET dislikes = COALESCE(dislikes, 0) + 1 
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement comment dislikes
CREATE OR REPLACE FUNCTION decrement_comment_dislikes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.comments 
    SET dislikes = GREATEST(COALESCE(dislikes, 0) - 1, 0) 
    WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;
