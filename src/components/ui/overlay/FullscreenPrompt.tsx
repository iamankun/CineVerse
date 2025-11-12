"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { useFullscreen } from "@mantine/hooks";
import { MdFullscreen } from "react-icons/md";

const FullscreenPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toggle, fullscreen } = useFullscreen();

  // Ensure component is mounted before showing modal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Chỉ hiển thị nếu component đã mount và không ở fullscreen
    if (isMounted && !fullscreen) {
      // Delay 2 giây để người dùng có thời gian nhìn trang
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isMounted, fullscreen]);

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
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <MdFullscreen className="text-2xl text-primary" />
            <span>Trải nghiệm tốt nhất</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-foreground-600">
            Bật <span className="font-semibold text-primary">Toàn màn hình</span> để có trải nghiệm xem phim tuyệt vời nhất! 
          </p>
          <p className="text-sm text-foreground-500">
            Bạn có thể bật/tắt fullscreen bất kỳ lúc nào bằng nút ở góc trên bên phải.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="default" 
            variant="light" 
            onPress={handleDismiss}
          >
            Để sau
          </Button>
          <Button 
            color="primary" 
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
