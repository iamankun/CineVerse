/**
 * Utility functions để quản lý cache
 */

/**
 * Clear toàn bộ cache (Browser + Service Worker + Server)
 */
export async function clearAllCache(): Promise<{
  success: boolean;
  message: string;
  details?: string[];
}> {
  const results: string[] = [];

  try {
    // 1. Clear Service Worker Cache
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          const deleted = await caches.delete(cacheName);
          if (deleted) {
            results.push(`✓ Đã xóa cache: ${cacheName}`);
          }
        })
      );
    }

    // 2. Unregister Service Worker để force reload
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(async (registration) => {
          await registration.unregister();
          results.push('✓ Đã gỡ đăng ký Service Worker');
        })
      );
    }

    // 3. Clear Server Cache thông qua API
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        results.push('✓ Đã làm mới cache server');
      }
    } catch (error) {
      results.push('⚠ Không thể làm mới cache server');
      console.error('Server cache clear error:', error);
    }

    // 4. Clear localStorage và sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
      results.push('✓ Đã xóa dữ liệu local storage');
    } catch (error) {
      console.error('Storage clear error:', error);
    }

    return {
      success: true,
      message: 'Đã làm mới toàn bộ cache thành công!',
      details: results,
    };
  } catch (error) {
    console.error('Cache clear error:', error);
    return {
      success: false,
      message: 'Có lỗi khi làm mới cache',
      details: results,
    };
  }
}

/**
 * Clear chỉ Service Worker cache
 */
export async function clearServiceWorkerCache(): Promise<boolean> {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    const results = await Promise.all(
      cacheNames.map((cacheName) => caches.delete(cacheName))
    );
    return results.every((result) => result);
  }
  return false;
}

/**
 * Clear chỉ browser storage
 */
export function clearBrowserStorage(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.error('Failed to clear browser storage:', error);
  }
}

/**
 * Reload trang sau khi clear cache
 */
export function reloadAfterCacheClear(delay: number = 500): void {
  setTimeout(() => {
    window.location.reload();
  }, delay);
}
