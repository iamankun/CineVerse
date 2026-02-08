-- Function để tạo profile thủ công khi trigger không hoạt động
CREATE OR REPLACE FUNCTION public.insert_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT DEFAULT NULL,
  user_username TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'member',
  user_verify TEXT DEFAULT 'false'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, role, verify)
  VALUES (
    user_id,
    user_email,
    user_full_name,
    user_username,
    user_role,
    user_verify
  );
END;
$$;
