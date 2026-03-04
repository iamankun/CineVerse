-- Migration: Add DELETE RLS policy for comments (Hard Delete)
-- Created: 2025-03-04 13:54:00 UTC+7

-- Allow users to hard delete their own comments
CREATE POLICY "Users can hard delete their own comments" ON public.comments
    FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- Allow users to delete reactions on their own comments
CREATE POLICY "Users can delete reactions on their own comments" ON public.comment_reactions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.comments 
            WHERE public.comments.id = public.comment_reactions.comment_id 
            AND public.comments.user_id = auth.uid()
        )
    );
