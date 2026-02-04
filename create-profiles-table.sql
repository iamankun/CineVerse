-- Tạo bảng profiles nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  role text default 'user',
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile." ON public.profiles;

-- Create policies for full access
CREATE POLICY "Users can view own profile." 
  ON public.profiles FOR SELECT 
  USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE 
  USING ( auth.uid() = id );

CREATE POLICY "Users can delete own profile." 
  ON public.profiles FOR DELETE 
  USING ( auth.uid() = id );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
