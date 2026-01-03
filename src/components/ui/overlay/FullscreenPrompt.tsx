"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { useFullscreen, useMediaQuery } from "@mantine/hooks";
import { MdFullscreen } from "react-icons/md";

const FullscreenPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toggle, fullscreen } = useFullscreen();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Ensure component is mounted before showing modal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Chỉ hiển thị nếu component đã mount, không ở fullscreen, và KHÔNG phải mobile
    if (isMounted && !fullscreen && !isMobile) {
      // Delay 2 giây để người dùng có thời gian nhìn trang
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isMounted, fullscreen, isMobile]);

  const handleEnterFullscreen = () => {
    toggle();
    setIsOpen(false);
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  // Don't render until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleDismiss}
      placement="center"
      backdrop="blur"
      classNames={{
        backdrop: "bg-black/30 backdrop-blur-md"
      }}
    >
      <ModalContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <ModalHeader className="flex flex-col gap-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary-500/20">
              <MdFullscreen className="text-2xl text-primary-500" />
            </div>
            <span className="font-semibold">Trải nghiệm tốt nhất</span>
          </div>
        </ModalHeader>
        <ModalBody className="py-6">
          <p className="text-foreground leading-relaxed">
            Bật <span className="font-semibold text-primary-400">Toàn màn hình</span> để có trải nghiệm xem phim tuyệt vời nhất! 
          </p>
          <p className="text-sm text-foreground/70 leading-relaxed">
            Bạn có thể bật/tắt fullscreen bất kỳ lúc nào bằng nút ở góc trên bên phải.
          </p>
        </ModalBody>
        <ModalFooter className="border-t border-white/10">
          <Button 
            color="default" 
            variant="flat"
            className="bg-white/5 hover:bg-white/10"
            onPress={handleDismiss}
          >
            Để sau
          </Button>
          <Button 
            color="primary" 
            className="bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30"
            onPress={handleEnterFullscreen}
            startContent={<MdFullscreen />}
          >
            Bật toàn màn hình
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FullscreenPrompt;
