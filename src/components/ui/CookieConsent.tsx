"use client";

import { useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@heroui/react';

interface CookieConsentProps {
  className?: string;
}

export default function CookieConsent({ className = "" }: CookieConsentProps) {
  const [consent, setConsent] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem('cookie-consent');
      if (stored) {
        return { isVisible: false, isAccepted: true };
      }
    }
    return { isVisible: true, isAccepted: false };
  });

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setConsent({ isVisible: false, isAccepted: true });
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setConsent({ isVisible: false, isAccepted: true });
  };

  if (!consent.isVisible || consent.isAccepted) {
    return null;
  }

  return (
    <div className={`fixed bottom-20 left-0 right-0 z-50 p-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/30 rounded-xl shadow-2xl p-6">
          <div className="flex items-start gap-4">
            {/* Cookie Icon */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 bg-blue-500/15 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Cookie className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg mb-2">
                Chấp nhận Cookie
              </h3>
              <p className="text-gray-300/90 text-sm leading-relaxed mb-4">
                Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn, phân tích lưu lượng truy cập trang web, 
                và cá nhân hóa nội dung. Bằng cách tiếp tục sử dụng trang web của chúng tôi, bạn đồng ý với việc 
                sử dụng cookie theo Chính sách Quyền riêng tư của chúng tôi.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="sm"
                  color="primary"
                  onPress={handleAccept}
                  className="bg-blue-600/80 hover:bg-blue-700/90 text-white backdrop-blur-sm"
                >
                  Chấp nhận tất cả
                </Button>
                
                <Button
                  size="sm"
                  variant="bordered"
                  onPress={handleDecline}
                  className="border-gray-600/50 text-gray-300/90 hover:bg-gray-800/50 backdrop-blur-sm"
                >
                  Chỉ cần thiết
                </Button>
                
                <Button
                  size="sm"
                  variant="light"
                  as="a"
                  href="/privacy"
                  className="text-gray-400/80 hover:text-gray-200/90 backdrop-blur-sm"
                >
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleDecline}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-700/30 transition-all duration-200 backdrop-blur-sm"
            >
              <X className="w-4 h-4 text-gray-400/80 hover:text-gray-200/90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
