-- Create or replace the upsert_profile function
CREATE OR REPLACE FUNCTION upsert_profile(
  p_id UUID,
  p_username TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_public_profile BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    username, 
    full_name, 
    bio, 
    website, 
    location, 
    avatar_url, 
    public_profile,
    updated_at
  ) VALUES (
    p_id,
    p_username,
    p_full_name,
    p_bio,
    p_website,
    p_location,
    p_avatar_url,
    p_public_profile,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    bio = EXCLUDED.bio,
    website = EXCLUDED.website,
    location = EXCLUDED.location,
    avatar_url = EXCLUDED.avatar_url,
    public_profile = EXCLUDED.public_profile,
    updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_profile TO authenticated;
