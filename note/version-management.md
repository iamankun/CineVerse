# Version Management

## Giới thiệu

CineVerse sử dụng hệ thống quản lý phiên bản tự động từ `package.json`. Không cần hard-code số phiên bản ở nhiều nơi.

## Cách sử dụng

### Import utility

```typescript
import { APP_VERSION, getVersionString } from "@/utils/version";
```

### Các API có sẵn

#### `APP_VERSION`

Trả về số phiên bản thuần túy từ `package.json` (ví dụ: `"1.3.2"`).

```typescript
console.log(APP_VERSION); // "1.3.2"
```

#### `getVersionString(prefix?: string)`

Trả về chuỗi phiên bản có format với prefix (mặc định là `"v"`).

```typescript
getVersionString();        // "v1.3.2"
getVersionString("ver ");  // "ver 1.3.2"
getVersionString("");      // "1.3.2"
```

## Các vị trí đã tích hợp

1. **Footer** (`src/components/ui/layout/Footer.tsx`)
   - Hiển thị: `v1.3.2`
   - Vị trí: Cuối trang, phía dưới cùng

2. **Admin Panel** (`src/app/admin/page.tsx`)
   - Hiển thị: `Phiên bản v1.3.2`
   - Vị trí: Footer của admin page

3. **About Page** (`src/components/sections/About/about.tsx`)
   - Hiển thị: `CineVerse v1.3.2`
   - Vị trí: Dưới icon code

## Cập nhật phiên bản

Để cập nhật phiên bản ứng dụng, chỉ cần thay đổi trong `package.json`:

```json
{
  "version": "1.3.3"
}
```

Tất cả các nơi hiển thị version sẽ tự động cập nhật sau khi rebuild.

## Best Practices

### ✅ Nên làm

- Import từ `@/utils/version` khi cần hiển thị version
- Sử dụng `getVersionString()` cho UI display
- Sử dụng `APP_VERSION` cho logic hoặc API calls

### ❌ Không nên làm

- Hard-code version ở nhiều nơi (ví dụ: `"v1.3.2"`)
- Tạo constants riêng cho version
- Quên cập nhật version trong `package.json` khi release

## Lý do sử dụng

1. **Single Source of Truth**: Chỉ cần cập nhật ở một nơi (`package.json`)
2. **Tự động đồng bộ**: Không lo version không khớp giữa các file
3. **Dễ maintain**: Giảm thiểu lỗi khi release version mới
4. **PWA friendly**: Version trong `package.json` trigger PWA update detection
