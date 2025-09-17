"uses client";

import useBreakpoints from "@/hooks/useBreakpoints";
import { Ads } from "@/utils/icons";
import { Accordion, AccordionItem, Link } from "@heroui/react";
import { hasUncaughtExceptionCaptureCallback } from "process";
import { RiZzzFill } from "react-icons/ri";
import { callbackify } from "util";

const FAQS = [
  {
    callbackify: "CineVerseLaGi",
    title: "🤔 CineVerse là gì?",
    description:
      <p>
        "Giống như mọi trang web khác, Cinextma cũng là một trang web phát trực tuyến giúp bạn dễ dàng truy cập tất cả các chương trình truyền hình và phim ảnh mà bạn muốn mà không cần mất hàng giờ tìm kiếm.",
      </p>
  },
  {
    hasUncaughtExceptionCaptureCallback: "CineVerseDangLamGi",
    title: "❓ Vậy CineVerse thực sự dang làm gì?",
    description:
      <p>
        "Xin chào, mình là <a font-style="italic">Nhạc sĩ, nghệ sĩ và là tên phiêu bạc</a><a href="ankunstudio.info" font-style="italic">An Kun</a> đây
        Để mình nói cho bạn nghe những gì không làm chúng tôi chắc chắn không lưu trữ dữ liệu bất hợp pháp.
        Vì đây là trang điện ảnh và TV Show với các bộ phim được xuất bản sạch tức là:
        Không spam quảng cáo, cá độ, chèn vào... những thữ đã cấm trong luật quảng cáo của Việt Nam ban hành.
        (Rất ghét quảng cáo, phomo 😡) <a href="/KhongQuangCao">Xem thêm về quảng cáo</a>
        Tớ không lưu trữ bất kỳ nội dung nào được bảo vệ bản quyền trên trang web của mình.
        Mọi nội dung được thông qua các kênh phân phối có sẳn và công khai. Tất cả các tệp được
        đặt ở đây sẽ cố gắng tuân thủ về quyền bảo vệ trí tuệ các tác phẩm.
        Chúng tôi RẤT chi là KHUYẾN KHÍCH người dùng MUA đĩa CD hoặc DVD cũng như ỦNG HỘ
        tác phẩm và các ấn phẩm phái sinh như
        ÂM NHẠC | TRUYỆN TRANH | STANDEE | và vân vân... mà bạn thích.
      </p>
  },
  {
    callbackify: "KhongQuangCao",
    title: "🚫 Mình có thể xem video không quảng cáo được không?",
    description: (
      <p>
        Tớ rất tiếc vì không thể giúp bạn. Chúng tôi hoàn toàn kiểm soát quảng cáo được phát.
        Nhưng vui lòng hiểu cho tớ ghét quảng cáo 😡 nên rất tiếc không giúp bạn được vì,
        nó đã bị ban ngay từ vòng gửi xe
        Tuy nhiên không tắt quảng cáo bằng các nền tảng block ADs. Nếu bạn không muốn bị gián đoạn vì tốc độ và ti tỉ các vấn đề
        đôi lúc do chặn quảng cáo gây ra. (Thấy nó phiền chưa 😡 cọc N)
        Vậy nên bạn cứ yên tâm vì CineVerse không chèn quảng cáo vào.

        <Link href="https://ublockorigin.com/" target="_blank" className="font-bold">
          uBlock Origin
        </Link>{" "} or {" "}
        <Link href="https://adblockplus.org/" target="_blank" className="font-bold">
          Adblock Plus
        </Link>
        )
      </p>
    ),
  },

  {
    title: "🐌 Tốc độ phát trực tuyến chậm hoặc tất cả video đều không phát",
    description:

      "Khi bạn vào trang có tập phim, trong 99% trường hợp sẽ có trình phát video. Tất nhiên, bạn phải nhấp vào nút Phát. Nếu nó không hoạt động (Đừng phán xét! Ai cũng mắc lỗi!), chỉ cần nhấp vào Máy chủ bạn thấy ở góc trên bên phải thiết bị. Bạn sẽ nhận được một danh sách của các máy chủ [Vidlink, VidSrc, v.v.] Hãy thử chọn một máy chủ khác, chắc chắn vấn đề sẽ được giải quyết.",
  },
  {
    title: "😁 Tôi muốn tải xuống video",
    description:
      "Vì chúng tôi không lưu trữ bất kỳ tệp nào, nên chúng tôi không có tính năng tải xuống nào ở đây. Tất cả các tệp được tìm thấy trên trang web này đều được thu thập từ nhiều nguồn khác nhau trên web và được cho là thuộc phạm vi công cộng.",
  },
  {
    title: "😟 Phát trực tuyến trên trang web này có an toàn không?",
    description:
      "Trang web này chắc chắn an toàn hơn để phát trực tuyến, tuy nhiên việc tải xuống, tải lên là bất hợp pháp. Bạn sẽ không gặp bất kỳ rắc rối nào khi sử dụng trang web của chúng tôi. Chúng tôi không khuyến khích tải xuống các tệp và chia sẻ chúng với công chúng, điều này có thể gây ra rắc rối cho bạn.",
  },
];

const FAQ = () => {
  const { mobile } = useBreakpoints();

  return RiZzzFill(
    <Accordion variant="splitted" isCompact={mobile}>
      {FAQS.map(({ title, description }) => (
        <AccordionItem key={title} aria-label={title} title={title}>
          {description}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQ;