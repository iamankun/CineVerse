# Cài đặt Comments Table cho Supabase

Hướng dẫn này sẽ giúp bạn tạo bảng comments trong Supabase để sử dụng hệ thống bình luận.

## 🔧 Cách 1: Tự động (Khuyến nghị)

### Bước 1: Chuẩn bị Environment Variables

Thêm vào file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Lưu ý:** Cần Service Role Key (không phải Anon key) để có quyền admin.

### Bước 2: Chạy Script

```bash
npm run setup-comments
```

Script sẽ tự động:
- ✅ Tạo bảng `comments`
- ✅ Thêm constraints và indexes
- ✅ Cấu hình Row Level Security
- ✅ Tạo policies
- ✅ Gán permissions

## 🔧 Cách 2: Thủ công (Nếu tự động thất bại)

### Bước 1: Mở Supabase Dashboard

1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project của bạn
3. Đi đến **SQL Editor**

### Bước 2: Thực thi SQL

Copy và paste từng step trong file `database/comments_simple.sql`:

```sql
-- Step 1: Create comments table
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
    is_pinned BOOLEAN DEFAULT FALSE
);
```

**Run** step 1 trước, sau đó tiếp tục với các step tiếp theo.

### Bước 3: Kiểm tra

Sau khi chạy xong, kiểm tra trong **Table Editor** xem bảng `comments` đã được tạo chưa.

## 🔍 Kiểm tra cài đặt

### 1. Kiểm tra bảng tồn tại

Trong Supabase Dashboard → Table Editor, tìm bảng `public.comments`.

### 2. Kiểm tra structure

Bảng nên có các columns:
- `id` (UUID, Primary Key)
- `movie_id` (Integer, nullable)
- `tv_id` (Integer, nullable)
- `user_id` (UUID, not null)
- `username` (Text, not null)
- `user_avatar` (Text, nullable)
- `content` (Text, not null)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `likes` (Integer, default 0)
- `dislikes` (Integer, default 0)
- `parent_id` (UUID, nullable)
- `is_deleted` (Boolean, default false)
- `is_pinned` (Boolean, default false)

### 3. Kiểm tra RLS

Trong **Authentication** → **Policies**, nên có:
- "Users can view comments"
- "Users can insert comments"
- "Users can update comments"

## 🚀 Sử dụng hệ thống bình luận

Sau khi cài đặt thành công:

1. **Restart dev server:**
```bash
npm run dev
```

2. **Test comment system:**
- Truy cập trang chi tiết phim
- Đăng nhập và thử bình luận
- Kiểm tra comments xuất hiện trong Supabase

## 🐛 Troubleshooting

### Lỗi: "permission denied for table comments"
- **Nguyên nhân:** Chưa enable RLS hoặc chưa tạo policies
- **Fix:** Chạy lại script hoặc thực thi manual SQL

### Lỗi: "column does not exist"
- **Nguyên nhân:** Script chạy không đầy đủ
- **Fix:** Kiểm tra lại các step trong SQL editor

### Lỗi: "relation does not exist"
- **Nguyên nhân:** Bảng chưa được tạo
- **Fix:** Chạy lại từ Step 1

## 📝 Files liên quan

- `database/comments_simple.sql` - Script đơn giản
- `database/comments_table.sql` - Script đầy đủ
- `scripts/setup-comments.js` - Script tự động
- `src/types/comment.ts` - TypeScript types
- `src/hooks/useComments.ts` - React hook

## 🎉 Hoàn thành!

Khi bảng được tạo thành công, hệ thống bình luận sẽ sẵn sàng sử dụng với đầy đủ tính năng:

- ✅ Bình luận đa cấp (nested replies)
- ✅ Like/Dislike
- ✅ Edit/Delete
- ✅ Pagination
- ✅ Real-time updates
- ✅ Authentication integration

Chúc bạn thành công! 🚀
