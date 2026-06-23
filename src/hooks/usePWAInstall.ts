import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Nghe sự kiện và sau khi cài đặt thành công
    const handleBeforeInstallPrompt = (e: Event) => {
      // Ngăn thanh thông tin xuất hiện trên di động
      e.preventDefault();
      // Lưu sự kiện để có thể kích hoạt sau này
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      console.log('Cài đặt có thể thực hiện được');
    };

    // Lắng nghe sự kiện sau khi ứng dụng được cài đặt thành công
    const handleAppInstalled = () => {
      console.log('Cài đặt thành công');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ Không có sẵn cài đặt');
      return { outcome: 'dismissed' as const, message: 'Không thể hiển thị prompt cài đặt' };
    }

    // Hiển thị khi cài đặt với thông báo
    await deferredPrompt.prompt();

    // Chờ người dùng phản hồi thông báo
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('Người dùng đã chấp nhận cài đặt');
    } else {
      console.log('Người dùng đã từ chối cài đặt');
    }

    // Làm sạch thông báo
    setDeferredPrompt(null);
    setIsInstallable(false);

    return choiceResult;
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  };
}
