-- ========================================
-- TẠO PROFILE CHO TẤT CẢ USERS CHƯA CÓ PROFILE
-- ========================================

-- Kiểm tra số lượng users chưa có profile
SELECT 
  COUNT(*) as users_without_profile
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Tạo profile cho tất cả users chưa có profile
INSERT INTO public.profiles (id, email, full_name, username, role, verify, public_profile)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
  'member',
  'true',
  true
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Kiểm tra kết quả
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN verify = 'true' THEN 1 END) as verified_profiles
FROM public.profiles;

-- Hiển thị users đã được tạo profile
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.username,
  p.role,
  p.verify,
  p.created_at
FROM public.profiles p
WHERE p.created_at > NOW() - INTERVAL '1 hour'
ORDER BY p.created_at DESC;
