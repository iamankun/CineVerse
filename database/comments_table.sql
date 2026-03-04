-- Create comments table for CineVerse
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    movie_id INTEGER NULL,
    tv_id INTEGER NULL,
    user_id UUID NOT NULL,
    username TEXT NOT NULL,
    user_avatar TEXT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    parent_id UUID NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- Ensure either movie_id or tv_id is provided (but not both)
    CONSTRAINT check_media_type CHECK (
        (movie_id IS NOT NULL AND tv_id IS NULL) OR 
        (movie_id IS NULL AND tv_id IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_movie_id ON public.comments(movie_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_comments_tv_id ON public.comments(tv_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_pinned ON public.comments(is_pinned DESC, created_at DESC) WHERE is_deleted = FALSE;

-- Create or update function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON public.comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create comment_reactions table for like/dislike functionality
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can only react once per comment
    UNIQUE(comment_id, user_id)
);

-- Add foreign key constraints after tables are created
DO $$
BEGIN
    -- Add foreign key for parent_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_parent_id_fkey'
    ) THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_parent_id_fkey 
        FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key for user_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_fkey'
    ) THEN
        ALTER TABLE public.comments 
        ADD CONSTRAINT comments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign keys for comment_reactions if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comment_reactions_comment_id_fkey'
    ) THEN
        ALTER TABLE public.comment_reactions 
        ADD CONSTRAINT comment_reactions_comment_id_fkey 
        FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comment_reactions_user_id_fkey'
    ) THEN
        ALTER TABLE public.comment_reactions 
        ADD CONSTRAINT comment_reactions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes for comment_reactions
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON public.comment_reactions(user_id);

-- Row Level Security (RLS) - Enable after tables are created
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete comments" ON public.comments;

-- Create new policies for comments
CREATE POLICY "Users can view comments" ON public.comments
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id AND is_deleted = FALSE);

-- RLS for comment_reactions
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing reaction policies if they exist
DROP POLICY IF EXISTS "Users can view reactions" ON public.comment_reactions;
DROP POLICY IF EXISTS "Users can insert reactions" ON public.comment_reactions;
DROP POLICY IF EXISTS "Users can update reactions" ON public.comment_reactions;
DROP POLICY IF EXISTS "Users can delete reactions" ON public.comment_reactions;

-- Create new policies for comment_reactions
CREATE POLICY "Users can view reactions" ON public.comment_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert reactions" ON public.comment_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update reactions" ON public.comment_reactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete reactions" ON public.comment_reactions
    FOR DELETE USING (auth.uid() = user_id);
