# Changelog - Version 1.3.2

## 🆕 Tính năng mới

### PWA Icon Auto-Update System
- **Dynamic Manifest API**: Manifest.json được serve động với version từ package.json
- **Cache Busting**: Tất cả icon URLs có version parameter (ví dụ: `icon.png?v=1.3.2`)
- **Build-time Manifest Update**: Script tự động cập nhật manifest trước mỗi lần build
- **Client-side Version Tracking**: Tự động phát hiện và clear cache khi có version mới
- **Enhanced Update Prompt**: Clear tất cả caches khi user update PWA

### Version Management System
- **Centralized Version**: Tất cả version đều đọc từ `package.json`
- **Version Utility** (`src/utils/version.ts`): Export `APP_VERSION` và `getVersionString()`
- **Auto-display Version**: Footer, Admin Panel, About Page tự động hiển thị version

## 🔧 Cải tiến

### Components Updated
- `Footer.tsx`: Hiển thị version động từ package.json
- `Admin Page`: Thêm version info vào footer
- `About Page`: Hiển thị version dưới logo
- `PWAUpdatePrompt`: Clear all caches khi update
- `RootLayoutContent`: Tích hợp `useManifestRefresh()` hook

### New Utilities
- `src/utils/version.ts`: Version management utilities
- `src/utils/manifest.ts`: Manifest refresh và cache busting
- `src/app/api/manifest/route.ts`: Dynamic manifest endpoint

### New Scripts
- `scripts/update-manifest-version.mjs`: Tự động update manifest với version
- `npm run update-manifest`: Manual manifest update
- `prebuild` hook: Tự động chạy update-manifest trước build

## 📝 Files Changed

### Created
```
src/
├── app/api/manifest/route.ts
├── utils/
│   ├── version.ts
│   └── manifest.ts
└── components/PWAUpdatePrompt.tsx (enhanced)

scripts/
└── update-manifest-version.mjs

Ghichu/
├── version-management.md
└── pwa-icon-auto-update.md
```

### Modified
```
src/
├── app/layout.tsx (manifest: "/api/manifest")
├── components/
│   ├── ui/layout/Footer.tsx (version display)
│   ├── RootLayoutContent.tsx (useManifestRefresh)
│   └── sections/About/about.tsx (version display)
└── app/admin/page.tsx (version display)

package.json (prebuild script + update-manifest script)
public/manifest.json (version: "1.3.2", icons with ?v=1.3.2)
```

## 🎯 Impact

### For Users
✅ App icons tự động cập nhật khi có version mới
✅ Không cần uninstall/reinstall PWA
✅ Smooth update experience với notification rõ ràng
✅ Biết được version hiện tại đang sử dụng

### For Developers
✅ Single source of truth cho version (package.json)
✅ Tự động sync version across all files
✅ No manual manifest editing required
✅ Easy to deploy icon updates

## 🔄 Upgrade Path

Khi update lên v1.3.2:
1. User mở app → Detect version change → Clear caches
2. Service worker detect update → Show notification
3. User click "Cập nhật ngay" → Clear all caches → Reload
4. New icons loaded with `?v=1.3.2` → Display fresh icons

## 📚 Documentation

- Version Management: `Ghichu/version-management.md`
- PWA Icon Auto-Update: `Ghichu/pwa-icon-auto-update.md`

## 🐛 Bug Fixes

- Fixed: Hard-coded version "v1.3.0" trong Footer
- Fixed: PWA icons không tự động cập nhật
- Fixed: Manifest cache không được invalidated

## ⚙️ Technical Details

- **Cache Strategy**: No-cache cho manifest, version-based cho icons
- **Service Worker**: skipWaiting + clientsClaim enabled
- **Update Interval**: Check for updates mỗi 60 giây
- **Storage**: localStorage tracking với key "app-version"

## 🚀 Next Steps

- Test PWA update flow trên production
- Verify icon updates trên Android/iOS/Windows
- Monitor version tracking analytics
- Consider adding update changelog modal
