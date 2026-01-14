BEGIN;
SELECT plan(5);

-- Ví dụ: https://pgtap.org/documentation.html

-- 1. Kiểm tra kết nối cơ sở dữ liệu cơ bản
SELECT pass('Kết nối cơ sở dữ liệu thành công') AS test_result;

-- 2. Kiểm tra bảng profiles tồn tại
SELECT has_table('public', 'profiles', 'Bảng profiles tồn tại') AS test_result;

-- 3. Kiểm tra bảng watchlist tồn tại
SELECT has_table('public', 'watchlist', 'Bảng watchlist tồn tại') AS test_result;

-- 4. Kiểm tra bảng histories tồn tại
SELECT has_table('public', 'histories', 'Bảng histories tồn tại') AS test_result;

-- 5. Kiểm tra function set_updated_at tồn tại
SELECT has_function('public', 'set_updated_at', 'Function set_updated_at tồn tại') AS test_result;

SELECT * FROM finish();
ROLLBACK;
