"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { useDisclosure, useInterval, useLocalStorage } from "@mantine/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
} from "@heroui/react";
import { DISCLAIMER_STORAGE_KEY, IS_BROWSER } from "@/utils/constants";
import { cn } from "@/utils/helpers";

const COUNTDOWN_DURATION = 3;
const MODAL_SIZE = "3xl";
const DISCLAIMER_CONTENT = {
  title: "Tuyên bố Miễn trừ Trách nhiệm",
  paragraphs: [
    {
      id: "welcome",
      content:
        "Chào mừng đến với CineVerse - Website xem phim miễn phí và mã nguồn mở. Vui lòng đọc kỹ tuyên bố này trước khi sử dụng website.",
    },
    {
      id: "purpose",
      content: "CineVerse được phát triển hoàn toàn cho",
      emphasis: "mục đích người việt yêu điện ảnh và chương trình truyền hình.",
      continuation:
        "Website này là dự án mã nguồn nhằm khuyến khích đẩy mạnh các dự án phim và truyền hình bao gồm cả điện ảnh lồng tiếng và phụ đề.",
    },
    {
      id: "content-source",
      content:
        "Tất cả nội dung hiển thị trên CineVerse (bao gồm nhưng không giới hạn ở phim, hình ảnh, poster và thông tin liên quan) được lấy từ",
      emphasis: "các nhà cung cấp bên thứ ba thông qua API TMDB và nhúng nội dung bên thứ 3 như YouTube, Dailymotion và các bên phân phối khác.",
      continuation:
        "Tôi không lưu trữ, phân phối hay host bất kỳ tệp media nào trên server. Website chỉ tổng hợp nội dung đã có sẵn trên internet.",
    },
    {
      id: "responsibility",
      content:
        "Bằng việc sử dụng CineVerse, bạn thừa nhận rằng tôi không chịu trách nhiệm về hành động của người dùng, độ chính xác của nội dung, hoặc bất kỳ thiệt hại trực tiếp hay gián tiếp nào phát sinh từ việc sử dụng website này. Người dùng hoàn toàn chịu trách nhiệm về hành động của mình khi sử dụng dịch vụ. Tôi tôn trọng quyền sở hữu trí tuệ và sẽ phản hồi các yêu cầu hợp pháp từ chủ sở hữu bản quyền để gỡ bỏ nội dung.",
    },
    {
      id: "usage",
      content:
        "Website này đang trong quá trình hoàn thiện nên rất mong bạn thông cảm khi có lỗi diễn ra. Mọi hoạt động bất hợp pháp, bao gồm nhưng không giới hạn ở tải xuống trái phép, phân phối lại nội dung, hoặc sử dụng thương mại đều bị nghiêm cấm. Bằng việc sử dụng CineVerse, bạn đồng ý với các điều khoản này và thừa nhận rằng",
      emphasis: "bạn sử dụng dịch vụ với rủi ro của chính mình.",
    },
  ],
};

interface DisclaimerParagraphProps {
  content: string;
  emphasis?: string;
  continuation?: string;
}

const DisclaimerParagraph: React.FC<DisclaimerParagraphProps> = memo(
  ({ content, emphasis, continuation }) => (
    <p>
      {content}
      {emphasis && (
        <>
          {" "}
          <strong>{emphasis}</strong>
        </>
      )}
      {continuation && ` ${continuation}`}
    </p>
  ),
);

DisclaimerParagraph.displayName = "DisclaimerParagraph";

const Disclaimer: React.FC = () => {
  const [hasAgreed, setHasAgreed] = useLocalStorage<boolean>({
    key: DISCLAIMER_STORAGE_KEY,
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_DURATION);

  const shouldShowModal = useMemo(() => !hasAgreed && IS_BROWSER, [hasAgreed]);

  const [isOpen, { close }] = useDisclosure(shouldShowModal);

  useInterval(() => setSecondsRemaining((prev) => Math.max(0, prev - 1)), 1000, {
    autoInvoke: shouldShowModal && secondsRemaining > 0,
  });

  const isButtonDisabled = secondsRemaining > 0;
  const buttonText = useMemo(
    () => `Đồng ý${isButtonDisabled ? ` (${secondsRemaining})` : ""}`,
    [isButtonDisabled, secondsRemaining],
  );

  const handleAgree = useCallback(() => {
    close();
    setHasAgreed(true);
  }, [close, setHasAgreed]);

  if (hasAgreed || !IS_BROWSER) {
    return null;
  }

  return (
    <Modal
      hideCloseButton
      isOpen={isOpen}
      placement="center"
      backdrop="blur"
      size={MODAL_SIZE}
      isDismissable={false}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-3xl uppercase">
          {DISCLAIMER_CONTENT.title}
        </ModalHeader>

        <ModalBody>
          <ScrollShadow hideScrollBar className="space-y-4">
            {DISCLAIMER_CONTENT.paragraphs.map((paragraph) => (
              <DisclaimerParagraph
                key={paragraph.id}
                content={paragraph.content}
                emphasis={paragraph.emphasis}
                continuation={paragraph.continuation}
              />
            ))}
          </ScrollShadow>
        </ModalBody>

        <ModalFooter className="justify-center">
          <Button
            className={cn(isButtonDisabled && "pointer-events-auto cursor-not-allowed")}
            isDisabled={isButtonDisabled}
            color={isButtonDisabled ? "danger" : "primary"}
            variant="shadow"
            onPress={handleAgree}
          >
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Disclaimer;
