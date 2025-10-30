# Hướng dẫn Setup Storage cho CineVerse

Dự án đã được cấu hình để sử dụng **3 chiến lược lưu trữ** JSON:

## 🎯 Chiến lược lưu trữ

### 1. **Vercel Blob Storage** (Ưu tiên - Production)
- Lưu trữ trên cloud Vercel
- Tự động CDN
- Không giới hạn read/write trên production

### 2. **GitHub Integration** (Backup tự động)
- Auto-commit vào repo GitHub
- Version control cho JSON files
- Có thể trigger auto-rebuild

### 3. **File System** (Fallback - Development)
- Lưu local khi dev
- Backup khi Blob và GitHub fail

---

## 📋 Bước 1: Setup Vercel Blob Storage

### 1.1. Tạo Blob Store trên Vercel
```bash
# Vào Vercel Dashboard
1. Chọn project CineVerse
2. Vào tab "Storage"
3. Click "Create Database" → chọn "Blob"
4. Đặt tên: "cineverse-sources"
```

### 1.2. Copy token
```bash
# Sau khi tạo, copy "BLOB_READ_WRITE_TOKEN"
```

### 1.3. Thêm vào Environment Variables
```bash
# Trên Vercel Dashboard:
Settings → Environment Variables → Add

BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxxxxxxxxxx
```

---

## 📋 Bước 2: Setup GitHub Integration

### 2.1. Tạo GitHub Personal Access Token
```bash
# Vào GitHub Settings
1. Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Chọn scopes:
   ✅ repo (full control)
5. Generate token và copy
```

### 2.2. Thêm vào Environment Variables
```bash
# Trên Vercel Dashboard:
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_OWNER=iamankun  # Hoặc username của bạn
GITHUB_REPO=CineVerse  # Hoặc tên repo của bạn
```

---

## 📋 Bước 3: Setup Auto-Rebuild (Optional)

### 3.1. Tạo Deploy Hook
```bash
# Trên Vercel Dashboard:
1. Settings → Git → Deploy Hooks
2. Click "Create Hook"
3. Name: "Auto rebuild on JSON update"
4. Branch: main
5. Create Hook và copy URL
```

### 3.2. Thêm vào Environment Variables
```bash
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/xxxxx
```

---

## 🔧 Local Development

### Setup .env.local
```bash
cp .env.example .env.local

# Thêm các biến:
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
GITHUB_TOKEN=ghp_xxxxx
GITHUB_OWNER=iamankun
GITHUB_REPO=CineVerse
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/xxxxx
```

---

## ✅ Kiểm tra hoạt động

### Test trên Local:
```bash
npm run dev

# Vào dashboard → Thêm/Sửa phim
# Check console logs:
✅ Saved to file system
✅ Committed to GitHub (nếu có token)
```

### Test trên Production:
```bash
# Deploy lên Vercel
vercel --prod

# Vào dashboard → Thêm/Sửa phim
# Check console logs trên Vercel:
✅ Saved to Vercel Blob
✅ Committed to GitHub
✅ Triggered Vercel deployment (nếu có)
```

---

## 🎬 Workflow hoàn chỉnh

### Khi save phim/TV show:
1. **Production (Vercel)**:
   - → Save to Vercel Blob ✅
   - → Commit to GitHub ✅
   - → Trigger rebuild (optional) ✅

2. **Development (Local)**:
   - → Save to file system ✅
   - → Commit to GitHub ✅

3. **Fallback**:
   - Nếu Blob fail → dùng File System
   - Nếu GitHub fail → chỉ log warning

---

## 🚀 Kết quả

### ✅ Trên Production:
- JSON lưu trên **Vercel Blob** (fast read via CDN)
- Tự động **backup vào GitHub** (version control)
- Có thể **rebuild tự động** sau mỗi update

### ✅ Trên Development:
- JSON lưu **local file** (development thuận tiện)
- Vẫn commit **GitHub** nếu có token

### ✅ Đồng bộ:
- GitHub luôn có bản backup mới nhất
- Vercel Blob có data production
- Local có data development

---

## 🔍 Troubleshooting

### Lỗi "EROFS: read-only file system":
- ✅ Đã fix: Hệ thống tự động chuyển sang Blob

### Lỗi "GitHub commit failed":
- Check GITHUB_TOKEN còn valid không
- Check scopes có `repo` permission

### Lỗi "Vercel Blob failed":
- Check BLOB_READ_WRITE_TOKEN
- Check quota còn không (free tier có limit)

### Không tự động rebuild:
- Check VERCEL_DEPLOY_HOOK URL
- Đợi 1-2 phút để deployment trigger

---

## 📚 Tài liệu tham khảo

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [GitHub API Docs](https://docs.github.com/en/rest)
- [Vercel Deploy Hooks](https://vercel.com/docs/deployments/deploy-hooks)
