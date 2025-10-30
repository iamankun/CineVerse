# 🚀 Quick Setup - Vercel Blob + GitHub Integration

## Bước 1: Vercel Blob (2 phút)

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project → Tab "Storage" → "Create Database" → "Blob"
3. Copy `BLOB_READ_WRITE_TOKEN`
4. Add vào Environment Variables

## Bước 2: GitHub Token (2 phút)

1. [GitHub Settings](https://github.com/settings/tokens) → Personal access tokens → Generate
2. Chọn scope: `repo` (full control)
3. Copy token
4. Add vào Vercel:
   - `GITHUB_TOKEN=ghp_xxxxx`
   - `GITHUB_OWNER=iamankun`
   - `GITHUB_REPO=CineVerse`

## Bước 3: Deploy Hook (Optional)

1. Vercel → Settings → Git → Deploy Hooks → Create
2. Copy URL
3. Add: `VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/...`

## ✅ Done!

### Production:
- JSON → Vercel Blob (CDN)
- Auto backup → GitHub
- Auto rebuild (nếu có hook)

### Development:  
- JSON → Local files
- Auto commit → GitHub (nếu có token)

📖 Chi tiết: Xem `STORAGE_SETUP.md`
