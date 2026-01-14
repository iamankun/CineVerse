BEGIN;
SELECT plan(8);

-- Test cấu trúc bảng profiles
SELECT has_table('public', 'profiles', 'Bảng profiles tồn tại') AS test_result;
SELECT has_column('public', 'profiles', 'id', 'Cột id trong profiles tồn tại') AS test_result;
SELECT has_column('public', 'profiles', 'username', 'Cột username trong profiles tồn tại') AS test_result;
SELECT col_is_pk('public', 'profiles', 'id', 'Cột id là primary key của profiles') AS test_result;

-- Test cấu trúc bảng watchlist
SELECT has_table('public', 'watchlist', 'Bảng watchlist tồn tại') AS test_result;
SELECT has_column('public', 'watchlist', 'user_id', 'Cột user_id trong watchlist tồn tại') AS test_result;
SELECT has_column('public', 'watchlist', 'title', 'Cột title trong watchlist tồn tại') AS test_result;
SELECT col_is_pk('public', 'watchlist', array['user_id', 'id', 'type'], 'Composite primary key của watchlist tồn tại') AS test_result;

SELECT * FROM finish();
ROLLBACK;
