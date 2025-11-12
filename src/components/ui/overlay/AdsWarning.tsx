"use client";

import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
  Link,
} from "@heroui/react";
import { ADS_WARNING_STORAGE_KEY, IS_BROWSER } from "@/utils/constants";

const AdsWarning: React.FC = () => {
  const [seen, setSeen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });
  const [opened, handlers] = useDisclosure(!seen && IS_BROWSER);

  const handleSeen = () => {
    handlers.close();
    setSeen(true);
  };

  if (seen) return null;

  return (
    <Modal
      hideCloseButton
      isOpen={opened}
      placement="center"
      backdrop="blur"
      size="3xl"
      isDismissable={false}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-3xl uppercase">
          Trước khi xem!
        </ModalHeader>
        <ModalBody>
          <ScrollShadow hideScrollBar className="space-y-4">
            <p className="text-center">
              Vì nội dung được lưu trữ bởi nhiều nhà cung cấp bên thứ ba khác nhau, bạn có thể gặp
              quảng cáo pop-up trong khi xem. Để cải thiện trải nghiệm, chúng tôi khuyên bạn sử dụng
              trình chặn quảng cáo như{" "}
              <Link
                showAnchorIcon
                isExternal
                color="danger"
                href="https://ublockorigin.com/"
                underline="hover"
                className="font-semibold"
              >
                uBlock Origin
              </Link>{" "}
              hoặc{" "}
              <Link
                showAnchorIcon
                isExternal
                color="success"
                href="https://adguard.com/"
                underline="hover"
                className="font-semibold"
              >
                AdGuard
              </Link>
              . Xin lưu ý rằng chúng tôi không kiểm soát các quảng cáo được hiển thị và không chịu
              trách nhiệm về nội dung hoặc bất kỳ vấn đề nào chúng có thể gây ra.
            </p>
          </ScrollShadow>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button color="primary" variant="shadow" onPress={handleSeen}>
            Tôi đã hiểu
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AdsWarning;
