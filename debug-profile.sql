-- Kiểm tra bảng profiles có tồn tại không
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- Kiểm tra cấu trúc bảng profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Kiểm tra RLS policies
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Test query profiles table
SELECT COUNT(*) as profile_count FROM public.profiles;

-- Kiểm tra user hiện tại
SELECT current_user, session_user;
