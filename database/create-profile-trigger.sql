-- ========================================
-- SQL SCRIPTS ĐỂ CHẠY TRONG SUPABASE SQL EDITOR
-- ========================================

-- 1. TẠO FUNCTION TỰ ĐỘNG TẠO PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, role, verify)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    'member',
    'false'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TẠO TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. ENABLE RLS NẾU CHƯA CÓ
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. TẠO RLS POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- 5. KIỂM TRA TRIGGER
-- Tạo user test để kiểm tra
-- INSERT INTO auth.users (id, email, created_at) 
-- VALUES ('test-123', 'test@example.com', NOW());

-- 6. XÓA USER TEST (NẾU CẦN)
-- DELETE FROM auth.users WHERE id = 'test-123';

-- ========================================
-- KIỂM TRA KẾT QUẢ
-- ========================================

-- Kiểm tra trigger đã được tạo chưa
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Kiểm tra function đã được tạo chưa
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
