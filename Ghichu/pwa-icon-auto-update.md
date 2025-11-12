# PWA Icon Auto-Update System

## 🎯 Vấn đề

Khi cập nhật logo/icons của PWA, người dùng đã cài đặt app không thấy logo mới vì:
- Manifest.json bị cache mạnh bởi browser và service worker
- Icons được cache lâu dài trong PWA cache
- Không có cơ chế force refresh icons

## ✅ Giải pháp đã triển khai

### 1. **Dynamic Manifest API** (`src/app/api/manifest/route.ts`)

Thay vì serve static `manifest.json`, tạo API endpoint động:
- Đọc `manifest.json` từ filesystem
- Inject version từ `package.json` vào tất cả icon URLs
- Thêm cache-control headers để force revalidation
- Format: `icon.png?v=1.3.2`

```typescript
// Icon URLs được transform
"icons/android/android-launchericon-48-48.png"
→ "icons/android/android-launchericon-48-48.png?v=1.3.2"
```

### 2. **Build-time Manifest Update** (`scripts/update-manifest-version.mjs`)

Script tự động chạy trước mỗi lần build:
- Đọc version từ `package.json`
- Cập nhật `manifest.json` với version field
- Thêm `?v={version}` vào tất cả icon URLs
- Đảm bảo consistency giữa build và runtime

```bash
npm run update-manifest  # Manual run
npm run build            # Auto-run via prebuild hook
```

### 3. **Client-side Version Tracking** (`src/utils/manifest.ts`)

Hook `useManifestRefresh()` kiểm tra version changes:
- Lưu version hiện tại trong localStorage
- So sánh với version mới khi app load
- Clear relevant caches khi phát hiện version mới
- Force reload manifest link với version param

```typescript
// Sử dụng trong RootLayoutContent
useManifestRefresh();
```

### 4. **Enhanced PWA Update Prompt** (`src/components/PWAUpdatePrompt.tsx`)

Khi user click "Cập nhật ngay":
- Clear tất cả caches (bao gồm icon cache)
- Send SKIP_WAITING message đến service worker
- Trigger immediate reload với fresh assets

## 📁 Files liên quan

```
src/
├── app/
│   ├── api/
│   │   └── manifest/
│   │       └── route.ts           # Dynamic manifest API
│   └── layout.tsx                 # manifest: "/api/manifest"
├── components/
│   ├── RootLayoutContent.tsx      # useManifestRefresh()
│   └── PWAUpdatePrompt.tsx        # Clear cache on update
└── utils/
    ├── manifest.ts                # Version tracking & cache busting
    └── version.ts                 # Version utilities

scripts/
└── update-manifest-version.mjs    # Build-time manifest updater

public/
└── manifest.json                  # Static manifest (updated by script)
```

## 🔄 Quy trình auto-update

### Khi developer update icons:

1. Generate new icons: `npm run generate-icons`
2. Bump version trong `package.json`: `1.3.2` → `1.3.3`
3. Build app: `npm run build`
   - Script `prebuild` tự động update manifest
   - Thêm `?v=1.3.3` vào tất cả icon URLs
4. Deploy production

### Khi user mở app:

1. **First visit after update:**
   - `useManifestRefresh()` detect version change (1.3.2 → 1.3.3)
   - Clear icon/manifest caches
   - Load manifest từ API với version mới
   
2. **PWA update detected:**
   - Service worker phát hiện có bản mới
   - Hiển thị notification "🎉 Cập nhật mới"
   - User click "Cập nhật ngay"
   
3. **Update process:**
   - Clear tất cả PWA caches
   - Activate new service worker (skipWaiting)
   - Reload app với manifest mới
   - Download icons với `?v=1.3.3` (bypass cache)
   
4. **Result:**
   - ✅ Logo mới hiển thị trong app
   - ✅ App icon trên home screen cập nhật
   - ✅ Splash screen sử dụng logo mới

## 🛠️ Commands

```bash
# Update manifest manually
npm run update-manifest

# Generate new icons from source
npm run generate-icons

# Full rebuild (auto-updates manifest)
npm run build

# Development (manifest not auto-updated)
npm run dev
```

## 🔍 Debugging

### Check current manifest version:
```javascript
fetch('/api/manifest')
  .then(r => r.json())
  .then(m => console.log('Manifest version:', m.version));
```

### Check localStorage version:
```javascript
console.log('Stored version:', localStorage.getItem('app-version'));
```

### Clear all caches manually:
```javascript
caches.keys().then(names => 
  Promise.all(names.map(name => caches.delete(name)))
);
```

### Force manifest reload:
```javascript
const link = document.querySelector('link[rel="manifest"]');
link.href = '/api/manifest?v=' + Date.now();
```

## 📝 Best Practices

### ✅ Nên làm:
- Bump version trong `package.json` khi thay đổi icons
- Chạy `npm run generate-icons` trước khi build
- Test PWA update flow trên production-like environment
- Verify icon updates trên các platforms (Android, iOS, Windows)

### ❌ Không nên:
- Hard-code icon URLs without version params
- Edit manifest.json manually (sẽ bị override khi build)
- Skip version bump khi update icons
- Disable cache clearing trong PWAUpdatePrompt

## 🎯 Kết quả

✅ Icons tự động cập nhật khi có version mới
✅ Không cần user uninstall/reinstall PWA
✅ Cache busting đảm bảo load icons mới
✅ Version tracking tránh conflicts
✅ Seamless update experience cho users
