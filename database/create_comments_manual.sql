-- COPY AND PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard/project/exsoflgvdreikabvhvkg/sql

-- Step 1: Create the table
CREATE TABLE public.comments (
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
    CONSTRAINT check_media_type CHECK (
        (movie_id IS NOT NULL AND tv_id IS NULL) OR 
        (movie_id IS NULL AND tv_id IS NOT NULL)
    )
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_comments_movie_id ON public.comments(movie_id);
CREATE INDEX idx_comments_tv_id ON public.comments(tv_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- Step 3: Create trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON public.comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Step 5: Create security policies
CREATE POLICY "Users can view comments" ON public.comments
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Step 6: Grant permissions
GRANT ALL ON public.comments TO authenticated;
GRANT SELECT ON public.comments TO anon;

-- Step 7: Verify table creation
SELECT 'Comments table created successfully!' as status;
